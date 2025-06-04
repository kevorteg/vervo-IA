document.addEventListener('DOMContentLoaded', function() {
  // Elementos del DOM
  const userInput = document.getElementById('user-input');
  const sendButton = document.getElementById('send-btn');
  const chatMessages = document.getElementById('chat-messages');
  const newChatBtn = document.getElementById('new-chat-btn');
  const conversationsList = document.getElementById('conversations-list');
  
  // Historial de chat para enviar al servidor
  let chatHistory = [];
  let conversations = [
    { id: 'default', name: 'Conversación actual', messages: [] }
  ];
  let currentConversationId = 'default';
  
  // Estado de WebLLM
  let useWebLLM = true;
  let webLLMInitialized = false;
  let webLLMLoading = false;
  
  // Inicializar eventos para gestión de conversaciones
  initConversationEvents();
  
  // Crear la interfaz Aurora Celestial
  createAuroraInterface();
  
  // Función para crear la interfaz Aurora Celestial
  function createAuroraInterface() {
    const auroraInterface = document.createElement('div');
    auroraInterface.className = 'aurora-interface fade-in';
    
    // Agregar el diálogo de Aurora Celestial
    const auroraDialog = document.createElement('div');
    auroraDialog.className = 'aurora-dialog';
    auroraDialog.innerHTML = `
     <div class="aurora-content">
  <img src="logo_blanco.png" alt="Lucero Avatar" class="aurora-avatar">
  <div class="aurora-message">
    <p>✨ ¡Hola, alma valiente! ✨</p>
    <p>Estoy aquí para escucharte, guiarte y orar contigo. 💬🙏</p>
  </div>
  <button id="start-chat-btn" class="aurora-button">Comencemos esta travesía</button>
</div>

    `;
    auroraInterface.appendChild(auroraDialog);
    
    document.body.appendChild(auroraInterface);
    
    // Evento para iniciar el chat
    document.getElementById('start-chat-btn').addEventListener('click', function() {
      auroraInterface.style.opacity = '0';
      setTimeout(() => {
        auroraInterface.remove();
        // Inicializar WebLLM después de que el usuario inicie el chat
        if (useWebLLM && !webLLMInitialized && !webLLMLoading) {
          initializeWebLLM();
        }
      }, 500);
    });
    
    // Eventos para los botones de login y signup (solo para demostración)
    document.getElementById('login-btn').addEventListener('click', function() {
      alert('Funcionalidad de inicio de sesión en desarrollo');
    });
    
    document.getElementById('signup-btn').addEventListener('click', function() {
      alert('Funcionalidad de registro en desarrollo');
    });
  }
  
  // Función para inicializar WebLLM
  async function initializeWebLLM() {
    webLLMLoading = true;
    
    // Mostrar mensaje de carga
    const loadingMessage = addMessageToChat('bot', '<i class="fas fa-spinner fa-pulse"></i> Cargando modelo de IA en tu navegador...');
    
    try {
      // Crear elemento de progreso
      const progressContainer = document.createElement('div');
      progressContainer.className = 'progress-container';
      progressContainer.innerHTML = `
        <div class="progress-bar">
          <div class="progress" style="width: 0%"></div>
        </div>
        <div class="progress-text">0%</div>
      `;
      loadingMessage.appendChild(progressContainer);
      
      // Función para actualizar el progreso
      const updateProgress = (percent, text) => {
        const progressBar = progressContainer.querySelector('.progress');
        const progressText = progressContainer.querySelector('.progress-text');
        progressBar.style.width = `${percent}%`;
        progressText.textContent = `${percent}% - ${text || 'Cargando...'}`;  
      };
      
      // Función para actualizar el estado
      const updateStatus = (status) => {
        const messageParagraph = loadingMessage.querySelector('p');
        messageParagraph.innerHTML = status;
      };
      
      // Inicializar WebLLM
      await window.WebLLMIntegration.initialize(updateProgress, updateStatus);
      
      // Cargar el modelo
      await window.WebLLMIntegration.loadModel();
      
      webLLMInitialized = true;
      
      // Actualizar mensaje de carga
      loadingMessage.innerHTML = '<p>✅ Modelo de IA cargado correctamente. ¡Ahora puedes chatear sin conexión a internet!</p>';
      
      // Añadir botón para cerrar el mensaje
      const closeButton = document.createElement('button');
      closeButton.className = 'close-button';
      closeButton.innerHTML = '<i class="fas fa-times"></i>';
      closeButton.addEventListener('click', () => {
        loadingMessage.remove();
      });
      loadingMessage.appendChild(closeButton);
      
    } catch (error) {
      console.error('Error al inicializar WebLLM:', error);
      loadingMessage.innerHTML = `<p>❌ Error al cargar el modelo de IA: ${error.message}</p><p>Se usará el servidor como alternativa.</p>`;
      useWebLLM = false;
    } finally {
      webLLMLoading = false;
    }
  }
  
  // Función para enviar mensaje
  async function sendMessage() {
    const message = userInput.value.trim();
    if (message === '') return;
    
    // Agregar mensaje del usuario al chat
    addMessageToChat('user', message);
    
    // Limpiar input
    userInput.value = '';
    
    // Crear objeto de mensaje
    const userMsg = { role: 'user', content: message };
    
    // Actualizar historial de chat
    chatHistory.push(userMsg);
    
    // Guardar en la conversación actual
    const currentConv = conversations.find(c => c.id === currentConversationId);
    if (currentConv) {
      currentConv.messages.push(userMsg);
    }
    
    // Mostrar indicador de carga
    const loadingMessage = addMessageToChat('bot', '<i class="fas fa-spinner fa-pulse"></i> Pensando...');
    
    try {
      let botResponse;
      let suggestedQuestions = [];
      let modelSource = '';
      
      // Intentar usar WebLLM si está disponible
      if (useWebLLM && webLLMInitialized) {
        try {
          // Añadir instrucción cristiana al inicio si no existe
          let hasSystemMessage = chatHistory.some(m => m.role === 'system');
          
          const allMessages = hasSystemMessage ? 
            [...chatHistory] : 
            [{ role: 'system', content: 'Eres un asistente virtual cristiano especializado en Misión Juvenil. Tus respuestas deben estar basadas en principios bíblicos y valores cristianos. Utiliza referencias bíblicas cuando sea apropiado y mantén un tono respetuoso y edificante. Evita cualquier contenido que contradiga las enseñanzas cristianas tradicionales. Cuando no estés seguro de una respuesta, sugiere buscar orientación en la Biblia o consultar con un líder espiritual.' }, ...chatHistory];
          
          botResponse = await window.WebLLMIntegration.generateResponse(allMessages);
          modelSource = 'webllm';
          
          // Generar preguntas sugeridas localmente
          suggestedQuestions = generateLocalSuggestedQuestions(message, botResponse);
          
        } catch (webllmError) {
          console.error('Error con WebLLM, usando servidor como alternativa:', webllmError);
          // Si falla WebLLM, usar el servidor como alternativa
          const serverResponse = await callServerAPI(message, chatHistory);
          botResponse = serverResponse.response;
          suggestedQuestions = serverResponse.suggestedQuestions || [];
          modelSource = serverResponse.model || 'server';
        }
      } else {
        // Usar el servidor si WebLLM no está disponible
        const serverResponse = await callServerAPI(message, chatHistory);
        botResponse = serverResponse.response;
        suggestedQuestions = serverResponse.suggestedQuestions || [];
        modelSource = serverResponse.model || 'server';
      }
      
      // Eliminar indicador de carga
      loadingMessage.remove();
      
      // Agregar mensaje del bot al chat con botones de feedback
      const botMessageElement = addMessageToChat('bot', botResponse);
      
      // Añadir indicador de fuente del modelo
      const modelIndicator = document.createElement('div');
      modelIndicator.className = 'model-indicator';
      modelIndicator.innerHTML = `<span class="model-badge ${modelSource}">${modelSource === 'webllm' ? '🌐 WebLLM' : '🖥️ ' + modelSource}</span>`;
      botMessageElement.appendChild(modelIndicator);
      
      // Añadir botones de feedback
      const feedbackDiv = document.createElement('div');
      feedbackDiv.className = 'message-feedback';
      feedbackDiv.innerHTML = `
        <p>¿Fue útil esta respuesta?</p>
        <div class="feedback-buttons">
          <button class="feedback-btn yes" data-value="true"><i class="fas fa-thumbs-up"></i></button>
          <button class="feedback-btn no" data-value="false"><i class="fas fa-thumbs-down"></i></button>
        </div>
      `;
      botMessageElement.appendChild(feedbackDiv);
      
      // Añadir preguntas sugeridas si existen
      if (suggestedQuestions && suggestedQuestions.length > 0) {
        // Buscar o crear el contenedor de FAQ
        let faqContainer = document.getElementById('faq-container');
        if (!faqContainer) {
          faqContainer = document.createElement('div');
          faqContainer.id = 'faq-container';
          faqContainer.className = 'faq-container';
          
          const faqHeader = document.createElement('div');
          faqHeader.className = 'faq-header';
          faqHeader.innerHTML = '<h3>Preguntas frecuentes</h3>';
          
          const faqToggle = document.createElement('button');
          faqToggle.className = 'faq-toggle';
          faqToggle.innerHTML = '<i class="fas fa-chevron-up"></i> Ocultar';
          faqToggle.addEventListener('click', function() {
            const faqQuestions = document.querySelector('.faq-questions');
            if (faqQuestions.style.display === 'none') {
              faqQuestions.style.display = 'flex';
              this.innerHTML = '<i class="fas fa-chevron-up"></i> Ocultar';
            } else {
              faqQuestions.style.display = 'none';
              this.innerHTML = '<i class="fas fa-chevron-down"></i> Mostrar';
            }
          });
          
          faqHeader.appendChild(faqToggle);
          faqContainer.appendChild(faqHeader);
          
          const faqQuestions = document.createElement('div');
          faqQuestions.className = 'faq-questions';
          faqContainer.appendChild(faqQuestions);
          
          document.body.appendChild(faqContainer);
        }
        
        // Limpiar preguntas anteriores
        const faqQuestions = faqContainer.querySelector('.faq-questions');
        faqQuestions.innerHTML = '';
        
        // Añadir nuevas preguntas
        suggestedQuestions.forEach(question => {
          const questionBtn = document.createElement('button');
          questionBtn.className = 'question-btn';
          questionBtn.textContent = question;
          questionBtn.addEventListener('click', () => {
            userInput.value = question;
            sendMessage();
          });
          faqQuestions.appendChild(questionBtn);
        });
      }
      
      // Configurar eventos de feedback
      feedbackDiv.querySelectorAll('.feedback-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const isHelpful = this.getAttribute('data-value') === 'true';
          let comment = '';
          
          // Si la respuesta no fue útil, pedir comentario opcional
          if (!isHelpful) {
            comment = prompt('¿Podrías decirnos por qué no fue útil? (opcional)');
          }
          
          // Enviar feedback al servidor solo si no estamos usando WebLLM
          if (!useWebLLM || modelSource !== 'webllm') {
            fetch('/api/feedback', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                messageId: Date.now().toString(),
                isHelpful: isHelpful,
                comment: comment || '',
                userQuery: message,
                botResponse: botResponse,
                modelSource: modelSource
              })
            });
          }
          
          // Mostrar agradecimiento y ocultar botones
          feedbackDiv.innerHTML = '<p>¡Gracias por tu feedback!</p>';
        });
      });
      
      // Crear objeto de respuesta
      const botMsg = { role: 'assistant', content: botResponse };
      
      // Actualizar historial de chat
      chatHistory.push(botMsg);
      
      // Guardar en la conversación actual
      if (currentConv) {
        currentConv.messages.push(botMsg);
      }
      
      // Desplazar al final del chat
      chatMessages.scrollTop = chatMessages.scrollHeight;
      
    } catch (error) {
      console.error('Error:', error);
      loadingMessage.remove();
      addMessageToChat('bot', 'Lo siento, ha ocurrido un error al procesar tu mensaje.');
    }
  }
  
  // Función para llamar a la API del servidor
  async function callServerAPI(message, chatHistory) {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message, chatHistory })
    });
    
    if (!response.ok) {
      throw new Error(`Error en la API: ${response.status}`);
    }
    
    return await response.json();
  }
  
  // Función para generar preguntas sugeridas localmente
  function generateLocalSuggestedQuestions(userQuery, botResponse) {
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
  
  // Función para agregar mensaje al chat
  function addMessageToChat(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    const messageParagraph = document.createElement('p');
    messageParagraph.innerHTML = content;
    
    messageContent.appendChild(messageParagraph);
    messageDiv.appendChild(messageContent);
    
    // Añadir botón de fijar solo para mensajes del usuario
    if (role === 'user') {
      const pinButton = document.createElement('button');
      pinButton.className = 'pin-button';
      pinButton.innerHTML = '<i class="fas fa-thumbtack"></i>';
      pinButton.title = 'Fijar mensaje';
      pinButton.addEventListener('click', function() {
        if (messageDiv.classList.contains('pinned')) {
          messageDiv.classList.remove('pinned');
          pinButton.title = 'Fijar mensaje';
        } else {
          // Eliminar clase pinned de todos los mensajes
          document.querySelectorAll('.message.pinned').forEach(msg => {
            msg.classList.remove('pinned');
            msg.querySelector('.pin-button').title = 'Fijar mensaje';
          });
          
          messageDiv.classList.add('pinned');
          pinButton.title = 'Desfijar mensaje';
        }
      });
      messageDiv.appendChild(pinButton);
    }
    
    // Añadir botones de reacción solo para mensajes del bot (activados con clic derecho)
    if (role === 'bot' && content !== '<i class="fas fa-spinner fa-pulse"></i> Pensando...') {
      const reactionsDiv = document.createElement('div');
      reactionsDiv.className = 'message-reactions';
      reactionsDiv.style.display = 'none'; // Ocultar inicialmente
      
      const reactions = [
        { emoji: '👍', name: 'like' },
        { emoji: '❤️', name: 'love' },
        { emoji: '😊', name: 'smile' },
        { emoji: '🙏', name: 'pray' },
        { emoji: '💡', name: 'idea' }
      ];
      
      reactions.forEach(reaction => {
        const reactionBtn = document.createElement('button');
        reactionBtn.className = 'reaction-btn';
        reactionBtn.innerHTML = `${reaction.emoji} <span class="reaction-count">0</span>`;
        reactionBtn.dataset.reaction = reaction.name;
        reactionBtn.addEventListener('click', function() {
          const countSpan = this.querySelector('.reaction-count');
          let count = parseInt(countSpan.textContent);
          
          if (this.classList.contains('active')) {
            this.classList.remove('active');
            count--;
          } else {
            this.classList.add('active');
            count++;
          }
          
          countSpan.textContent = count.toString();
        });
        reactionsDiv.appendChild(reactionBtn);
      });
      
      // Añadir evento de clic derecho para mostrar/ocultar reacciones
      messageContent.addEventListener('contextmenu', function(e) {
        e.preventDefault(); // Prevenir menú contextual del navegador
        if (reactionsDiv.style.display === 'none') {
          reactionsDiv.style.display = 'flex';
        } else {
          reactionsDiv.style.display = 'none';
        }
      });
      
      // Añadir indicador visual de clic derecho más discreto
      const reactionHint = document.createElement('div');
      reactionHint.className = 'reaction-hint';
      reactionHint.innerHTML = '<i class="fas fa-ellipsis-h"></i>';
      reactionHint.title = 'Clic derecho para reaccionar';
      messageContent.appendChild(reactionHint);
      
      messageDiv.appendChild(reactionsDiv);
    }
    
    chatMessages.appendChild(messageDiv);
    
    // Desplazar al final del chat
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return messageDiv;
  }
  
  // Evento para enviar mensaje con el botón
  sendButton.addEventListener('click', sendMessage);
  
  // Evento para enviar mensaje con Enter
  userInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
  
  // Función para inicializar eventos de conversaciones
  function initConversationEvents() {
    // Evento para crear nueva conversación
    newChatBtn.addEventListener('click', createNewConversation);
    
    // Inicializar eventos para botones de borrar en conversaciones existentes
    document.querySelectorAll('.delete-conversation-btn').forEach(btn => {
      btn.addEventListener('click', handleDeleteConversation);
    });
  }
  
  // Función para crear nueva conversación
  function createNewConversation(e) {
    if (e) e.stopPropagation();
    
    // Generar ID único para la nueva conversación
    const newId = 'conv_' + Date.now();
    const newName = 'Nueva conversación';
    
    // Agregar a la lista de conversaciones
    conversations.push({ id: newId, name: newName, messages: [] });
    
    // Crear elemento en el DOM
    const newConvElem = document.createElement('div');
    newConvElem.className = 'conversation';
    newConvElem.dataset.id = newId;
    newConvElem.innerHTML = `
      <span>${newName}</span>
      <button class="delete-conversation-btn"><i class="fas fa-trash"></i></button>
    `;
    
    // Agregar evento para el botón de borrar
    const deleteBtn = newConvElem.querySelector('.delete-conversation-btn');
    deleteBtn.addEventListener('click', handleDeleteConversation);
    
    // Agregar evento para seleccionar esta conversación
    newConvElem.addEventListener('click', function() {
      switchConversation(newId);
    });
    
    // Agregar al DOM
    conversationsList.appendChild(newConvElem);
    
    // Cambiar a la nueva conversación
    switchConversation(newId);
  }
  
  // Función para cambiar de conversación
  function switchConversation(convId) {
    // Actualizar ID de conversación actual
    currentConversationId = convId;
    
    // Actualizar clases en la lista de conversaciones
    document.querySelectorAll('.conversation').forEach(conv => {
      if (conv.dataset.id === convId) {
        conv.classList.add('active');
      } else {
        conv.classList.remove('active');
      }
    });
    
    // Limpiar el chat actual
    chatMessages.innerHTML = '';
    
    // Cargar mensajes de la conversación seleccionada
    const currentConv = conversations.find(c => c.id === convId);
    if (currentConv && currentConv.messages.length > 0) {
      currentConv.messages.forEach(msg => {
        addMessageToChat(msg.role, msg.content);
      });
    } else {
      // Si es una conversación nueva, agregar mensaje de bienvenida
      addMessageToChat('bot', '¡Paz y luz, amado joven! ¿En qué puedo ayudarte hoy?');
    }
    
    // Actualizar historial de chat para el API
    chatHistory = currentConv ? [...currentConv.messages] : [];
  }
  
  // Función para manejar el borrado de conversaciones
  function handleDeleteConversation(e) {
    e.stopPropagation();
    
    // Obtener el elemento de conversación
    const convElem = e.target.closest('.conversation');
    const convId = convElem.dataset.id;
    
    // No permitir borrar la única conversación
    if (conversations.length <= 1) {
      alert('No puedes borrar la única conversación.');
      return;
    }
    
    // Eliminar de la lista de conversaciones
    conversations = conversations.filter(c => c.id !== convId);
    
    // Eliminar del DOM
    convElem.remove();
    
    // Si la conversación borrada era la actual, cambiar a otra
    if (currentConversationId === convId) {
      switchConversation(conversations[0].id);
    }
  }
});