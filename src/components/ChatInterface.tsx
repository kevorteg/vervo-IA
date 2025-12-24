import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { ChatHeader } from './ChatHeader';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { QuickActions } from './QuickActions';
import { DailyVerse } from './bible/DailyVerse';
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
  user: User | null;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  isGuestMode?: boolean;
  onExitGuestMode?: () => void;
  isAdmin?: boolean;
}

export const ChatInterface = ({
  user,
  darkMode,
  onToggleDarkMode,
  isGuestMode = false,
  onExitGuestMode,
  isAdmin = false
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string>();
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false); // Default false initially
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

  useEffect(() => {
    if (isGuestMode) {
      setShowOnboarding(false);
      if (!userContext) {
        setUserContext({
          isAnonymous: true,
          userId: `guest_${Date.now()}`,
          isGuest: true
        });

        const welcomeMessage: Message = {
          id: '1',
          content: '¡Hola! Soy Verbo IA, tu compañera espiritual de Misión Juvenil. Estás usando el modo invitado, por lo que las conversaciones no se guardarán. Estoy aquí para acompañarte en tu caminar con Cristo, responder tus preguntas sobre la fe y ofrecerte guía espiritual. ¿En qué puedo acompañarte hoy?',
          isUser: false,
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
      }
    } else if (user) {
      // Check local storage for user profile
      const storedName = localStorage.getItem(`verbo_user_name_${user.id}`);
      if (storedName) {
        setUserContext({
          name: storedName,
          isAnonymous: false,
          userId: user.id
        });
        setShowOnboarding(false);
      } else {
        setShowOnboarding(true);
      }
    }
  }, [isGuestMode, user]);

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
      toast({
        title: "Error",
        description: "No se pudieron cargar las conversaciones",
        variant: "destructive",
      });
    }
  };

  const handleUserOnboarding = (userData: { name?: string; isAnonymous: boolean }) => {
    const userId = user?.id || `anon_${Date.now()}`;

    if (user && userData.name) {
      localStorage.setItem(`verbo_user_name_${user.id}`, userData.name);
    }

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
        ? `¡Hola ${userData.name}! Soy Verbo IA, tu compañera espiritual de Misión Juvenil. Estoy aquí para acompañarte en tu caminar con Cristo, responder tus preguntas sobre la fe, ofrecerte devocionales, ayudarte en momentos difíciles y guiarte en tu crecimiento espiritual. ¿En qué puedo acompañarte hoy?`
        : '¡Hola! Soy Verbo IA, tu compañera espiritual de Misión Juvenil. Estoy aquí para acompañarte en tu caminar con Cristo, responder tus preguntas sobre la fe, ofrecerte devocionales, ayudarte en momentos difíciles y guiarte en tu crecimiento espiritual. ¿En qué puedo acompañarte hoy?',
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
      toast({
        title: "Error",
        description: "No se pudo crear la conversación",
        variant: "destructive",
      });
    }
  };

  const [guestMessageCount, setGuestMessageCount] = useState(0);

  const handleSendMessage = async (content: string) => {
    if (!userContext || isMessageSending) return;

    // Check Guest Limit
    if (isGuestMode && guestMessageCount >= 5) {
      toast({
        title: "Límite de invitados alcanzado",
        description: "Has alcanzado el límite de 5 mensajes. ¡Regístrate gratis para continuar y guardar tus conversaciones!",
        variant: "destructive", // Or a custom "info" variant if we had one, but destructive grabs attention
      });
      setShowSettings(true); // Open settings to show "Exit Guest Mode" button
      return;
    }

    setIsMessageSending(true);

    try {
      // Si no hay conversación activa y no es modo invitado, crear una nueva
      if (!currentConversationId && !isGuestMode) {
        await createNewConversation();
        // Esperar un momento para que se cree la conversación
        await new Promise(resolve => setTimeout(resolve, 100));
      } else if (isGuestMode) {
        setGuestMessageCount(prev => prev + 1);
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
          // Silent error
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
          // Silent error
        }

        // Actualizar título de conversación si es necesario
        if (messages.length <= 1) {
          const title = content.length > 50 ? content.substring(0, 50) + '...' : content;
          const { error: updateError } = await supabase
            .from('conversaciones')
            .update({ titulo: title, updated_at: new Date().toISOString() })
            .eq('id', currentConversationId);

          if (updateError) {
            // Silent error
          } else {
            await loadConversations();
          }
        }
      }

      // Reproducir voz si está habilitada (opcional en el futuro una configuración)
      // speakText(response.message); // Disabled by user request

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Lo siento, ha ocurrido un error al enviar el mensaje. Por favor intenta de nuevo.',
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

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancelar cualquier audio anterior
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      const voices = window.speechSynthesis.getVoices();

      // Buscar prioridad: Google Español -> Mexico -> Colombia -> Cualquier Español
      const spanishVoice = voices.find(voice =>
        voice.name.includes('Google español') ||
        voice.lang === 'es-MX' ||
        voice.lang === 'es-CO' ||
        (voice.lang.includes('es') && !voice.name.includes('Microsoft')) // Evitar voces robóticas de Microsoft antiguas si es posible
      ) || voices.find(voice => voice.lang.includes('es'));

      if (spanishVoice) {
        utterance.voice = spanishVoice;
        utterance.lang = spanishVoice.lang;
      } else {
        utterance.lang = 'es-ES'; // Fallback
      }

      // Ajustes para sonar más natural
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      window.speechSynthesis.speak(utterance);
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
    const message = encodeURIComponent("Hola, necesito ayuda espiritual desde Verbo IA");
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

  const handleDeleteConversation = async (conversationId: string) => {
    if (isGuestMode) return;

    try {
      // 0. Delete related alerts first
      const { error: alertsError } = await supabase
        .from('alertas')
        .delete()
        .eq('conversacion_id', conversationId);

      if (alertsError) {
        console.error('Error deleting alerts:', alertsError);
        // Continue, as alerts might not exist
      }

      // 1. Delete all messages (to handle FK constraints)
      const { error: messagesError } = await supabase
        .from('mensajes')
        .delete()
        .eq('conversacion_id', conversationId);

      if (messagesError) {
        console.error('Error deleting messages:', messagesError);
        throw messagesError;
      }

      // 2. Delete the conversation
      const { error } = await supabase
        .from('conversaciones')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;

      setConversations(prev => prev.filter(c => c.id !== conversationId));

      if (currentConversationId === conversationId) {
        setCurrentConversationId(undefined);
        setMessages([]);
      }

      toast({
        title: "Conversación eliminada",
        description: "La conversación se ha eliminado correctamente.",
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la conversación. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`flex h-screen ${darkMode ? 'dark' : ''}`}>
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onNewChat={handleNewChat}
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        user={user}
        darkMode={darkMode}
        onContactLeader={handleContactLeader}
        onOpenSettings={handleOpenSettings}
        isGuestMode={isGuestMode}
        onExitGuestMode={onExitGuestMode}
        isAdmin={isAdmin}
      />
      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 relative">
        <ChatHeader
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          darkMode={darkMode}
          onToggleDarkMode={onToggleDarkMode}
          userName={userContext?.name}
          isGuestMode={isGuestMode}
        />

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto w-full relative">
          <div className="max-w-3xl mx-auto h-full p-4 pb-32 space-y-6">
            {messages.length === 0 && !isTyping && (
              <div className="flex flex-col items-center justify-center h-full opacity-0 animate-fade-in-up">
                <div className="relative mb-8">
                  <div className="absolute -inset-1 bg-purple-200 dark:bg-purple-900 rounded-full blur opacity-30 animate-pulse"></div>
                  <div className="w-24 h-24 relative bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-xl ring-4 ring-white dark:ring-gray-900">
                    <span className="text-aurora-primario font-bold text-4xl">
                      V
                    </span>
                  </div>
                  {/* Status dot */}
                  <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-white dark:border-gray-900 rounded-full"></div>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 text-center tracking-tight">
                  Hola, {userContext?.name || (isGuestMode ? 'Invitado' : 'Amigo')}! 👋
                </h1>

                <p className="text-lg text-gray-500 dark:text-gray-400 max-w-md text-center leading-relaxed">
                  Soy <span className="font-semibold text-gray-700 dark:text-gray-300">Verbo IA</span>. Estoy aquí para escucharte, orar contigo y crecer en la fe.
                </p>

                {isGuestMode && (
                  <div className="mt-8 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-sm rounded-full font-medium">
                    ¡Bienvenido a Verbo IA!
                  </div>
                )}
              </div>
            )}

            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {isTyping && <TypingIndicator />}

            <div className="h-32" />
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Floating Input Area */}
        <div className="absolute bottom-6 left-0 right-0 z-50 px-4 pointer-events-none">
          <div className="max-w-3xl mx-auto w-full pointer-events-auto flex flex-col gap-2">
            {/* Quick Actions */}
            {messages.length === 0 && !isTyping && (
              <div className="mb-2 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
                <QuickActions onActionClick={handleQuickAction} />
                <div className="mt-4 px-2">
                  <DailyVerse />
                </div>
              </div>
            )}

            {/* Input Bar */}
            <MessageInput
              onSendMessage={handleSendMessage}
              isDisabled={isMessageSending}
            />
          </div>
        </div>
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
