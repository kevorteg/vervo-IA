
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Mail, Lock, UserX } from 'lucide-react';

interface LoginFormProps {
  onSuccess: () => void;
  onGuestMode: () => void;
}

export const LoginForm = ({ onSuccess, onGuestMode }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });
        if (error) throw error;
        setError('Te hemos enviado un email de confirmación. Por favor revisa tu bandeja de entrada.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onSuccess();
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setError(error.message || 'Ha ocurrido un error. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
      <div className="text-center mb-8">
        <div className="w-12 h-12 mx-auto mb-4 bg-aurora-primario rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-xl">MJ</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {isSignUp ? 'Únete a Verbo IA' : 'Bienvenido a Verbo IA'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {isSignUp ? 'Crea tu cuenta para continuar' : 'Inicia sesión para continuar'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </Label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              placeholder="tu@email.com"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Contraseña
          </Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 h-12 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {isSignUp && (
            <button
              type="button"
              onClick={() => {
                const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
                const passwordLength = 12;
                let randomPassword = "";
                for (let i = 0; i < passwordLength; i++) {
                  randomPassword += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                setPassword(randomPassword);
                setShowPassword(true); // Show the generated password so they can copy it
              }}
              className="mt-2 text-xs text-aurora-primario hover:underline flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wand-2 mr-1"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z" /><path d="m14 7 3 3" /><path d="M5 6v4" /><path d="M19 14v4" /><path d="M10 2v2" /><path d="M7 8H3" /><path d="M21 16h-4" /><path d="M11 3H9" /></svg>
              Generar clave segura
            </button>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-aurora-primario hover:bg-purple-700 text-white font-medium"
        >
          {isLoading ? 'Cargando...' : (isSignUp ? 'Crear cuenta' : 'Iniciar sesión')}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-aurora-primario hover:underline text-sm"
        >
          {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
        </button>
      </div>

      {/* Guest Mode Button - Ahora prioritario */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          onClick={onGuestMode}
          className="w-full h-12 bg-aurora-primario hover:bg-purple-700 text-white font-medium"
        >
          <UserX className="w-4 h-4 mr-2" />
          Continuar como invitado
        </Button>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          Acceso inmediato • Conversa sin registrarte
        </p>
      </div>
    </div>
  );
};
