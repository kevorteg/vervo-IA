/**
 * Integración con WebLLM para modelos de IA en el navegador
 * Este módulo permite utilizar modelos de lenguaje directamente en el navegador
 * sin necesidad de un servidor para la inferencia.
 */

// Clase para manejar la integración con WebLLM
class WebLLMIntegration {
  constructor() {
    this.engine = null;
    this.modelLoaded = false;
    this.modelLoadPromise = null;
    this.modelName = 'Phi-2'; // Modelo por defecto
    this.progressCallback = null;
    this.statusCallback = null;
  }

  /**
   * Inicializa el motor de WebLLM
   * @param {Function} progressCallback - Función para reportar progreso de carga
   * @param {Function} statusCallback - Función para reportar estado del modelo
   */
  async initialize(progressCallback = null, statusCallback = null) {
    this.progressCallback = progressCallback;
    this.statusCallback = statusCallback;

    try {
      // Cargar WebLLM desde CDN si no está disponible
      if (typeof webllm === 'undefined') {
        await this.loadScript('https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.11/dist/index.js');
      }
      
      if (this.statusCallback) {
        this.statusCallback('Inicializando motor de WebLLM...');
      }

      // Crear el motor de WebLLM
      this.engine = await webllm.CreateMLCEngine();
      
      // Configurar callback de progreso
      if (this.progressCallback) {
        this.engine.setProgressCallback((report) => {
          const progress = Math.round(report.progress * 100);
          this.progressCallback(progress, report.text);
        });
      }

      return true;
    } catch (error) {
      console.error('Error al inicializar WebLLM:', error);
      if (this.statusCallback) {
        this.statusCallback(`Error al inicializar: ${error.message}`);
      }
      return false;
    }
  }

  /**
   * Carga un modelo específico
   * @param {string} modelName - Nombre del modelo a cargar
   */
  async loadModel(modelName = null) {
    if (!this.engine) {
      await this.initialize();
    }

    if (modelName) {
      this.modelName = modelName;
    }

    if (this.modelLoadPromise) {
      return this.modelLoadPromise;
    }

    try {
      if (this.statusCallback) {
        this.statusCallback(`Cargando modelo ${this.modelName}...`);
      }

      this.modelLoadPromise = this.engine.loadModel(this.modelName);
      await this.modelLoadPromise;
      
      this.modelLoaded = true;
      
      if (this.statusCallback) {
        this.statusCallback(`Modelo ${this.modelName} cargado correctamente`);
      }
      
      return true;
    } catch (error) {
      console.error(`Error al cargar el modelo ${this.modelName}:`, error);
      this.modelLoadPromise = null;
      
      if (this.statusCallback) {
        this.statusCallback(`Error al cargar el modelo: ${error.message}`);
      }
      
      return false;
    }
  }

  /**
   * Genera una respuesta utilizando el modelo cargado
   * @param {Array} messages - Mensajes de la conversación en formato ChatGPT
   * @returns {Promise<string>} Respuesta generada
   */
  async generateResponse(messages) {
    if (!this.engine || !this.modelLoaded) {
      await this.loadModel();
    }

    try {
      // Preparar los mensajes en el formato que espera WebLLM
      const formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Generar respuesta
      const response = await this.engine.chat.completions.create({
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 500
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error al generar respuesta con WebLLM:', error);
      throw error;
    }
  }

  /**
   * Obtiene la lista de modelos disponibles
   * @returns {Promise<Array>} Lista de modelos disponibles
   */
  async getAvailableModels() {
    if (!this.engine) {
      await this.initialize();
    }

    try {
      const modelList = await this.engine.getModelList();
      return modelList;
    } catch (error) {
      console.error('Error al obtener la lista de modelos:', error);
      return [];
    }
  }
  
  /**
   * Carga un script externo
   * @param {string} src - URL del script a cargar
   * @returns {Promise} Promesa que se resuelve cuando el script está cargado
   */
  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
}

// Exportar la clase para su uso en otros módulos
window.WebLLMIntegration = new WebLLMIntegration();