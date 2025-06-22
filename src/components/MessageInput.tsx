
import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Paperclip } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
}

export const MessageInput = ({ onSendMessage }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm p-4">
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        {/* Attachment button */}
        <button
          type="button"
          className="p-2 text-gray-500 hover:text-aurora-primario transition-colors rounded-lg hover:bg-gray-50"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Message input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu mensaje aquí... (Presiona Enter para enviar)"
            className="w-full resize-none border border-gray-300 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-aurora-primario focus:border-transparent max-h-32 bg-white"
            rows={1}
          />
          
          {/* Voice recording button */}
          <button
            type="button"
            onClick={() => setIsRecording(!isRecording)}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
              isRecording 
                ? 'text-red-500 bg-red-50' 
                : 'text-gray-500 hover:text-aurora-primario hover:bg-gray-50'
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={!message.trim()}
          className={`p-3 rounded-full transition-all duration-200 ${
            message.trim()
              ? 'bg-aurora-primario text-white hover:bg-orange-600 hover:scale-105 aurora-shadow'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
      
      <div className="text-xs text-gray-500 mt-2 text-center">
        ChatMJ puede cometer errores. Considera verificar información importante con líderes de Misión Juvenil.
      </div>
    </div>
  );
};

export default MessageInput;
