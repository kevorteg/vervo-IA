
import { Bot, User } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  return (
    <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4 animate-slide-up`}>
      <div className={`flex items-start space-x-2 max-w-[80%] ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          message.isUser 
            ? 'bg-aurora-celestial text-white' 
            : 'bg-message-gradient text-white'
        }`}>
          {message.isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>
        
        <div className={`message-bubble ${
          message.isUser
            ? 'bg-aurora-celestial text-white'
            : 'bg-white text-gray-800 aurora-shadow'
        }`}>
          <p className="text-sm leading-relaxed">{message.text}</p>
          <p className={`text-xs mt-1 ${
            message.isUser ? 'text-white/70' : 'text-gray-500'
          }`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  );
};
