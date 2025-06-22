
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChatHeader } from './ChatHeader';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { QuickActions } from './QuickActions';
import { Sidebar } from './sidebar/Sidebar';
import { UserOnboarding } from './UserOnboarding';
import { aiManager } from './ai/AIProviderManager';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

interface UserContext {
  name?: string;
  isAnonymous: boolean;
  userId: string;
}

interface ChatInterfaceProps {
  user: any;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const ChatInterface = ({ user, darkMode, onToggleDarkMode }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string>();
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('conversaciones')
      .select('*')
      .eq('usuario_id', user.id)
      .order('updated_at', { ascending: false });
    
    if (data) {
      setConversations(data);
    }
  };

  const handleUserOnboarding = (userData: { name?: string; isAnonymous: boolean }) => {
    const userId = user?.id || `anon_${Date.now()}`;
    setUserContext({
      ...userData,
      userId
    });
    setShowOnboarding(false);
    
    // Mensaje de bienvenida
    const welcomeMessage: Message = {
      id: '1',
      content: userData.name 
        ? `¡Hola ${userData.name}! Soy ChatMJ, tu compañera espiritual de Misión Juvenil. Estoy aquí para acompañarte en tu caminar con Cristo, responder tus preguntas sobre la fe, ofrecerte devocionales, ayudarte en momentos difíciles y guiarte en tu crecimiento espiritual. ¿En qué puedo acompañarte hoy? 🙏✨`
        : '¡Hola! Soy ChatMJ, tu compañera espiritual de Misión Juvenil. Estoy aquí para acompañarte en tu caminar con Cristo, responder tus preguntas sobre la fe, ofrecerte devocionales, ayudarte en momentos difíciles y guiarte en tu crecimiento espiritual. ¿En qué puedo acompañarte hoy? 🙏✨',
      isUser: false,
      timestamp: new Date(),
    };
    
    setMessages([welcomeMessage]);
    createNewConversation();
  };

  const createNewConversation = async () => {
    if (!userContext) return;

    const { data, error } = await supabase
      .from('conversaciones')
      .insert({
        usuario_id: userContext.userId,
        titulo: 'Nueva conversación',
        activa: true
      })
      .select()
      .single();

    if (data && !error) {
      setCurrentConversationId(data.id);
      setMessages([]);
      loadConversations();
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!userContext || !currentConversationId) return;

    // Agregar mensaje del usuario
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Guardar mensaje en BD
    await supabase.from('mensajes').insert({
      conversacion_id: currentConversationId,
      contenido: content,
      es_usuario: true
    });

    // Generar respuesta con IA
    try {
      const chatHistory = [...messages, userMessage].map(msg => ({
        role: msg.isUser ? 'user' as const : 'assistant' as const,
        content: msg.content
      }));

      const response = await aiManager.generateResponse(chatHistory, userContext);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);

      // Guardar respuesta de IA en BD
      await supabase.from('mensajes').insert({
        conversacion_id: currentConversationId,
        contenido: response.message,
        es_usuario: false
      });

      // Actualizar título de conversación si es el primer mensaje
      if (messages.length === 1) {
        const title = content.length > 50 ? content.substring(0, 50) + '...' : content;
        await supabase
          .from('conversaciones')
          .update({ titulo: title })
          .eq('id', currentConversationId);
        loadConversations();
      }

    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Lo siento, ha ocurrido un error. Por favor intenta de nuevo. 🙏',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
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

  const handleNewChat = () => {
    createNewConversation();
  };

  const handleSelectConversation = async (conversationId: string) => {
    setCurrentConversationId(conversationId);
    
    // Cargar mensajes de la conversación
    const { data } = await supabase
      .from('mensajes')
      .select('*')
      .eq('conversacion_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (data) {
      const loadedMessages: Message[] = data.map(msg => ({
        id: msg.id,
        content: msg.contenido,
        isUser: msg.es_usuario,
        timestamp: new Date(msg.created_at)
      }));
      setMessages(loadedMessages);
    }
  };

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-aurora-gradient dark:bg-gray-900 flex items-center justify-center p-4">
        <UserOnboarding onComplete={handleUserOnboarding} />
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${darkMode ? 'dark' : ''}`}>
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onNewChat={handleNewChat}
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        user={user}
        darkMode={darkMode}
      />
      
      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
        <ChatHeader 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          darkMode={darkMode}
          onToggleDarkMode={onToggleDarkMode}
          userName={userContext?.name}
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
