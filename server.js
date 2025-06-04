const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { saveFeedback, getFeedback, generateFeedbackReport } = require('./feedback-system');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuración de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Configuración de DeepSeek
const DEEPSEEK_API_KEY = process.env.OPENAI_API_KEY; // Usando la misma variable de entorno
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Endpoint para procesar mensajes del chatbot
app.post('/api/chat', async (req, res) => {
  try {
    const { message, chatHistory } = req.body;
    const messageId = uuidv4(); // Generar ID único para este mensaje
    
    // Preparar el historial de conversación para OpenAI
    const messages = [
      { role: 'system', content: 'Eres un asistente virtual con enfoque cristiano que puede responder sobre diversos temas.\nHas sido entrenado con la siguiente información:\n1 archivo(s) Excel procesado(s), 1 documento(s) Word procesado(s), 1 archivo(s) PDF procesado(s), datos estructurados de eventos, FAQ y glosario de términos específicos.\n\nPuedes responder preguntas sobre Misión Juvenil, sus líderes, programas y actividades, pero también tienes conocimiento general sobre otros temas desde una perspectiva cristiana.\nSé amable, informativo y preciso en todas tus respuestas.\nCuando te pregunten sobre eventos de Misión Juvenil, proporciona detalles específicos como fechas, lugares y requisitos.\nUtiliza el glosario de términos para entender el contexto específico de Misión Juvenil cuando sea relevante, pero no te limites solo a ese tema.' },
      ...chatHistory,
      { role: 'user', content: message }
    ];

    // Usar OpenAI o DeepSeek para generar respuestas (WebLLM se usa en el navegador)
    let botResponse;
    let modelSource = 'openai';
    
    try {
      // Intentar primero con OpenAI
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: messages,
          max_tokens: 500,
          temperature: 0.7,
        });

        botResponse = completion.choices[0].message.content;
        modelSource = 'openai';
        console.log('Respuesta generada con OpenAI');
      } catch (openaiError) {
        console.error('Error al generar respuesta con OpenAI, intentando con DeepSeek:', openaiError);
        
        // Si falla OpenAI, intentar con DeepSeek
        const deepseekResponse = await callDeepSeekAPI(messages);
        botResponse = deepseekResponse;
        modelSource = 'deepseek';
        console.log('Respuesta generada con DeepSeek');
      }
    } catch (error) {
      console.error('Error al generar respuesta con todos los proveedores:', error);
      throw error;
    }
    
    // Generar preguntas sugeridas
    const suggestedQuestions = generateSuggestedQuestions(message, botResponse);
    
    // Enviar respuesta al cliente con el ID del mensaje para feedback
    res.json({ 
      messageId: messageId,
      response: botResponse,
      role: 'assistant',
      suggestedQuestions: suggestedQuestions
    });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});

// Endpoint para recibir retroalimentación
app.post('/api/feedback', async (req, res) => {
  try {
    const { messageId, isHelpful, comment, userQuery, botResponse } = req.body;
    
    // Guardar la retroalimentación
    const success = await saveFeedback(messageId, isHelpful, comment, userQuery, botResponse);
    
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ success: false, error: 'Error al guardar la retroalimentación' });
    }
  } catch (error) {
    console.error('Error al procesar la retroalimentación:', error);
    res.status(500).json({ success: false, error: 'Error al procesar la retroalimentación' });
  }
});

// Endpoint para obtener informe de retroalimentación (protegido)
app.get('/api/feedback/report', (req, res) => {
  // Aquí se podría añadir autenticación para proteger este endpoint
  const report = generateFeedbackReport();
  if (report) {
    res.json(report);
  } else {
    res.status(500).json({ error: 'Error al generar el informe' });
  }
});

/**
 * Genera preguntas sugeridas basadas en el contexto de la conversación
 * @param {string} userQuery - Pregunta del usuario
 * @param {string} botResponse - Respuesta del bot
 * @returns {Array} - Lista de preguntas sugeridas
 */
function generateSuggestedQuestions(userQuery, botResponse) {
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

/**
 * Función para llamar a la API de DeepSeek
 * @param {Array} messages - Mensajes de la conversación
 * @returns {Promise<string>} - Respuesta generada
 */
async function callDeepSeekAPI(messages) {
  try {
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: 'deepseek-chat',  // O el modelo específico que quieras usar
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error al llamar a la API de DeepSeek:', error.response?.data || error.message);
    throw new Error('No se pudo generar una respuesta con DeepSeek');
  }
}

// Puerto del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});