/**
 * API para modelo de IA local
 * Este módulo implementa una API para utilizar modelos de lenguaje locales como
 * alternativa a servicios en la nube como OpenAI.
 */

const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Configuración del modelo local
const CONFIG = {
  // Opciones de modelos locales
  models: {
    // Opciones recomendadas (ordenadas de menor a mayor tamaño/calidad)
    tiny: {
      name: 'phi-2',  // Microsoft Phi-2 (2.7B parámetros)
      url: 'https://huggingface.co/microsoft/phi-2',
      downloadUrl: 'https://huggingface.co/microsoft/phi-2/resolve/main/model.safetensors',
      quantized: true, // Versión cuantizada para menor uso de memoria
      contextSize: 2048,
      languages: ['en', 'es'],
      requirements: {
        ram: '4GB',
        disk: '2GB'
      }
    },
    small: {
      name: 'mistral-7b-instruct-v0.2',  // Mistral 7B Instruct
      url: 'https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2',
      downloadUrl: 'https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2/resolve/main/model-q4_K_M.gguf',
      quantized: true,
      contextSize: 8192,
      languages: ['en', 'es', 'fr', 'de', 'it'],
      requirements: {
        ram: '8GB',
        disk: '4GB'
      }
    },
    medium: {
      name: 'llama-2-13b-chat',  // Meta Llama 2 13B Chat
      url: 'https://huggingface.co/meta-llama/Llama-2-13b-chat-hf',
      downloadUrl: 'https://huggingface.co/TheBloke/Llama-2-13B-chat-GGUF/resolve/main/llama-2-13b-chat.Q4_K_M.gguf',
      quantized: true,
      contextSize: 4096,
      languages: ['en', 'es', 'fr', 'de', 'it', 'pt'],
      requirements: {
        ram: '16GB',
        disk: '8GB'
      }
    }
  },
  
  // Configuración para el contexto cristiano
  christian: {
    // Instrucción para orientar el modelo hacia respuestas con enfoque cristiano
    instruction: `Eres un asistente virtual cristiano especializado en Misión Juvenil.
    Tus respuestas deben estar basadas en principios bíblicos y valores cristianos.
    Utiliza referencias bíblicas cuando sea apropiado y mantén un tono respetuoso y edificante.
    Evita cualquier contenido que contradiga las enseñanzas cristianas tradicionales.
    Cuando no estés seguro de una respuesta, sugiere buscar orientación en la Biblia o consultar con un líder espiritual.`
  },
  
  // Configuración de la API
  api: {
    port: 3100,
    host: 'localhost',
    endpoints: {
      chat: '/api/local-chat',
      models: '/api/local-models',
      status: '/api/local-status'
    }
  },
  
  // Configuración de caché para reducir procesamiento
  cache: {
    enabled: true,
    file: path.join(__dirname, 'data', 'local-response-cache.json'),
    maxSize: 100 // Número máximo de respuestas en caché
  }
};

// Asegurar que existe el directorio de caché
if (CONFIG.cache.enabled) {
  const cacheDir = path.dirname(CONFIG.cache.file);
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  if (!fs.existsSync(CONFIG.cache.file)) {
    fs.writeFileSync(CONFIG.cache.file, JSON.stringify({}, null, 2));
  }
}

/**
 * Clase para gestionar la API del modelo local
 */
class LocalLLMApi {
  constructor() {
    this.app = express();
    this.cache = CONFIG.cache.enabled ? this._loadCache() : {};
    this.modelProcess = null;
    this.modelStatus = {
      running: false,
      model: null,
      startTime: null,
      requests: 0,
      errors: 0
    };
    
    this._setupMiddleware();
    this._setupRoutes();
  }
  
  /**
   * Configura el middleware para la API
   */
  _setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
  }
  
  /**
   * Configura las rutas de la API
   */
  _setupRoutes() {
    // Ruta para el chat
    this.app.post(CONFIG.api.endpoints.chat, async (req, res) => {
      try {
        const { messages } = req.body;
        
        if (!messages || !Array.isArray(messages)) {
          return res.status(400).json({ 
            error: 'Formato inválido. Se requiere un array de mensajes.' 
          });
        }
        
        // Generar respuesta
        const response = await this.generateResponse(messages);
        
        // Generar preguntas sugeridas
        const lastUserMessage = messages.filter(m => m.role === 'user').pop();
        const suggestedQuestions = this.generateSuggestedQuestions(
          lastUserMessage ? lastUserMessage.content : '',
          response
        );
        
        res.json({ 
          response: response,
          model: this.modelStatus.model,
          suggestedQuestions: suggestedQuestions
        });
      } catch (error) {
        console.error('Error en la API de chat local:', error);
        this.modelStatus.errors++;
        res.status(500).json({ 
          error: 'Error al generar respuesta', 
          details: error.message 
        });
      }
    });
    
    // Ruta para obtener información de los modelos disponibles
    this.app.get(CONFIG.api.endpoints.models, (req, res) => {
      res.json({ 
        models: Object.keys(CONFIG.models).map(key => ({
          id: key,
          name: CONFIG.models[key].name,
          languages: CONFIG.models[key].languages,
          contextSize: CONFIG.models[key].contextSize,
          requirements: CONFIG.models[key].requirements
        }))
      });
    });
    
    // Ruta para obtener el estado del servicio
    this.app.get(CONFIG.api.endpoints.status, (req, res) => {
      res.json({
        status: this.modelStatus.running ? 'running' : 'stopped',
        model: this.modelStatus.model,
        uptime: this.modelStatus.startTime ? 
          Math.floor((Date.now() - this.modelStatus.startTime) / 1000) : 0,
        requests: this.modelStatus.requests,
        errors: this.modelStatus.errors
      });
    });
  }
  
  /**
   * Inicia el servidor API
   */
  start() {
    const { port, host } = CONFIG.api;
    
    return new Promise((resolve, reject) => {
      try {
        const server = this.app.listen(port, host, () => {
          console.log(`Servidor API de modelo local iniciado en http://${host}:${port}`);
          resolve(server);
        });
        
        server.on('error', (error) => {
          console.error('Error al iniciar el servidor API:', error);
          reject(error);
        });
      } catch (error) {
        console.error('Error al iniciar el servidor API:', error);
        reject(error);
      }
    });
  }
  
  /**
   * Carga el caché de respuestas
   * @returns {Object} Caché de respuestas
   */
  _loadCache() {
    try {
      return JSON.parse(fs.readFileSync(CONFIG.cache.file, 'utf8'));
    } catch (error) {
      console.error('Error al cargar el caché:', error);
      return {};
    }
  }
  
  /**
   * Guarda una respuesta en el caché
   * @param {string} key - Clave para identificar la consulta
   * @param {string} response - Respuesta del modelo
   */
  _saveToCache(key, response) {
    if (!CONFIG.cache.enabled) return;

    try {
      this.cache[key] = {
        response,
        timestamp: Date.now()
      };

      // Limitar el tamaño del caché
      const keys = Object.keys(this.cache);
      if (keys.length > CONFIG.cache.maxSize) {
        // Eliminar la entrada más antigua
        const oldestKey = keys.sort((a, b) => 
          this.cache[a].timestamp - this.cache[b].timestamp
        )[0];
        delete this.cache[oldestKey];
      }

      fs.writeFileSync(CONFIG.cache.file, JSON.stringify(this.cache, null, 2));
    } catch (error) {
      console.error('Error al guardar en caché:', error);
    }
  }
  
  /**
   * Genera un hash simple para usar como clave de caché
   * @param {Array} messages - Mensajes de la conversación
   * @returns {string} Hash para usar como clave
   */
  _generateCacheKey(messages) {
    // Simplificación: usar los últimos 2 mensajes como clave
    const relevantMessages = messages.slice(-2);
    return relevantMessages.map(m => `${m.role}:${m.content.substring(0, 100)}`).join('|');
  }
  
  /**
   * Prepara los mensajes para el formato que espera el modelo local
   * @param {Array} messages - Mensajes en formato ChatGPT
   * @returns {string} - Texto formateado para el modelo
   */
  _prepareMessagesForLocalModel(messages) {
    // Añadir la instrucción cristiana al inicio si no existe
    let hasSystemMessage = messages.some(m => m.role === 'system');
    
    const allMessages = hasSystemMessage ? 
      [...messages] : 
      [{ role: 'system', content: CONFIG.christian.instruction }, ...messages];
    
    // Formato para modelos tipo Llama 2 / Mistral
    let formattedText = '';
    
    allMessages.forEach((message, index) => {
      switch (message.role) {
        case 'system':
          formattedText += `<|system|>\n${message.content}\n`;
          break;
        case 'user':
          formattedText += `<|user|>\n${message.content}\n`;
          break;
        case 'assistant':
          formattedText += `<|assistant|>\n${message.content}\n`;
          break;
        default:
          formattedText += `${message.content}\n`;
      }
    });
    
    // Añadir el prompt final para que el modelo sepa que debe generar una respuesta
    formattedText += '<|assistant|>\n';
    
    return formattedText;
  }
  
  /**
   * Genera una respuesta utilizando el modelo local o Hugging Face
   * @param {Array} messages - Mensajes de la conversación
   * @returns {Promise<string>} Respuesta generada
   */
  async generateResponse(messages) {
    // Verificar si la respuesta está en caché
    const cacheKey = this._generateCacheKey(messages);
    if (CONFIG.cache.enabled && this.cache[cacheKey]) {
      console.log('Respuesta recuperada de caché');
      return this.cache[cacheKey].response;
    }
    
    // Incrementar contador de solicitudes
    this.modelStatus.requests++;
    
    // Por ahora, usamos la API de Hugging Face como ejemplo
    // En una implementación real, aquí se conectaría con el modelo local
    try {
      // Preparar el texto para el modelo
      const formattedText = this._prepareMessagesForLocalModel(messages);
      
      // Llamar a la API de Hugging Face (como ejemplo)
      // En una implementación real, esto sería reemplazado por la llamada al modelo local
      const response = await this._callHuggingFaceAPI('mistralai/Mistral-7B-Instruct-v0.2', {
        inputs: formattedText,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true
        }
      });
      
      // Procesar la respuesta
      let generatedText = '';
      if (Array.isArray(response) && response.length > 0) {
        generatedText = response[0].generated_text || '';
      } else if (response.generated_text) {
        generatedText = response.generated_text;
      }
      
      // Limpiar la respuesta (extraer solo la parte generada)
      const assistantPrefix = '<|assistant|>\n';
      const lastAssistantIndex = generatedText.lastIndexOf(assistantPrefix);
      
      if (lastAssistantIndex !== -1) {
        generatedText = generatedText.substring(lastAssistantIndex + assistantPrefix.length).trim();
      }
      
      // Guardar en caché
      this._saveToCache(cacheKey, generatedText);
      
      return generatedText;
    } catch (error) {
      console.error('Error al generar respuesta con el modelo local:', error);
      this.modelStatus.errors++;
      
      // Respuesta de emergencia si el modelo falla
      return "Lo siento, estoy teniendo dificultades para procesar tu solicitud en este momento. Por favor, intenta nuevamente más tarde o reformula tu pregunta de otra manera.";
    }
  }
  
  /**
   * Realiza una llamada a la API de Hugging Face (ejemplo)
   * @param {string} model - Nombre del modelo a utilizar
   * @param {Object} payload - Datos para enviar a la API
   * @returns {Promise<Object>} Respuesta de la API
   */
  async _callHuggingFaceAPI(model, payload) {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Añadir token de autorización si está disponible
    const token = process.env.HUGGINGFACE_TOKEN;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
        timeout: 60000 // 60 segundos de timeout
      });

      if (!response.ok) {
        throw new Error(`Error en la API: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error al llamar a la API de Hugging Face (${model}):`, error);
      throw error;
    }
  }
  
  /**
   * Genera preguntas sugeridas basadas en el contexto
   * @param {string} userQuery - Consulta del usuario
   * @param {string} botResponse - Respuesta del bot
   * @returns {Array} Lista de preguntas sugeridas
   */
  generateSuggestedQuestions(userQuery, botResponse) {
    // Preguntas generales relacionadas con temas cristianos
    const christianQuestions = [
      "¿Qué dice la Biblia sobre el propósito de los jóvenes?",
      "¿Cómo puedo fortalecer mi fe?",
      "¿Qué actividades ofrece Misión Juvenil para crecer espiritualmente?",
      "¿Cómo puedo servir en la iglesia siendo joven?",
      "¿Qué enseña Jesús sobre el liderazgo?"
    ];
    
    // Preguntas específicas basadas en palabras clave
    let contextQuestions = [];
    
    const combinedText = (userQuery + ' ' + botResponse).toLowerCase();
    
    if (combinedText.includes('biblia') || combinedText.includes('escritura') || 
        combinedText.includes('versículo') || combinedText.includes('versiculo')) {
      contextQuestions.push("¿Puedes recomendarme un plan de lectura bíblica?");
      contextQuestions.push("¿Cuáles son los versículos clave para jóvenes?");
    }
    
    if (combinedText.includes('oración') || combinedText.includes('oracion') || 
        combinedText.includes('rezar') || combinedText.includes('orar')) {
      contextQuestions.push("¿Cómo puedo mejorar mi vida de oración?");
      contextQuestions.push("¿Tienes alguna guía para orar efectivamente?");
    }
    
    if (combinedText.includes('evento') || combinedText.includes('actividad') || 
        combinedText.includes('reunión') || combinedText.includes('reunion')) {
      contextQuestions.push("¿Cuál es el próximo evento de Misión Juvenil?");
      contextQuestions.push("¿Cómo puedo participar en las actividades?");
    }
    
    if (combinedText.includes('líder') || combinedText.includes('lider') || 
        combinedText.includes('liderazgo') || combinedText.includes('servir')) {
      contextQuestions.push("¿Cómo puedo convertirme en líder en Misión Juvenil?");
      contextQuestions.push("¿Qué cualidades debe tener un líder cristiano?");
    }
    
    // Combinar y limitar las preguntas sugeridas
    const allQuestions = [...contextQuestions, ...christianQuestions];
    return allQuestions.slice(0, 3); // Limitar a 3 preguntas sugeridas
  }
}

// Exportar la clase para su uso en otros módulos
module.exports = new LocalLLMApi();