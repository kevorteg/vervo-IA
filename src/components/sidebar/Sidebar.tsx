
import { useState } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Settings, 
  Phone, 
  Book, 
  User,
  HelpCircle,
  LogOut,
  UserX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HelpModal } from '../HelpModal';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Conversation {
  id: string;
  titulo: string;
  updated_at: string;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  conversations: Conversation[];
  currentConversationId?: string;
  onSelectConversation: (id: string) => void;
  user: any;
  darkMode: boolean;
  onContactLeader: () => void;
  onOpenSettings: () => void;
  isGuestMode?: boolean;
  onExitGuestMode?: () => void;
}

export const Sidebar = ({
  isOpen,
  onToggle,
  onNewChat,
  conversations,
  currentConversationId,
  onSelectConversation,
  user,
  darkMode,
  onContactLeader,
  onOpenSettings,
  isGuestMode = false,
  onExitGuestMode,
}: SidebarProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const { toast } = useToast();

  const filteredConversations = conversations.filter(conv =>
    conv.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('es-ES', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    }
  };

  const handleSignOut = async () => {
    if (isGuestMode && onExitGuestMode) {
      if (confirm('¿Estás seguro de que quieres salir del modo invitado?')) {
        onExitGuestMode();
      }
      return;
    }
    
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      try {
        await supabase.auth.signOut();
        toast({
          title: "Sesión cerrada",
          description: "Has cerrado sesión exitosamente.",
        });
      } catch (error) {
        console.error('Error signing out:', error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-aurora-primario flex items-center justify-center">
                <span className="text-white font-bold text-sm">MJ</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">ChatMJ</span>
                {isGuestMode && (
                  <span className="block text-xs text-orange-500 dark:text-orange-400">Modo Invitado</span>
                )}
              </div>
            </div>
          </div>
          
          <Button
            onClick={onNewChat}
            className="w-full bg-aurora-primario hover:bg-orange-600 text-white flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>{isGuestMode ? 'Nueva conversación temporal' : 'Nueva conversación'}</span>
          </Button>
        </div>

        {/* Search - Solo mostrar si no es modo invitado */}
        {!isGuestMode && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar conversaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
            </div>
          </div>
        )}

        {/* Conversations List o información de modo invitado */}
        <div className="flex-1 overflow-y-auto">
          {isGuestMode ? (
            <div className="p-4 text-center">
              <UserX className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                Estás en modo invitado
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Las conversaciones no se guardan. Regístrate para acceder a todas las funcionalidades.
              </p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {searchTerm ? 'No se encontraron conversaciones' : 'No hay conversaciones aún'}
              </p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    currentConversationId === conversation.id
                      ? 'bg-aurora-primario text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium truncate flex-1">
                      {conversation.titulo}
                    </span>
                    <span className={`text-xs ml-2 ${
                      currentConversationId === conversation.id
                        ? 'text-white/70'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {formatDate(conversation.updated_at)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-2">
          <Button
            variant="ghost"
            onClick={onContactLeader}
            className="w-full justify-start space-x-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Phone className="w-4 h-4" />
            <span>Contactar Líder</span>
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => window.open('https://misionjuvenil.org/biblioteca', '_blank')}
            className="w-full justify-start space-x-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Book className="w-4 h-4" />
            <span>Biblioteca Espiritual</span>
          </Button>

          <Button
            variant="ghost"
            onClick={() => setShowHelp(true)}
            className="w-full justify-start space-x-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Ayuda</span>
          </Button>
          
          <Button
            variant="ghost"
            onClick={onOpenSettings}
            className="w-full justify-start space-x-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Settings className="w-4 h-4" />
            <span>Configuración</span>
          </Button>
        </div>

        {/* User info */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              {isGuestMode ? <UserX className="w-4 h-4 text-gray-600 dark:text-gray-400" /> : <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {isGuestMode ? 'Usuario Invitado' : user?.email || 'Usuario'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isGuestMode ? 'Sesión temporal' : 'En línea'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              title={isGuestMode ? 'Salir del modo invitado' : 'Cerrar sesión'}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </>
  );
};
