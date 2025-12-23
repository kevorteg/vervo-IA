import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  UserX,
  LayoutDashboard,
  Database,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HelpModal } from '../HelpModal';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  onDeleteConversation?: (id: string) => void;
  user: SupabaseUser | null;
  darkMode: boolean;
  onContactLeader: () => void;
  onOpenSettings: () => void;
  isGuestMode?: boolean;
  onExitGuestMode?: () => void;
  isAdmin?: boolean;
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
  isAdmin = false,
  onDeleteConversation
}: SidebarProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showExitGuestDialog, setShowExitGuestDialog] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const filteredConversations = conversations.filter(conversation =>
    conversation.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleSignOutClick = () => {
    if (isGuestMode) {
      setShowExitGuestDialog(true);
    } else {
      setShowLogoutDialog(true);
    }
  };

  const confirmSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente.",
      });
      setShowLogoutDialog(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const confirmExitGuest = () => {
    if (onExitGuestMode) {
      onExitGuestMode();
    }
    setShowExitGuestDialog(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
        {/* ... Header and Search ... */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center shadow-md">
                <img
                  src={darkMode ? "/logo-negro.png" : "/logo-azul.png"}
                  alt="Misión Juvenil"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">Verbo IA</span>
                {isGuestMode && (
                  <span className="block text-xs text-purple-500 dark:text-purple-400">Modo Invitado</span>
                )}
              </div>
            </div>
          </div>

          <Button
            onClick={onNewChat}
            className="w-full bg-aurora-primario hover:bg-purple-700 text-white flex items-center space-x-2"
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

        {/* Conversations List ... */}
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
                  className={`w-full text-left p-3 rounded-lg transition-colors ${currentConversationId === conversation.id
                    ? 'bg-aurora-primario text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                >
                  <div className="flex justify-between items-start group">
                    <span className="text-sm font-medium truncate flex-1 pr-2">
                      {conversation.titulo}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs ${currentConversationId === conversation.id
                        ? 'text-white/70'
                        : 'text-gray-500 dark:text-gray-400'
                        }`}>
                        {formatDate(conversation.updated_at)}
                      </span>
                      {!isGuestMode && onDeleteConversation && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConversationToDelete(conversation.id);
                          }}
                          className={`opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-all ${currentConversationId === conversation.id ? 'text-white/90 hover:text-white hover:bg-white/20' : 'text-gray-400 hover:text-red-500'
                            }`}
                          title="Eliminar conversación"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions ... */}
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
            onClick={() => navigate('/biblioteca')}
            className="w-full justify-start space-x-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Book className="w-4 h-4" />
            <span>Biblioteca Espiritual</span>
          </Button>

          <Button
            variant="ghost"
            onClick={() => navigate('/diario')}
            className="w-full justify-start space-x-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Book className="w-4 h-4" />
            <span>Diario de Oración</span>
          </Button>

          <Button
            variant="ghost"
            onClick={() => setShowHelp(true)}
            className="w-full justify-start space-x-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Ayuda</span>
          </Button>

          {isAdmin && (
            <>
              <div className="my-2 border-t border-gray-200 dark:border-gray-700" />
              <p className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Administración
              </p>
              <Button
                variant="ghost"
                onClick={() => navigate('/entrenamiento')}
                className="w-full justify-start space-x-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                <Database className="w-4 h-4" />
                <span>Entrenamiento IA</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/admin')}
                className="w-full justify-start space-x-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Panel de Control</span>
              </Button>
              <div className="my-2 border-t border-gray-200 dark:border-gray-700" />
            </>
          )}

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
                {isGuestMode ? 'Sesión temporal' : isAdmin ? (
                  <span className="text-purple-600 font-semibold">Administrador</span>
                ) : 'En línea'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOutClick}
              className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              title={isGuestMode ? 'Salir del modo invitado' : 'Cerrar sesión'}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
            <AlertDialogDescription>
              Tendrás que volver a ingresar tus credenciales para acceder a tu cuenta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSignOut} className="bg-aurora-primario hover:bg-purple-700">
              Cerrar sesión
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showExitGuestDialog} onOpenChange={setShowExitGuestDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Salir del Modo Invitado?</AlertDialogTitle>
            <AlertDialogDescription>
              Tus conversaciones temporales se perderán. Regístrate para guardar tu historial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmExitGuest} className="bg-aurora-primario hover:bg-purple-700">
              Salir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!conversationToDelete} onOpenChange={(open) => !open && setConversationToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar conversación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La conversación se eliminará permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (conversationToDelete && onDeleteConversation) {
                  onDeleteConversation(conversationToDelete);
                  setConversationToDelete(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
