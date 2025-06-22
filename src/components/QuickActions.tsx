
import { Heart, HelpCircle, Sparkles, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickActionsProps {
  onQuickAction: (action: string) => void;
}

export const QuickActions = ({ onQuickAction }: QuickActionsProps) => {
  const quickActions = [
    {
      id: 'prayer',
      label: 'Quiero oración',
      icon: Heart,
      message: 'Hola ChatMJ, necesito oración por algo que me preocupa'
    },
    {
      id: 'sad',
      label: 'Estoy triste',
      icon: HelpCircle,
      message: 'Me siento triste y necesito palabras de aliento'
    },
    {
      id: 'doubts',
      label: 'Tengo dudas sobre Dios',
      icon: Sparkles,
      message: 'Tengo algunas dudas sobre la fe y necesito ayuda'
    },
    {
      id: 'about-mj',
      label: '¿Qué es MJ?',
      icon: Info,
      message: '¿Puedes contarme sobre Misión Juvenil?'
    }
  ];

  return (
    <div className="p-4 bg-white/70 backdrop-blur-sm border-t border-aurora-violet/20">
      <p className="text-sm text-aurora-violet font-medium mb-3 text-center">
        ¿En qué puedo ayudarte hoy?
      </p>
      <div className="grid grid-cols-2 gap-2">
        {quickActions.map((action) => (
          <Button
            key={action.id}
            onClick={() => onQuickAction(action.message)}
            variant="outline"
            className="h-auto p-3 text-left hover:bg-aurora-violet/10 hover:border-aurora-violet/30 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-2">
              <action.icon className="w-4 h-4 text-aurora-violet group-hover:text-aurora-celestial transition-colors" />
              <span className="text-xs font-medium text-gray-700 group-hover:text-aurora-violet">
                {action.label}
              </span>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};
