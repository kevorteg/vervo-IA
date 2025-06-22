
import { Bot, Menu, Sun, Moon } from 'lucide-react';
import { useState } from 'react';

interface ChatHeaderProps {
  onToggleSidebar: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const ChatHeader = ({ onToggleSidebar, darkMode, onToggleDarkMode }: ChatHeaderProps) => {
  const [showTitle, setShowTitle] = useState(false);

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors md:hidden"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-message-gradient flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-800">ChatMJ</h1>
            <p className="text-xs text-gray-500">IA cristiana • Aurora Celestial</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={onToggleDarkMode}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-gray-600" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
