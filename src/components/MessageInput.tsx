
import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Paperclip, Loader2 } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isDisabled?: boolean;
}

export const MessageInput = ({ onSendMessage, isDisabled = false }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'es-ES';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setMessage(prev => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        // Auto restart if still recording (optional, handled by react state mainly)
        if (isRecording) {
          // recognitionRef.current.start();
        } else {
          setIsRecording(false);
        }
      };
    }
  }, [isRecording]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsRecording(true);
      } else {
        alert('Tu navegador no soporta reconocimiento de voz.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isSending && !isDisabled) {
      if (isRecording) {
        toggleRecording();
      }
      setIsSending(true);
      try {
        await onSendMessage(message.trim());
        setMessage('');
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-white dark:bg-gray-800 p-2 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 dark:border-gray-700">
        {/* Attachment button */}
        <button
          type="button"
          className="bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-aurora-primario transition-colors p-3 rounded-full hover:bg-blue-50 dark:hover:bg-gray-700"
          disabled={isDisabled}
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Message input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? "Escuchando... (Habla ahora)" : "Escribe tu mensaje aquí... (Presiona Enter para enviar)"}
            className="w-full resize-none bg-transparent border-none focus:ring-0 px-4 py-3.5 pr-14 max-h-32 text-gray-900 dark:text-white placeholder-gray-400 text-lg"
            rows={1}
            disabled={isDisabled || isSending}
          />

          {/* Voice recording button */}
          <button
            type="button"
            onClick={toggleRecording}
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all duration-300 ${isRecording
              ? 'text-white bg-red-500 animate-pulse shadow-red-200 shadow-lg scale-110'
              : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700'
              }`}
            disabled={isDisabled}
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={!message.trim() || isSending || isDisabled}
          className={`p-3 rounded-full transition-all duration-200 ${message.trim() && !isSending && !isDisabled
            ? 'bg-aurora-primario text-white hover:bg-purple-700 hover:scale-105 aurora-shadow'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
        >
          {isSending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
