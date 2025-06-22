
import { useState, useRef, useEffect } from 'react';
import { ChatHeader } from './ChatHeader';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { QuickActions } from './QuickActions';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '¡Hola! Soy ChatMJ, tu compañera espiritual de Misión Juvenil. Estoy aquí para acompañarte en tu caminar con Cristo, responder tus preguntas sobre la fe, ofrecerte devocionales, ayudarte en momentos difíciles y guiarte en tu crecimiento espiritual. ¿En qué puedo acompañarte hoy? 🙏✨',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (content: string) => {
    // Agregar mensaje del usuario
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simular respuesta de IA con estilo Aurora Celestial
    setTimeout(() => {
      const responses = [
        "Querido hermano/a, entiendo lo que compartes conmigo. En Cristo encontramos la fortaleza para cada desafío. 'Todo lo puedo en Cristo que me fortalece' (Filipenses 4:13). ¿Te gustaría que oremos juntos por esta situación? 🙏",
        "Tu corazón busca respuestas, y qué hermoso es que acudas al Señor en este momento. Él dice: 'Clama a mí, y yo te responderé, y te enseñaré cosas grandes y ocultas que tú no conoces' (Jeremías 33:3). ¿Qué más te inquieta en tu corazón? 💙",
        "Siento la sinceridad en tus palabras. Jesús nos invita: 'Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar' (Mateo 11:28). Su amor por ti es incondicional. ¿Te gustaría compartir más sobre lo que sientes? ✨",
        "En Misión Juvenil creemos que cada joven tiene un propósito eterno en Cristo. Tu vida tiene un valor incalculable ante los ojos de Dios. ¿Te gustaría conocer más sobre tu identidad en Cristo? 🌟"
      ];
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: responses[Math.floor(Math.random() * responses.length)],
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const handleQuickAction = (action: string) => {
    const quickResponses = {
      prayer: "Me gustaría orar contigo",
      devotional: "¿Tienes algún devocional para hoy?",
      crisis: "Estoy pasando por un momento difícil",
      evangelism: "Quiero conocer más sobre Jesús"
    };
    
    if (quickResponses[action as keyof typeof quickResponses]) {
      handleSendMessage(quickResponses[action as keyof typeof quickResponses]);
    }
  };

  return (
    <div className={`flex h-screen ${darkMode ? 'dark' : ''}`}>
      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        <ChatHeader 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
        />
        
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {isTyping && <TypingIndicator />}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <QuickActions onActionClick={handleQuickAction} />
        
        {/* Message Input */}
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default ChatInterface;
