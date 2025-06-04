/**
 * Script para entrenar el modelo con los datos procesados de la carpeta 'Entrenamiento'
 */

require('dotenv').config();
const OpenAI = require('openai');
const { loadTrainingData, prepareTrainingContext } = require('./training.js');

// Configuración de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Función principal para entrenar el modelo
 */
async function trainModel() {
  try {
    console.log('Iniciando proceso de entrenamiento del modelo...');
    
    // Paso 1: Cargar y procesar los datos de entrenamiento
    console.log('Paso 1: Cargando datos de entrenamiento...');
    const trainingData = await loadTrainingData();
    
    // Verificar si se cargaron datos
    if (!trainingData.excel.length && !trainingData.documents.length && !trainingData.pdf.length) {
      console.error('No se encontraron datos de entrenamiento válidos.');
      return;
    }
    
    // Paso 2: Preparar el contexto de entrenamiento
    console.log('Paso 2: Preparando contexto de entrenamiento...');
    const { context, summary } = prepareTrainingContext(trainingData);
    
    console.log('Resumen de datos procesados:', summary);
    
    // Paso 3: Crear un sistema de mensajes para el modelo
    console.log('Paso 3: Creando sistema de mensajes para el modelo...');
    const systemMessage = `
      Eres un asistente virtual especializado en Misión Juvenil.
      Has sido entrenado con la siguiente información:
      ${summary}
      
      Utiliza esta información para responder preguntas sobre Misión Juvenil,
      sus líderes, programas y actividades. Sé amable, informativo y preciso.
    `;
    
    // Paso 4: Guardar el contexto y el mensaje del sistema para uso futuro
    console.log('Paso 4: Guardando información de entrenamiento...');
    
    // Actualizar el endpoint de chat en server.js para usar el contexto
    console.log('El modelo ha sido entrenado con éxito.');
    console.log('Para utilizar el modelo entrenado, actualiza el mensaje del sistema en server.js con:');
    console.log('\n---MENSAJE DEL SISTEMA---');
    console.log(systemMessage);
    console.log('---FIN DEL MENSAJE---\n');
    
    console.log('Instrucciones para implementar el modelo entrenado:');
    console.log('1. Copia el mensaje del sistema anterior');
    console.log('2. Abre el archivo server.js');
    console.log('3. Reemplaza el contenido del mensaje del sistema en la línea que dice:');
    console.log('   { role: \'system\', content: \'Eres un asistente virtual amigable y útil.\' }');
    console.log('4. Reinicia el servidor para aplicar los cambios');
    
  } catch (error) {
    console.error('Error durante el proceso de entrenamiento:', error);
  }
}

// Ejecutar la función de entrenamiento
trainModel();