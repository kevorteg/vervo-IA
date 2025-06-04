/**
 * Integración con Ollama para modelos de IA locales
 * Este módulo permite utilizar modelos de lenguaje locales a través de Ollama
 * como alternativa a servicios en la nube como OpenAI.
 * 
 * Ollama es una herramienta que facilita la ejecución de modelos de IA localmente
 * con una API simple y compatible con múltiples modelos.
 */

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Configuración de Ollama
const CONFIG = {
  // URL base de la API de Ollama (por defecto se ejecuta en localhost:11434)
  apiUrl: 'http://localhost:11434',
  
  // Modelos recomendados (ordenados de menor a mayor tamaño/calidad)
  models: {
    tiny: {
      name: 'phi',  // Microsoft Phi-2 (2.7B parámetros)
      description: 'Modelo ligero de Microsoft (2.7B parámetros)',
      contextSize: 2048,
      requirements: {
        ram: '4GB',
        disk: '2GB'
      }
    },
    small: {
      name: 'mistral',  // Mistral 7B
      description: 'Modelo Mistral 7B, buen equilibrio entre tamaño y rendimiento',
      contextSize: 8192,
      requirements: {
        ram: '8GB',
        disk: '4GB'
      }
    },
    medium: {
      name: 'llama2',  // Meta Llama 2
      description: 'Modelo Llama 2 de Meta, alto rendimiento',
      contextSize: 4096,
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
  
  // Configuración de caché para reducir procesamiento
  cache: {
    enabled: true,
    file: path.join(__dirname, 'data', 'ollama-response-cache.json'),
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
 * Clase para manejar la integración con Ollama
 */
class OllamaIntegration {
  constructor() {
    this.cache = CONFIG.cache.enabled ? this._loadCache() : {};
    this.modelName = CONFIG.models.tiny.name; // Modelo por defecto (el más ligero)
  }

  /**
   * Carga el caché de respuestas
   * @returns {Object} Caché de respuestas
   */
  _loadCache() {
    try {
      return JSON.parse(fs.readFileSync(CONFIG.cache.file, 'utf8'));
    } catch (error) {
      console.error('Error al cargar el caché de Ollama:', error);
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
      console.error('Error al guardar en caché de Ollama:', error);
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
   * Prepara los mensajes para el formato que espera Ollama
   * @param {Array} messages - Mensajes en formato ChatGPT
   * @returns {Object} - Payload para la API de Ollama
   */
  _prepareMessagesForOllama(messages) {
    // Añadir la instrucción cristiana al inicio si no existe
    let hasSystemMessage = messages.some(m => m.role === 'system');
    
    const allMessages = hasSystemMessage ? 
      [...messages] : 
      [{ role: 'system', content: CONFIG.christian.instruction }, ...messages];
    
    // Convertir al formato que espera Ollama
    return {
      model: this.modelName,
      messages: allMessages,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 500
      }
    };
  }

  /**
   * Verifica si Ollama está disponible y funcionando
   * @returns {Promise<boolean>} - true si Ollama está disponible
   */
  async isAvailable() {
    try {
      const response = await fetch(`${CONFIG.apiUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`Error al verificar Ollama: ${response.status}`);
      }
      return true;
    } catch (error) {
      console.error('Ollama no está disponible:', error.message);
      return false;
    }
  }

  /**
   * Verifica si un modelo específico está disponible en Ollama
   * @param {string} modelName - Nombre del modelo a verificar
   * @returns {Promise<boolean>} - true si el modelo está disponible
   */
  async isModelAvailable(modelName) {
    try {
      const response = await fetch(`${CONFIG.apiUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`Error al verificar modelos: ${response.status}`);
      }
      
      const data = await response.json();
      return data.models && data.models.some(m => m.name === modelName);
    } catch (error) {
      console.error(`Error al verificar disponibilidad del modelo ${modelName}:`, error.message);
      return false;
    }
  }

  /**
   * Genera una respuesta utilizando Ollama
   * @param {Array} messages - Mensajes de la conversación
   * @returns {Promise<string>} Respuesta generada
   */
  async generateResponse(messages) {
    // Verificar si Ollama está disponible
    const available = await this.isAvailable();
    if (!available) {
      throw new Error('Ollama no está disponible');
    }

    // Verificar si la respuesta está en caché
    const cacheKey = this._generateCacheKey(messages);
    if (CONFIG.cache.enabled && this.cache[cacheKey]) {
      console.log('Respuesta recuperada de caché de Ollama');
      return this.cache[cacheKey].response;
    }

    // Intentar con diferentes modelos, empezando por el más ligero
    const modelOptions = Object.keys(CONFIG.models);
    
    for (const modelOption of modelOptions) {
      this.modelName = CONFIG.models[modelOption].name;
      
      try {
        // Verificar si el modelo está disponible
        const modelAvailable = await this.isModelAvailable(this.modelName);
        if (!modelAvailable) {
          console.log(`Modelo ${this.modelName} no disponible, intentando descargar...`);
          
          // Intentar descargar el modelo
          try {
            await fetch(`${CONFIG.apiUrl}/api/pull`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: this.modelName }),
              timeout: 30000 // 30 segundos de timeout para la descarga
            });
            console.log(`Modelo ${this.modelName} descargado correctamente`);
          } catch (downloadError) {
            console.error(`Error al descargar modelo ${this.modelName}:`, downloadError.message);
            continue; // Probar con el siguiente modelo
          }
        }
        
        // Preparar los mensajes para Ollama
        const payload = this._prepareMessagesForOllama(messages);
        
        // Llamar a la API de Ollama
        const response = await fetch(`${CONFIG.apiUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          timeout: 60000 // 60 segundos de timeout
        });
        
        if (!response.ok) {
          throw new Error(`Error en la API de Ollama: ${response.status}`);
        }
        
        const data = await response.json();
        const generatedText = data.message?.content || '';
        
        // Guardar en caché
        this._saveToCache(cacheKey, generatedText);
        
        return generatedText;
      } catch (error) {
        console.error(`Error con el modelo ${this.modelName}:`, error.message);
        // Continuar con el siguiente modelo
      }
    }
    
    // Si todos los modelos fallan
    throw new Error('No se pudo generar respuesta con ningún modelo de Ollama');
  }

  /**
   * Genera preguntas sugeridas basadas en el contexto de la conversación
   * @param {string} userQuery - Pregunta del usuario
   * @param {string} botResponse - Respuesta del bot
   * @returns {Array} - Lista de preguntas sugeridas
   */
  generateSuggestedQuestions(userQuery, botResponse) {
    // Preguntas generales que siempre pueden ser relevantes
    const generalQuestions = [
      "¿Cuáles son los próximos eventos de Misión Juvenil?",
      "¿Cómo puedo unirme a Misión Juvenil?",
      "¿Qué programas de formación ofrecen?"
    ];
    
    // Preguntas específicas basadas en el contexto
    let contextQuestions = [];
    
    // Lógica simple para generar preguntas basadas en palabras clave
    if (userQuery.toLowerCase().includes('evento') || botResponse.toLowerCase().includes('evento')) {
      contextQuestions.push("¿Dónde será el próximo evento?");
      contextQuestions.push("¿Cuál es el costo de participación?");
    }
    
    if (userQuery.toLowerCase().includes('líder') || botResponse.toLowerCase().includes('líder') || 
        userQuery.toLowerCase().includes('lider') || botResponse.toLowerCase().includes('lider')) {
      contextQuestions.push("¿Cómo puedo convertirme en líder?");
      contextQuestions.push("¿Qué capacitaciones ofrecen para líderes?");
    }
    
    // Combinar y limitar las preguntas sugeridas
    const allQuestions = [...contextQuestions, ...generalQuestions];
    return allQuestions.slice(0, 3); // Limitar a 3 preguntas sugeridas
  }
}

// Exportar una instancia única
module.exports = new OllamaIntegration();