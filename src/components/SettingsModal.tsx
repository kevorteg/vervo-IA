
import { useState } from 'react';
import { Settings, X, Moon, Sun, Bell, Shield, User, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

  const handleSave = () => {
    // Aquí puedes implementar la lógica para guardar las configuraciones
    console.log('Configuraciones guardadas:', {
      darkMode,
      notifications,
      soundEnabled,
      displayName
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Configuración</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Perfil */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <h3 className="font-medium">Perfil</h3>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">
                Nombre para mostrar
              </label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Tu nombre"
                className="mt-1"
              />
            </div>
          </div>

          {/* Apariencia */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4" />
              <h3 className="font-medium">Apariencia</h3>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Modo oscuro</span>
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleDarkMode}
                className="flex items-center space-x-2"
              >
                {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                <span>{darkMode ? 'Oscuro' : 'Claro'}</span>
              </Button>
            </div>
          </div>

          {/* Notificaciones */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <h3 className="font-medium">Notificaciones</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Notificaciones push</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNotifications(!notifications)}
                  className={notifications ? 'bg-aurora-primario text-white' : ''}
                >
                  {notifications ? 'Activado' : 'Desactivado'}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Sonidos</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={soundEnabled ? 'bg-aurora-primario text-white' : ''}
                >
                  {soundEnabled ? 'Activado' : 'Desactivado'}
                </Button>
              </div>
            </div>
          </div>

          {/* Privacidad */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <h3 className="font-medium">Privacidad</h3>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>Tus conversaciones están protegidas y encriptadas.</p>
              <p className="mt-1">Solo tú y los moderadores autorizados pueden acceder a ellas.</p>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex space-x-3 pt-4">
            <Button
              onClick={handleSave}
              className="flex-1 bg-aurora-primario hover:bg-orange-600 text-white"
            >
              Guardar cambios
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
