
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    setAuthorized(false);
                    setLoading(false);
                    return;
                }

                if (requireAdmin) {
                    const { data: profile, error } = await (supabase as any)
                        .from('perfiles')
                        .select('rol')
                        .eq('id', user.id)
                        .single();

                    if (error || !profile || profile.rol !== 'admin') {
                        console.log('Access denied: User is not admin', profile);
                        setAuthorized(false);
                        toast({
                            title: "Acceso denegado",
                            description: "No tienes permisos de administrador para ver esta página.",
                            variant: "destructive",
                        });
                    } else {
                        setAuthorized(true);
                    }
                } else {
                    setAuthorized(true);
                }
            } catch (error) {
                console.error('Error checking auth:', error);
                setAuthorized(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [requireAdmin, toast]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aurora-primario"></div>
            </div>
        );
    }

    if (!authorized) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
