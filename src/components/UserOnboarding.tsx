
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, UserX } from 'lucide-react';

interface UserOnboardingProps {
  onComplete: (userData: { name?: string; isAnonymous: boolean }) => void;
}

export const UserOnboarding = ({ onComplete }: UserOnboardingProps) => {
  const [name, setName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  const handleAnonymous = () => {
    onComplete({ isAnonymous: true });
  };

  const handleWithName = () => {
    if (!showNameInput) {
      setShowNameInput(true);
      return;
    }

    if (name.trim()) {
      onComplete({ name: name.trim(), isAnonymous: false });
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-aurora-primario rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-2xl">MJ</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          ¡Bienvenido a Verbo IA! 🙏
        </h1>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          Soy tu compañera espiritual de Misión Juvenil. Estoy aquí para acompañarte en tu caminar con Cristo.
        </p>
      </div>

      <div className="space-y-4">
        <div className="text-center mb-6">
          <p className="text-gray-700 dark:text-gray-300 font-medium mb-4">
            ¿Cómo te gustaría que te llame?
          </p>
        </div>

        {showNameInput && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tu nombre (opcional)
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 h-12"
                placeholder="Escribe tu nombre aquí..."
                autoFocus
              />
            </div>
            <Button
              onClick={handleWithName}
              disabled={!name.trim()}
              className="w-full h-12 bg-aurora-primario hover:bg-purple-700 text-white"
            >
              <User className="w-4 h-4 mr-2" />
              Continuar como {name || 'usuario'}
            </Button>
          </div>
        )}

        {!showNameInput && (
          <div className="space-y-3">
            <Button
              onClick={handleWithName}
              className="w-full h-12 bg-aurora-primario hover:bg-purple-700 text-white"
            >
              <User className="w-4 h-4 mr-2" />
              Quiero decirte mi nombre
            </Button>

            <Button
              onClick={handleAnonymous}
              variant="outline"
              className="w-full h-12 border-gray-300 dark:border-gray-600"
            >
              <UserX className="w-4 h-4 mr-2" />
              Continuar de forma anónima
            </Button>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Tu privacidad es importante. Puedes cambiar estas preferencias en cualquier momento.
        </p>
      </div>
    </div>
  );
};
