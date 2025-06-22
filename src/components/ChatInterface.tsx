
import { useState, useRef, useEffect } from 'react';
import { ChatHeader } from './ChatHeader';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { QuickActions } from './QuickActions';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '¡Hola! Soy ChatMJ, tu compañero espiritual digital. Estoy aquí para acompañarte, escucharte y ayudarte en tu camino de fe. ¿En qué puedo servirte hoy? 🙏✨',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const simulateAIResponse = (userMessage: string): string => {
    const responses = {
      prayer: [
        'Gracias por confiar en mí para orar contigo. Recuerda que Dios escucha cada una de nuestras peticiones. "Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias" - Filipenses 4:6. ¿Por qué situación específica te gustaría que oremos?',
        'Me alegra que busques la oración. Dios tiene un corazón dispuesto a escucharte. "Clama a mí, y yo te responderé, y te enseñaré cosas grandes y ocultas que tú no conoces" - Jeremías 33:3. Cuéntame qué hay en tu corazón.'
      ],
      sad: [
        'Entiendo que te sientes triste, y quiero que sepas que no estás solo/a. Jesús mismo experimentó tristeza y comprende tu dolor. "Echando toda vuestra ansiedad sobre él, porque él tiene cuidado de vosotros" - 1 Pedro 5:7. ¿Te gustaría contarme qué te tiene así?',
        'Siento mucho que estés pasando por un momento difícil. Recuerda que "los que siembran con lágrimas, con regocijo segarán" - Salmo 126:5. Dios puede usar incluso nuestros momentos más oscuros para su gloria. ¿Cómo puedo acompañarte mejor?'
      ],
      doubts: [
        'Es completamente normal tener dudas, incluso los grandes hombres de fe las tuvieron. Jesús no se molesta por nuestras preguntas sinceras. "Pedid, y se os dará; buscad, y hallaréis; llamad, y se os abrirá" - Mateo 7:7. ¿Qué dudas específicas tienes sobre Dios?',
        'Me alegra que tengas la confianza de compartir tus dudas. La fe que no se cuestiona no crece. "Escudriñad las Escrituras; porque a vosotros os parece que en ellas tenéis la vida eterna" - Juan 5:39. ¿En qué área de la fe necesitas más claridad?'
      ],
      mj: [
        'Misión Juvenil es una organización cristiana dedicada a alcanzar, discipular y formar jóvenes para el Reino de Dios. Nuestro corazón es ver a cada joven experimentar el amor transformador de Cristo y desarrollar su propósito eterno. ¿Te gustaría saber más sobre algún aspecto específico de MJ?',
        '¡Qué alegría que preguntes sobre Misión Juvenil! Somos una familia de fe comprometida con los jóvenes, trabajando para que cada uno encuentre su identidad en Cristo y su llamado en el Reino. Tenemos discipulados, eventos, talleres y mucho más. ¿Hay algo específico que te interese conocer?'
      ],
      general: [
        'Entiendo tu inquietud. Como ChatMJ, estoy aquí para escucharte con el corazón de Cristo y ofrecerte perspectiva bíblica. ¿Podrías contarme un poco más para poder ayudarte mejor?',
        'Gracias por compartir conmigo. Mi propósito es acompañarte en tu caminar espiritual con sabiduría y amor. ¿Cómo puedo servirte mejor en este momento?',
        'Me da mucha alegría que hayas decidido conversar conmigo. Recuerda que "Jehová peleará por vosotros, y vosotros estaréis tranquilos" - Éxodo 14:14. ¿En qué más puedo ayudarte?'
      ]
    };

    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('orar') || lowerMessage.includes('oración')) {
      return responses.prayer[Math.floor(Math.random() * responses.prayer.length)];
    } else if (lowerMessage.includes('triste') || lowerMessage.includes('sad') || lowerMessage.includes('deprim')) {
      return responses.sad[Math.floor(Math.random() * responses.sad.length)];
    } else if (lowerMessage.includes('duda') || lowerMessage.includes('pregunta') || lowerMessage.includes('no entiendo')) {
      return responses.doubts[Math.floor(Math.random() * responses.doubts.length)];
    } else if (lowerMessage.includes('misión juvenil') || lowerMessage.includes('mj') || lowerMessage.includes('organización')) {
      return responses.mj[Math.floor(Math.random() * responses.mj.length)];
    } else {
      return responses.general[Math.floor(Math.random() * responses.general.length)];
    }
  };

  const handleSendMessage = async (messageText: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: simulateAIResponse(messageText),
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000); // Random delay between 1.5-2.5 seconds
  };

  const handleQuickAction = (message: string) => {
    handleSendMessage(message);
  };

  const handleContactLeader = () => {
    toast({
      title: "Contactar líder",
      description: "Te conectaremos con un líder de MJ en breve. Por favor, espera un momento.",
    });
  };

  const showQuickActions = messages.length <= 1 && !isTyping;

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden">
      <ChatHeader onContactLeader={handleContactLeader} />
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-container">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {isTyping && <TypingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>

      {showQuickActions && <QuickActions onQuickAction={handleQuickAction} />}
      
      <MessageInput 
        onSendMessage={handleSendMessage} 
        disabled={isTyping}
      />
    </div>
  );
};
