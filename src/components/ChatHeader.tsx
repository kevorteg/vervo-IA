
import { Bot, Menu, Sun, Moon, MessageSquare } from 'lucide-react';

interface ChatHeaderProps {
  onToggleSidebar: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  userName?: string;
  isGuestMode?: boolean;
}

export const ChatHeader = ({ onToggleSidebar, darkMode, onToggleDarkMode, userName, isGuestMode }: ChatHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors md:hidden"
        >
          <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-md">
            <img
              src={darkMode ? "/logo-negro.png" : "/logo-azul.png"}
              alt="Misión Juvenil"
              className="w-8 h-8 object-contain"
            />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
              Verbo IA {userName && `- ${userName}`}
              {isGuestMode && (
                <span className="text-sm text-purple-500 dark:text-purple-400 ml-2">(Invitado)</span>
              )}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              IA cristiana • Aurora Celestial
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <MessageSquare className="w-4 h-4" />
          <span>{isGuestMode ? 'Modo Invitado' : 'En línea'}</span>
        </div>

        <button
          onClick={onToggleDarkMode}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
