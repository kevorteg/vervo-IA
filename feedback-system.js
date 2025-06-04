/**
 * Sistema de retroalimentación para el chatbot de Misión Juvenil
 * Este módulo permite recopilar y almacenar feedback de los usuarios
 * sobre las respuestas del chatbot para mejorar su rendimiento.
 */

const fs = require('fs');
const path = require('path');

// Ruta al archivo de retroalimentación
const FEEDBACK_FILE = path.join(__dirname, 'data', 'feedback.json');

// Asegurar que el directorio data existe
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}

// Asegurar que el archivo de retroalimentación existe
if (!fs.existsSync(FEEDBACK_FILE)) {
  fs.writeFileSync(FEEDBACK_FILE, JSON.stringify([], null, 2));
}

/**
 * Guarda la retroalimentación de un usuario sobre una respuesta del chatbot
 * @param {string} messageId - Identificador único del mensaje
 * @param {boolean} isHelpful - Si la respuesta fue útil o no
 * @param {string} comment - Comentario opcional del usuario
 * @param {string} userQuery - La pregunta original del usuario
 * @param {string} botResponse - La respuesta del chatbot
 * @returns {Promise<boolean>} - Éxito de la operación
 */
async function saveFeedback(messageId, isHelpful, comment = '', userQuery, botResponse) {
  try {
    // Leer el archivo actual de retroalimentación
    const feedbackData = JSON.parse(fs.readFileSync(FEEDBACK_FILE));
    
    // Crear el objeto de retroalimentación
    const feedback = {
      id: messageId,
      timestamp: new Date().toISOString(),
      isHelpful,
      comment,
      userQuery,
      botResponse,
      processed: false // Indica si esta retroalimentación ya ha sido procesada para mejorar el modelo
    };
    
    // Añadir la nueva retroalimentación
    feedbackData.push(feedback);
    
    // Guardar el archivo actualizado
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(feedbackData, null, 2));
    
    // Si la retroalimentación es negativa, registrarla en un archivo separado para revisión prioritaria
    if (!isHelpful) {
      logNegativeFeedback(feedback);
    }
    
    return true;
  } catch (error) {
    console.error('Error al guardar la retroalimentación:', error);
    return false;
  }
}

/**
 * Registra retroalimentación negativa para revisión prioritaria
 * @param {Object} feedback - Objeto de retroalimentación
 */
function logNegativeFeedback(feedback) {
  const NEGATIVE_FEEDBACK_FILE = path.join(__dirname, 'data', 'negative_feedback.json');
  
  // Asegurar que el archivo existe
  if (!fs.existsSync(NEGATIVE_FEEDBACK_FILE)) {
    fs.writeFileSync(NEGATIVE_FEEDBACK_FILE, JSON.stringify([], null, 2));
  }
  
  // Leer el archivo actual
  const negativeData = JSON.parse(fs.readFileSync(NEGATIVE_FEEDBACK_FILE));
  
  // Añadir la nueva retroalimentación negativa
  negativeData.push(feedback);
  
  // Guardar el archivo actualizado
  fs.writeFileSync(NEGATIVE_FEEDBACK_FILE, JSON.stringify(negativeData, null, 2));
}

/**
 * Obtiene todas las retroalimentaciones almacenadas
 * @param {boolean} onlyNegative - Si solo se deben devolver las retroalimentaciones negativas
 * @returns {Array} - Lista de retroalimentaciones
 */
function getFeedback(onlyNegative = false) {
  try {
    const feedbackData = JSON.parse(fs.readFileSync(FEEDBACK_FILE));
    
    if (onlyNegative) {
      return feedbackData.filter(item => !item.isHelpful);
    }
    
    return feedbackData;
  } catch (error) {
    console.error('Error al obtener la retroalimentación:', error);
    return [];
  }
}

/**
 * Genera un informe de retroalimentación para análisis
 * @returns {Object} - Estadísticas de retroalimentación
 */
function generateFeedbackReport() {
  try {
    const feedbackData = JSON.parse(fs.readFileSync(FEEDBACK_FILE));
    
    // Calcular estadísticas
    const totalFeedback = feedbackData.length;
    const positiveFeedback = feedbackData.filter(item => item.isHelpful).length;
    const negativeFeedback = totalFeedback - positiveFeedback;
    
    // Calcular porcentajes
    const positivePercentage = totalFeedback > 0 ? (positiveFeedback / totalFeedback) * 100 : 0;
    const negativePercentage = totalFeedback > 0 ? (negativeFeedback / totalFeedback) * 100 : 0;
    
    // Identificar temas comunes en retroalimentación negativa
    const negativeComments = feedbackData
      .filter(item => !item.isHelpful && item.comment)
      .map(item => item.comment);
    
    return {
      totalFeedback,
      positiveFeedback,
      negativeFeedback,
      positivePercentage,
      negativePercentage,
      negativeComments,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error al generar el informe de retroalimentación:', error);
    return null;
  }
}

module.exports = {
  saveFeedback,
  getFeedback,
  generateFeedbackReport
};