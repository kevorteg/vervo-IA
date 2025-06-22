
import { User, Bot } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  return (
    <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}>
      <div className={`flex items-start space-x-2 max-w-[80%] ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          message.isUser 
            ? 'bg-user-gradient' 
            : 'bg-message-gradient'
        }`}>
          {message.isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Bot className="w-4 h-4 text-white" />
          )}
        </div>
        
        {/* Message Content */}
        <div className={`rounded-2xl px-4 py-3 ${
          message.isUser
            ? 'bg-aurora-usuario text-white rounded-br-md'
            : 'bg-white text-gray-800 aurora-shadow rounded-bl-md border border-gray-100'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
          <div className={`text-xs mt-2 ${
            message.isUser ? 'text-blue-100' : 'text-gray-500'
          }`}>
            {message.timestamp.toLocaleTimeString('es-ES', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
