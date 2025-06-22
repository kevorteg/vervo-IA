
import { Heart, BookOpen, Hand, Cross } from 'lucide-react';

interface QuickActionsProps {
  onActionClick: (action: string) => void;
}

export const QuickActions = ({ onActionClick }: QuickActionsProps) => {
  const actions = [
    {
      id: 'prayer',
      label: 'Oración',
      icon: Hand,
      color: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
      description: 'Oremos juntos'
    },
    {
      id: 'devotional',
      label: 'Devocional',
      icon: BookOpen,
      color: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
      description: 'Palabra de hoy'
    },
    {
      id: 'crisis',
      label: 'Ayuda',
      icon: Heart,
      color: 'bg-red-50 text-red-600 hover:bg-red-100',
      description: 'Necesito apoyo'
    },
    {
      id: 'evangelism',
      label: 'Salvación',
      icon: Cross,
      color: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
      description: 'Conocer a Jesús'
    }
  ];

  return (
    <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
      <div className="flex flex-wrap gap-2 justify-center">
        {actions.map((action) => {
          const IconComponent = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onActionClick(action.id)}
              className={`
                flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium
                transition-all duration-200 hover:scale-105 ${action.color}
              `}
            >
              <IconComponent className="w-4 h-4" />
              <span className="hidden sm:inline">{action.label}</span>
              <span className="sm:hidden">{action.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
