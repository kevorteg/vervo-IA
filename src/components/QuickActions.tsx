
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
      color: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
      description: 'Conocer a Jesús'
    }
  ];

  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
      <div className="flex gap-2 min-w-max px-1">
        {actions.map((action) => {
          const IconComponent = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onActionClick(action.id)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium
                bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm
                transition-all duration-200 whitespace-nowrap text-gray-700 dark:text-gray-200
              `}
            >
              <IconComponent className={`w-4 h-4 ${action.color.split(' ')[1]}`} />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
