
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { ChatInterface } from '@/components/ChatInterface';
import { LoginForm } from '@/components/auth/LoginForm';

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });

  useEffect(() => {
    console.log('Setting up auth listener...');
    
    // Listen for auth changes first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setLoading(false);
        if (session) {
          setIsGuestMode(false);
        }
      }
    );

    // Then get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email);
      setSession(session);
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up auth subscription');
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
    console.log('Login success callback');
    setIsGuestMode(false);
  };

  const handleGuestMode = () => {
    console.log('Entering guest mode');
    setIsGuestMode(true);
    setLoading(false);
  };

  const handleExitGuestMode = () => {
    console.log('Exiting guest mode');
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
          <p className="text-gray-600 dark:text-gray-400">Cargando ChatMJ...</p>
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
                {darkMode ? '🌞' : '🌙'}
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
      />
    </div>
  );
};

export default Index;
