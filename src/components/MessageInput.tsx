
import { useState } from 'react';
import { Send, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export const MessageInput = ({ onSendMessage, disabled }: MessageInputProps) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white/80 backdrop-blur-sm border-t border-aurora-violet/20">
      <div className="flex items-center space-x-2">
        <div className="flex-1 relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe tu mensaje aquí..."
            disabled={disabled}
            className="pr-10 border-aurora-violet/30 focus:border-aurora-violet focus:ring-aurora-violet/20 bg-white"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 text-aurora-violet hover:text-aurora-celestial"
          >
            <Mic className="w-4 h-4" />
          </Button>
        </div>
        
        <Button
          type="submit"
          disabled={!message.trim() || disabled}
          className="bg-aurora-violet hover:bg-aurora-celestial text-white transition-colors duration-200"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      
      <p className="text-xs text-gray-500 mt-2 text-center">
        ChatMJ está aquí para acompañarte espiritualmente ✨
      </p>
    </form>
  );
};
