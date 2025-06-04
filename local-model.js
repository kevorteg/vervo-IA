/**
 * Módulo para implementar un modelo de lenguaje local como alternativa a OpenAI
 * Utiliza Hugging Face Inference API (gratuita con límites) o modelos locales
 */

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Configuración del modelo
const CONFIG = {
  // Hugging Face Inference API (gratuita con límites)
  huggingface: {
    apiUrl: 'https://api-inference.huggingface.co/models/',
    // Modelos recomendados con buen rendimiento y enfoque en español
    models: {
      primary: 'google/flan-t5-base', // Modelo más accesible
      fallback: 'gpt2', // Alternativa muy accesible
      tertiary: 'facebook/bart-large-cnn' // Tercera opción
    },
    // Token de acceso (opcional, se puede usar API sin token con más limitaciones)
    // Registrarse en https://huggingface.co/ para obtener un token gratuito
    token: process.env.HUGGINGFACE_TOKEN || ''
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
  // Configuración de caché para reducir llamadas a la API
  cache: {
    enabled: true,
    file: path.join(__dirname, 'data', 'response-cache.json'),
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
 * Clase para manejar el modelo de lenguaje local o remoto
 */
class LocalLanguageModel {
  constructor() {
    this.cache = CONFIG.cache.enabled ? this._loadCache() : {};
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
   * Realiza una llamada a la API de Hugging Face
   * @param {string} model - Nombre del modelo a utilizar
   * @param {Object} payload - Datos para enviar a la API
   * @returns {Promise<Object>} Respuesta de la API
   */
  async _callHuggingFaceAPI(model, payload) {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Añadir token de autorización si está disponible
    if (CONFIG.huggingface.token) {
      headers['Authorization'] = `Bearer ${CONFIG.huggingface.token}`;
    }

    try {
      const response = await fetch(`${CONFIG.huggingface.apiUrl}${model}`, {
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
   * Prepara los mensajes para el formato que espera Hugging Face
   * @param {Array} messages - Mensajes en formato ChatGPT
   * @returns {string} - Texto formateado para el modelo
   */
  _prepareMessagesForHuggingFace(messages) {
    // Añadir la instrucción cristiana al inicio
    const allMessages = [
      { role: 'system', content: CONFIG.christian.instruction },
      ...messages
    ];

    // Determinar el formato según el modelo que se va a usar
    // Para modelos T5, BART y GPT-2, usamos un formato más simple
    let formattedText = '';
    
    // Primero añadimos la instrucción del sistema
    formattedText += `Instrucción: ${CONFIG.christian.instruction}\n\n`;
    
    // Luego añadimos la conversación
    allMessages.forEach((message, index) => {
      if (index === 0 && message.role === 'system') return; // Ya añadimos la instrucción
      
      switch (message.role) {
        case 'system':
          formattedText += `Contexto: ${message.content}\n\n`;
          break;
        case 'user':
          formattedText += `Usuario: ${message.content}\n\n`;
          break;
        case 'assistant':
          formattedText += `Asistente: ${message.content}\n\n`;
          break;
        default:
          formattedText += `${message.content}\n\n`;
      }
    });
    
    // Añadir el prompt final para que el modelo sepa que debe generar una respuesta
    formattedText += 'Asistente: ';
    
    return formattedText;
  }

  /**
   * Genera una respuesta utilizando el modelo de Hugging Face
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

    // Preparar el texto para el modelo
    const formattedText = this._prepareMessagesForHuggingFace(messages);

    // Función para procesar la respuesta del modelo
    const processModelResponse = (result) => {
      let generatedText = '';
      if (Array.isArray(result) && result.length > 0) {
        generatedText = result[0].generated_text || '';
      } else if (result.generated_text) {
        generatedText = result.generated_text;
      }

      // Limpiar la respuesta (extraer solo la parte generada)
      const assistantPrefix = '<|assistant|>\n';
      const lastAssistantIndex = generatedText.lastIndexOf(assistantPrefix);
      
      if (lastAssistantIndex !== -1) {
        generatedText = generatedText.substring(lastAssistantIndex + assistantPrefix.length).trim();
      }

      return generatedText;
    };

    // Intentar con el modelo principal
    try {
      const payload = {
        inputs: formattedText,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true
        }
      };

      console.log(`Intentando con modelo principal: ${CONFIG.huggingface.models.primary}`);
      const result = await this._callHuggingFaceAPI(
        CONFIG.huggingface.models.primary, 
        payload
      );

      const generatedText = processModelResponse(result);
      this._saveToCache(cacheKey, generatedText);
      return generatedText;
    } catch (error) {
      console.error(`Error con el modelo principal (${CONFIG.huggingface.models.primary}):`, error);
      
      // Intentar con el modelo de respaldo
      try {
        const payload = {
          inputs: formattedText,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.7
          }
        };

        console.log(`Intentando con modelo de respaldo: ${CONFIG.huggingface.models.fallback}`);
        const result = await this._callHuggingFaceAPI(
          CONFIG.huggingface.models.fallback, 
          payload
        );

        const generatedText = processModelResponse(result);
        this._saveToCache(cacheKey, generatedText);
        return generatedText;
      } catch (fallbackError) {
        console.error(`Error con el modelo de respaldo (${CONFIG.huggingface.models.fallback}):`, fallbackError);
        
        // Intentar con el modelo terciario como última opción
        try {
          const payload = {
            inputs: formattedText,
            parameters: {
              max_new_tokens: 500,
              temperature: 0.8
            }
          };

          console.log(`Intentando con modelo terciario: ${CONFIG.huggingface.models.tertiary}`);
          const result = await this._callHuggingFaceAPI(
            CONFIG.huggingface.models.tertiary, 
            payload
          );

          const generatedText = processModelResponse(result);
          this._saveToCache(cacheKey, generatedText);
          return generatedText;
        } catch (tertiaryError) {
          console.error(`Error con el modelo terciario (${CONFIG.huggingface.models.tertiary}):`, tertiaryError);
          
          // Respuesta de emergencia si todos los modelos fallan
          return "Lo siento, estoy teniendo dificultades para procesar tu solicitud en este momento. Por favor, intenta nuevamente más tarde o reformula tu pregunta de otra manera.";
        }
      }
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

module.exports = new LocalLanguageModel();