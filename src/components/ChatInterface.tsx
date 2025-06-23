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
import { useToast } from '@/hooks/use-toast';
import { SettingsModal } from './SettingsModal';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface Conversation {
  id: string;
  titulo: string;
  updated_at: string;
}

interface UserContext {
  name?: string;
  isAnonymous: boolean;
  userId: string;
  isGuest?: boolean;
}

interface ChatInterfaceProps {
  user: any;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  isGuestMode?: boolean;
  onExitGuestMode?: () => void;
}

export const ChatInterface = ({ 
  user, 
  darkMode, 
  onToggleDarkMode, 
  isGuestMode = false,
  onExitGuestMode 
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string>();
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(!isGuestMode);
  const [isMessageSending, setIsMessageSending] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (user && !isGuestMode) {
      loadConversations();
    }
  }, [user, isGuestMode]);

  // Configuración automática para modo invitado
  useEffect(() => {
    if (isGuestMode && !userContext) {
      setUserContext({
        isAnonymous: true,
        userId: `guest_${Date.now()}`,
        isGuest: true
      });
      setShowOnboarding(false);
      
      // Mensaje de bienvenida para invitados
      const welcomeMessage: Message = {
        id: '1',
        content: '¡Hola! Soy ChatMJ, tu compañera espiritual de Misión Juvenil. Estás usando el modo invitado, por lo que las conversaciones no se guardarán. Estoy aquí para acompañarte en tu caminar con Cristo, responder tus preguntas sobre la fe y ofrecerte guía espiritual. ¿En qué puedo acompañarte hoy? 🙏✨',
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages([welcomeMessage]);
    }
  }, [isGuestMode, userContext]);

  const loadConversations = async () => {
    if (!user || isGuestMode) return;
    
    try {
      const { data, error } = await supabase
        .from('conversaciones')
        .select('*')
        .eq('usuario_id', user.id)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setConversations(data);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las conversaciones",
        variant: "destructive",
      });
    }
  };

  const handleUserOnboarding = (userData: { name?: string; isAnonymous: boolean }) => {
    const userId = user?.id || `anon_${Date.now()}`;
    setUserContext({
      ...userData,
      userId,
      isGuest: isGuestMode
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
    
    if (!isGuestMode) {
      createNewConversation();
    }
  };

  const createNewConversation = async () => {
    if (!userContext || isGuestMode) return;

    try {
      const { data, error } = await supabase
        .from('conversaciones')
        .insert({
          usuario_id: userContext.userId,
          titulo: 'Nueva conversación',
          activa: true
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setCurrentConversationId(data.id);
        setMessages([]);
        await loadConversations();
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la conversación",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!userContext || isMessageSending) return;

    setIsMessageSending(true);

    try {
      // Si no hay conversación activa y no es modo invitado, crear una nueva
      if (!currentConversationId && !isGuestMode) {
        await createNewConversation();
        // Esperar un momento para que se cree la conversación
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Agregar mensaje del usuario inmediatamente
      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        isUser: true,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      setIsTyping(true);

      // Si tenemos una conversación activa y no es modo invitado, guardar el mensaje
      if (currentConversationId && !isGuestMode) {
        const { error: messageError } = await supabase.from('mensajes').insert({
          conversacion_id: currentConversationId,
          contenido: content,
          es_usuario: true
        });

        if (messageError) {
          console.error('Error saving user message:', messageError);
        }
      }

      // Generar respuesta con IA
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

      // Guardar respuesta de IA en BD si tenemos conversación activa y no es modo invitado
      if (currentConversationId && !isGuestMode) {
        const { error: aiMessageError } = await supabase.from('mensajes').insert({
          conversacion_id: currentConversationId,
          contenido: response.message,
          es_usuario: false
        });

        if (aiMessageError) {
          console.error('Error saving AI message:', aiMessageError);
        }

        // Actualizar título de conversación si es necesario
        if (messages.length <= 1) {
          const title = content.length > 50 ? content.substring(0, 50) + '...' : content;
          const { error: updateError } = await supabase
            .from('conversaciones')
            .update({ titulo: title, updated_at: new Date().toISOString() })
            .eq('id', currentConversationId);
          
          if (updateError) {
            console.error('Error updating conversation title:', updateError);
          } else {
            await loadConversations();
          }
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Lo siento, ha ocurrido un error al enviar el mensaje. Por favor intenta de nuevo. 🙏',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
      setIsMessageSending(false);
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
    setMessages([]);
    setCurrentConversationId(undefined);
    if (!isGuestMode) {
      createNewConversation();
    }
  };

  const handleSelectConversation = async (conversationId: string) => {
    if (isGuestMode) return;
    
    setCurrentConversationId(conversationId);
    
    try {
      // Cargar mensajes de la conversación
      const { data, error } = await supabase
        .from('mensajes')
        .select('*')
        .eq('conversacion_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      if (data) {
        const loadedMessages: Message[] = data.map(msg => ({
          id: msg.id,
          content: msg.contenido,
          isUser: msg.es_usuario,
          timestamp: new Date(msg.created_at)
        }));
        setMessages(loadedMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los mensajes",
        variant: "destructive",
      });
    }
  };

  const handleContactLeader = () => {
    toast({
      title: "Contactar Líder",
      description: "Redirigiendo a WhatsApp...",
    });
    
    // Aquí puedes personalizar el número y mensaje
    const phoneNumber = "1234567890"; // Reemplazar con el número real
    const message = encodeURIComponent("Hola, necesito ayuda espiritual desde ChatMJ");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  if (showOnboarding && !isGuestMode) {
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
        onContactLeader={handleContactLeader}
        onOpenSettings={handleOpenSettings}
        isGuestMode={isGuestMode}
        onExitGuestMode={onExitGuestMode}
      />
      
      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
        <ChatHeader 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          darkMode={darkMode}
          onToggleDarkMode={onToggleDarkMode}
          userName={userContext?.name}
          isGuestMode={isGuestMode}
        />
        
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !isTyping && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-aurora-primario rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">MJ</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  ¡Bienvenido a ChatMJ!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Comienza una conversación o selecciona una de las opciones rápidas
                </p>
                {isGuestMode && (
                  <p className="text-sm text-orange-500 dark:text-orange-400 mt-2">
                    Modo invitado • Las conversaciones no se guardarán
                  </p>
                )}
              </div>
            </div>
          )}
          
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {isTyping && <TypingIndicator />}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length === 0 && !isTyping && (
          <QuickActions onActionClick={handleQuickAction} />
        )}
        
        {/* Message Input */}
        <MessageInput 
          onSendMessage={handleSendMessage} 
          isDisabled={isMessageSending}
        />
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={handleCloseSettings}
        darkMode={darkMode}
        onToggleDarkMode={onToggleDarkMode}
        userName={userContext?.name}
        isGuestMode={isGuestMode}
        onExitGuestMode={onExitGuestMode}
      />
    </div>
  );
};

export default ChatInterface;
