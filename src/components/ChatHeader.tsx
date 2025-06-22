
import { MessageCircle, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  onContactLeader: () => void;
}

export const ChatHeader = ({ onContactLeader }: ChatHeaderProps) => {
  return (
    <div className="bg-header-gradient text-white p-4 rounded-t-xl shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-playfair text-xl font-semibold">ChatMJ</h1>
            <p className="text-sm opacity-90 flex items-center space-x-1">
              <div className="w-2 h-2 bg-aurora-gold rounded-full animate-pulse-soft"></div>
              <span>Orando por ti</span>
            </p>
          </div>
        </div>
        
        <Button
          onClick={onContactLeader}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 transition-colors duration-200"
        >
          <Users className="w-4 h-4 mr-2" />
          Hablar con líder
        </Button>
      </div>
      
      <div className="mt-3 text-center">
        <p className="text-sm opacity-90 font-inter">
          <Sparkles className="w-4 h-4 inline mr-1" />
          Inteligencia con propósito eterno
        </p>
        <p className="text-xs opacity-75 mt-1 italic">
          "La boca del justo imparte sabiduría" - Salmo 37:30
        </p>
      </div>
    </div>
  );
};
