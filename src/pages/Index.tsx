
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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setLoading(false);
        if (session) {
          setIsGuestMode(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleLoginSuccess = () => {
    // Auth state change will be handled by the listener
    setIsGuestMode(false);
  };

  const handleGuestMode = () => {
    setIsGuestMode(true);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-aurora-gradient dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-aurora-primario rounded-full flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-2xl">MJ</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Cargando ChatMJ...</p>
        </div>
      </div>
    );
  }

  if (!session && !isGuestMode) {
    return (
      <div className={`min-h-screen bg-aurora-gradient dark:bg-gray-900 flex items-center justify-center p-4 ${darkMode ? 'dark' : ''}`}>
        <div className="w-full max-w-6xl flex items-center justify-center">
          {/* Login Section */}
          <div className="w-full max-w-md">
            <LoginForm 
              onSuccess={handleLoginSuccess} 
              onGuestMode={handleGuestMode}
            />
            
            {/* Dark Mode Toggle for login page */}
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
        
        {/* Decorative elements */}
        <div className="fixed top-10 left-10 w-20 h-20 bg-aurora-violet/10 rounded-full blur-xl"></div>
        <div className="fixed top-32 right-20 w-16 h-16 bg-aurora-celestial/10 rounded-full blur-lg"></div>
        <div className="fixed bottom-20 left-32 w-12 h-12 bg-aurora-gold/10 rounded-full blur-md"></div>
        <div className="fixed bottom-40 right-10 w-24 h-24 bg-aurora-violet/5 rounded-full blur-2xl"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <ChatInterface 
        user={session?.user || null}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        isGuestMode={isGuestMode}
        onExitGuestMode={() => setIsGuestMode(false)}
      />
    </div>
  );
};

export default Index;
