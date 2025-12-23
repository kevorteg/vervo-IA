
import { Bot } from 'lucide-react';

export const TypingIndicator = () => {
  return (
    <div className="flex justify-start mb-4 animate-fade-in">
      <div className="flex items-start space-x-2 max-w-[80%]">
        <div className="w-8 h-8 rounded-full bg-message-gradient flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>

        <div className="bg-white text-gray-800 aurora-shadow rounded-2xl px-4 py-3">
          <div className="typing-indicator">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Verbo IA está escribiendo...</p>
        </div>
      </div>
    </div>
  );
};
