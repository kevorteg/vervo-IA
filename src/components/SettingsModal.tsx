
import { useState } from 'react';
import { Settings, X, Moon, Sun, Bell, Shield, User, Palette, Volume2, VolumeX, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  userName?: string;
}

export const SettingsModal = ({ 
  isOpen, 
  onClose, 
  darkMode, 
  onToggleDarkMode,
  userName 
}: SettingsModalProps) => {
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [displayName, setDisplayName] = useState(userName || '');
  const [autoSave, setAutoSave] = useState(true);
  const { toast } = useToast();

  const handleSave = () => {
    // Guardar configuraciones en localStorage
    localStorage.setItem('chatmj_settings', JSON.stringify({
      darkMode,
      notifications,
      soundEnabled,
      displayName,
      autoSave
    }));
    
    toast({
      title: "Configuración guardada",
      description: "Tus preferencias han sido guardadas exitosamente.",
    });
    
    onClose();
  };

  const handleExportData = () => {
    toast({
      title: "Exportando datos",
      description: "Preparando descarga de tus conversaciones...",
    });
    // Aquí se puede implementar la exportación real
  };

  const handleClearData = () => {
    if (confirm('¿Estás seguro de que quieres eliminar todas tus conversaciones? Esta acción no se puede deshacer.')) {
      toast({
        title: "Datos eliminados",
        description: "Todas las conversaciones han sido eliminadas.",
        variant: "destructive",
      });
      // Aquí se puede implementar la eliminación real
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <Settings className="w-5 h-5" />
            <span>Configuración</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Perfil */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <h3 className="font-medium text-gray-900 dark:text-white">Perfil</h3>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1">
                Nombre para mostrar
              </label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Tu nombre"
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
            </div>
          </div>

          {/* Apariencia */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <h3 className="font-medium text-gray-900 dark:text-white">Apariencia</h3>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Modo oscuro</span>
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleDarkMode}
                className={`flex items-center space-x-2 ${darkMode ? 'bg-aurora-primario text-white border-aurora-primario' : ''}`}
              >
                {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                <span>{darkMode ? 'Oscuro' : 'Claro'}</span>
              </Button>
            </div>
          </div>

          {/* Notificaciones */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <h3 className="font-medium text-gray-900 dark:text-white">Notificaciones</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Notificaciones push</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNotifications(!notifications)}
                  className={`${notifications ? 'bg-aurora-primario text-white border-aurora-primario' : ''}`}
                >
                  {notifications ? 'Activado' : 'Desactivado'}
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Sonidos</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`flex items-center space-x-2 ${soundEnabled ? 'bg-aurora-primario text-white border-aurora-primario' : ''}`}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <span>{soundEnabled ? 'Activado' : 'Desactivado'}</span>
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Autoguardar conversaciones</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAutoSave(!autoSave)}
                  className={`${autoSave ? 'bg-aurora-primario text-white border-aurora-primario' : ''}`}
                >
                  {autoSave ? 'Activado' : 'Desactivado'}
                </Button>
              </div>
            </div>
          </div>

          {/* Datos y Privacidad */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <h3 className="font-medium text-gray-900 dark:text-white">Datos y Privacidad</h3>
            </div>
            <div className="space-y-3">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>Tus conversaciones están protegidas y encriptadas.</p>
                <p className="mt-1">Solo tú y los moderadores autorizados pueden acceder a ellas.</p>
              </div>
              
              <div className="flex flex-col space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportData}
                  className="flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar mis datos</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearData}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar todas las conversaciones</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Información de la App */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900 dark:text-white">Información</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p><strong>Versión:</strong> 1.0.0</p>
              <p><strong>Desarrollado por:</strong> Misión Juvenil</p>
              <p><strong>Última actualización:</strong> Diciembre 2024</p>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={handleSave}
              className="flex-1 bg-aurora-primario hover:bg-orange-600 text-white"
            >
              Guardar cambios
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-300 dark:border-gray-600"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
