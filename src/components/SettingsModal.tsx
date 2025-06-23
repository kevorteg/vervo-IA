
import { X, Moon, Sun, Download, Trash2, User, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  userName?: string;
  isGuestMode?: boolean;
  onExitGuestMode?: () => void;
}

export const SettingsModal = ({ 
  isOpen, 
  onClose, 
  darkMode, 
  onToggleDarkMode, 
  userName,
  isGuestMode = false,
  onExitGuestMode 
}: SettingsModalProps) => {
  const { toast } = useToast();

  if (!isOpen) return null;

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

  const handleDeleteData = () => {
    if (isGuestMode) {
      toast({
        title: "No disponible",
        description: "No hay datos para eliminar en modo invitado.",
        variant: "destructive",
      });
      return;
    }

    if (confirm('¿Estás seguro de que quieres eliminar todos tus datos? Esta acción no se puede deshacer.')) {
      // Implementar eliminación de datos
      toast({
        title: "Datos eliminados",
        description: "Todos tus datos han sido eliminados.",
      });
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
            ) : (
              <User className="w-8 h-8 text-gray-400" />
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {isGuestMode ? 'Usuario Invitado' : (userName || 'Usuario')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isGuestMode ? 'Sesión temporal' : 'Usuario registrado'}
              </p>
            </div>
          </div>

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
                className="w-full bg-aurora-primario hover:bg-orange-600 text-white"
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
    </div>
  );
};
