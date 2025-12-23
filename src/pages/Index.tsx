
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { ChatInterface } from '@/components/ChatInterface';
import { LoginForm } from '@/components/auth/LoginForm';
import { Sun, Moon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });

  useEffect(() => {
    const checkUserRole = async (uid: string) => {
      try {
        console.log('Checking role for uid:', uid);
        const { data, error } = await (supabase as any)
          .from('perfiles')
          .select('rol')
          .eq('id', uid)
          .single();

        if (error) {
          console.error('Error fetching role:', error);
          // DEBUG: Show error to user
          // toast({ title: "Debug: Error checking role", description: error.message, variant: "destructive" });
        }

        if (data && data.rol === 'admin') {
          console.log('User is admin');
          setIsAdmin(true);
          // toast({ title: "Modo Administrador Activo", description: "Se han habilitado las funciones de gestión.", duration: 3000 });
        } else {
          console.log('User is NOT admin', data);
          setIsAdmin(false);
          // DEBUG: Explain why
          // toast({ title: "Debug: No eres admin", description: `Rol encontrado: ${data?.rol || 'ninguno'}` });
        }
      } catch (error) {
        console.warn('Error checking role:', error);
        setIsAdmin(false);
      }
    };

    // Listen for auth changes first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setLoading(false);
        if (session) {
          setIsGuestMode(false);
          checkUserRole(session.user.id);
        } else {
          setIsAdmin(false);
        }
      }
    );

    // Then get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session) {
        checkUserRole(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleLoginSuccess = () => {
    setIsGuestMode(false);
  };

  const handleGuestMode = () => {
    setIsGuestMode(true);
    setLoading(false);
  };

  const handleExitGuestMode = () => {
    setIsGuestMode(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-aurora-gradient dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center animate-pulse shadow-lg">
            <img
              src={darkMode ? "/logo-negro.png" : "/logo-azul.png"}
              alt="Misión Juvenil"
              className="w-12 h-12 object-contain"
            />
          </div>
          <p className="text-gray-600 dark:text-gray-400">Cargando Verbo IA...</p>
        </div>
      </div>
    );
  }

  // Mostrar interfaz de login si no hay sesión Y no está en modo invitado
  if (!session && !isGuestMode) {
    return (
      <div className={`min-h-screen bg-aurora-gradient dark:bg-gray-900 flex items-center justify-center p-4 ${darkMode ? 'dark' : ''}`}>
        <div className="w-full max-w-6xl flex items-center justify-center">
          <div className="w-full max-w-md">
            <LoginForm
              onSuccess={handleLoginSuccess}
              onGuestMode={handleGuestMode}
            />

            <div className="flex justify-center mt-6">
              <button
                onClick={handleToggleDarkMode}
                className="p-2 rounded-lg bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-gray-800/30 transition-colors"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="fixed top-10 left-10 w-20 h-20 bg-aurora-violet/10 rounded-full blur-xl"></div>
        <div className="fixed top-32 right-20 w-16 h-16 bg-aurora-celestial/10 rounded-full blur-lg"></div>
        <div className="fixed bottom-20 left-32 w-12 h-12 bg-aurora-gold/10 rounded-full blur-md"></div>
        <div className="fixed bottom-40 right-10 w-24 h-24 bg-aurora-violet/5 rounded-full blur-2xl"></div>
      </div>
    );
  }

  // Mostrar ChatInterface si hay sesión O está en modo invitado
  return (
    <div className="min-h-screen">
      <ChatInterface
        user={session?.user || null}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        isGuestMode={isGuestMode}
        onExitGuestMode={handleExitGuestMode}
        isAdmin={isAdmin}
      />
    </div>
  );
};

export default Index;
