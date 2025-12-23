
import { ReactNode } from 'react';

interface AdminLayoutProps {
    children: ReactNode;
    headerTitle?: string;
    headerAction?: ReactNode;
}

export const AdminLayout = ({ children, headerTitle, headerAction }: AdminLayoutProps) => {
    return (
        <div className="flex-1 min-w-0 bg-[#0f1115] h-screen overflow-hidden flex flex-col">
            {/* Top Header */}
            <header className="h-20 bg-[#1a1c23] border-b border-[#2d2f39] flex items-center justify-between px-8 shadow-sm z-10">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">{headerTitle || 'Dashboard'}</h2>
                </div>
                <div className="flex items-center gap-4">
                    {/* User Profile or Actions */}
                    {headerAction}
                    <div className="w-10 h-10 rounded-full bg-gray-700 border-2 border-purple-500/30 overflow-hidden">
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
                            alt="Admin"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-8 relative">
                {/* Background Gradient Mesh */}
                <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-purple-900/10 to-transparent pointer-events-none" />

                <div className="relative z-10 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};
