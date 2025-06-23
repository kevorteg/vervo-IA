
import { useState } from 'react';
import { Plus, MessageSquare, Search, Library, Settings, Menu, X, User, LogOut, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  conversations: Array<{
    id: string;
    titulo: string;
    updated_at: string;
  }>;
  currentConversationId?: string;
  onSelectConversation: (id: string) => void;
  user: any;
  darkMode: boolean;
  onOpenSettings?: () => void;
  onOpenLibrary?: () => void;
  onContactLeader?: () => void;
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
  onOpenSettings,
  onOpenLibrary,
  onContactLeader
}: SidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { toast } = useToast();

  const filteredConversations = conversations.filter(conv => 
    conv.titulo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión",
        variant: "destructive",
      });
    }
  };

  const handleSettings = () => {
    if (onOpenSettings) {
      onOpenSettings();
    } else {
      toast({
        title: "Configuración",
        description: "Próximamente disponible",
      });
    }
  };

  const handleLibrary = () => {
    if (onOpenLibrary) {
      onOpenLibrary();
    } else {
      toast({
        title: "Biblioteca Espiritual",
        description: "Próximamente disponible",
      });
    }
  };

  const handleContactLeader = () => {
    if (onContactLeader) {
      onContactLeader();
    } else {
      // Abrir WhatsApp con un número de ejemplo
      const message = encodeURIComponent("Hola, necesito ayuda espiritual desde ChatMJ");
      window.open(`https://wa.me/1234567890?text=${message}`, '_blank');
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 
        transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:relative
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-aurora-primario rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">MJ</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">ChatMJ</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="md:hidden"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <Button
            onClick={onNewChat}
            className="w-full justify-start bg-aurora-primario hover:bg-orange-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva conversación
          </Button>
        </div>

        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar conversaciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-4">
          <div className="space-y-2">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`
                    w-full text-left p-3 rounded-lg transition-colors flex items-center space-x-3
                    ${currentConversationId === conversation.id 
                      ? 'bg-aurora-primario/10 text-aurora-primario border-l-2 border-aurora-primario' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }
                  `}
                >
                  <MessageSquare className="w-4 h-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{conversation.titulo}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(conversation.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay conversaciones aún</p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Leader Button */}
        <div className="px-4 pb-4">
          <Button
            onClick={handleContactLeader}
            variant="outline"
            className="w-full justify-start border-aurora-primario text-aurora-primario hover:bg-aurora-primario hover:text-white"
          >
            <Phone className="w-4 h-4 mr-2" />
            Contactar Líder
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-gray-700 dark:text-gray-300"
            onClick={handleLibrary}
          >
            <Library className="w-4 h-4 mr-3" />
            Biblioteca Espiritual
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-gray-700 dark:text-gray-300"
            onClick={handleSettings}
          >
            <Settings className="w-4 h-4 mr-3" />
            Configuración
          </Button>
        </div>

        {/* User Profile */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="w-8 h-8 bg-aurora-usuario rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.email || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  En línea
                </p>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                <button
                  onClick={handleSignOut}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
