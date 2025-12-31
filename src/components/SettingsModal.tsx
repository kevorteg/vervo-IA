
import { useState, useEffect } from 'react';
import { X, Moon, Sun, Download, Trash2, User, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  userName?: string;
  isGuestMode?: boolean;
  onExitGuestMode?: () => void;
  onProfileUpdated?: () => void;
}

export const SettingsModal = ({
  isOpen,
  onClose,
  darkMode,
  onToggleDarkMode,
  userName,
  isGuestMode = false,
  onExitGuestMode,
  onProfileUpdated
}: SettingsModalProps) => {
  const { toast } = useToast();

  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          const { data, error } = await (supabase as any)
            .from('perfiles')
            .select('avatar_url, rol')
            .eq('id', user.id)
            .single();

          if (data) {
            setAvatarUrl(data.avatar_url || '');
            setIsAdmin(data.rol === 'admin');
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    if (isOpen && !isGuestMode) {
      loadProfile();
    }
  }, [isOpen, isGuestMode]);

  if (!isOpen) return null;



  const handleSaveProfile = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { error } = await (supabase as any)
        .from('perfiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Perfil actualizado",
        description: "Tu foto de perfil se ha guardado correctamente.",
      });

      if (onProfileUpdated) {
        onProfileUpdated();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    if (isGuestMode) {
      toast({
        title: "No disponible",
        description: "No hay datos para exportar en modo invitado.",
        variant: "destructive",
      });
      return;
    }

    // Implementar exportación de datos
    toast({
      title: "Exportando datos",
      description: "Se descargará un archivo con tus conversaciones.",
    });
  };



  const handleDeleteData = async () => {
    if (isGuestMode) {
      toast({
        title: "No disponible",
        description: "No hay datos para eliminar en modo invitado.",
        variant: "destructive",
      });
      return;
    }

    setShowDeleteDialog(true);
  };

  const confirmDeleteData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Get all conversations first to filter related data if needed, 
      // but simpler is to delete by conversation_id join if possible. 
      // Since supabase client typical delete is single table, we iterate or delete filtered.
      // But we can delete messages where conversation_id in (select id from conversaciones where user_id = user.id)
      // Actually, standard RLS might prevent deleting others' data, so:

      // Step A: Delete all messages for this user's conversations
      // We first find the user's conversation IDs
      const { data: conversations } = await supabase
        .from('conversaciones')
        .select('id')
        .eq('usuario_id', user.id);

      if (conversations && conversations.length > 0) {
        const conversationIds = conversations.map(c => c.id);



        // Delete messages
        await supabase
          .from('mensajes')
          .delete()
          .in('conversacion_id', conversationIds);
      }

      // Step B: Delete conversations
      const { error: convError } = await supabase
        .from('conversaciones')
        .delete()
        .eq('usuario_id', user.id);

      if (convError) throw convError;

      toast({
        title: "Datos eliminados",
        description: "Todo tu historial de conversaciones ha sido borrado.",
      });

      // Refresh page to clear state
      window.location.reload();

    } catch (error: any) {
      console.error('Error deleting data:', error);
      toast({
        title: "Error al eliminar",
        description: error.message || "No se pudo eliminar los datos. Verifica los permisos (RLS) en Supabase.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Configuración</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Información del usuario */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            {isGuestMode ? (
              <UserX className="w-8 h-8 text-gray-400" />
            ) : avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-12 h-12 rounded-full object-cover border border-gray-200" />
            ) : (
              <User className="w-8 h-8 text-gray-400" />
            )}
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white break-all">
                {isGuestMode ? 'Usuario Invitado' : (userName || 'Usuario')}
              </p>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isGuestMode ? 'Sesión temporal' : 'Usuario registrado'}
                </p>
                {isAdmin && (
                  <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full font-medium">
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>

          {!isGuestMode && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Foto de Perfil (URL)
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://ejemplo.com/foto.jpg"
                  className="flex-1 p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                />
                <Button onClick={handleSaveProfile} disabled={loading} size="sm">
                  {loading ? '...' : 'Guardar'}
                </Button>
              </div>
            </div>
          )}

          {/* Tema */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Tema</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Cambia entre modo claro y oscuro
              </p>
            </div>
            <button
              onClick={onToggleDarkMode}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>

          {/* Datos del usuario */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900 dark:text-white">Datos del usuario</h3>

            <Button
              onClick={handleExportData}
              variant="outline"
              className="w-full justify-start space-x-2"
              disabled={isGuestMode}
            >
              <Download className="w-4 h-4" />
              <span>Exportar mis datos</span>
            </Button>

            <Button
              onClick={handleDeleteData}
              variant="outline"
              className="w-full justify-start space-x-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              disabled={isGuestMode}
            >
              <Trash2 className="w-4 h-4" />
              <span>Eliminar todos mis datos</span>
            </Button>
          </div>

          {/* Salir del modo invitado */}
          {isGuestMode && onExitGuestMode && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={() => {
                  onExitGuestMode();
                  onClose();
                }}
                className="w-full bg-aurora-primario hover:bg-purple-700 text-white"
              >
                Registrarse / Iniciar sesión
              </Button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Registrándote podrás guardar tus conversaciones
              </p>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Eliminará permanentemente todas tus conversaciones y mensajes asociados a tu cuenta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteData} className="bg-red-600 hover:bg-red-700">
              {loading ? "Eliminando..." : "Eliminar todo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
