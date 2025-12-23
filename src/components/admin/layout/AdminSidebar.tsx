
import {
    LayoutDashboard,
    Users,
    MessageSquare,
    Database,
    Settings,
    LogOut,
    ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminSidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    onLogout: () => void;
}

export const AdminSidebar = ({ activeTab, onTabChange, onLogout }: AdminSidebarProps) => {
    const menuItems = [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'users', label: 'Usuarios', icon: Users },
        { id: 'conversations', label: 'Conversaciones', icon: MessageSquare },
        { id: 'training', label: 'Entrenamiento IA', icon: Database },
    ];

    return (
        <div className="w-64 bg-[#1a1c23] h-screen text-gray-300 flex flex-col border-r border-[#2d2f39] shadow-xl">
            {/* Brand */}
            <div className="p-6 flex items-center gap-3 border-b border-[#2d2f39]">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-2 shadow-lg shadow-purple-900/20">
                    <span className="font-bold text-white text-xl">V</span>
                </div>
                <div>
                    <h1 className="font-bold text-white tracking-wide">VERBO ADMIN</h1>
                    <p className="text-xs text-gray-500">Panel de Control</p>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-6 px-3 space-y-2">
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Principal</p>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
                                    : 'hover:bg-[#2d2f39] hover:text-white'
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                            <span className="font-medium">{item.label}</span>
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Utilities */}
            <div className="p-4 border-t border-[#2d2f39] bg-[#15171e]">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20 gap-3"
                    onClick={onLogout}
                >
                    <LogOut className="w-5 h-5" />
                    <span>Cerrar Sesión</span>
                </Button>
            </div>
        </div>
    );
};
