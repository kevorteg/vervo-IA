import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// Layout & Sub-components
import { AdminLayout } from './layout/AdminLayout';
import { AdminSidebar } from './layout/AdminSidebar';
import { AnalyticsDashboard } from './analytics/AnalyticsDashboard';
import { AdminTrainingTab } from './training/AdminTrainingTab';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Icons
import { Search, Trash2, Edit, Save, X, Eye, Download, Shield, Ban, Users, Plus, Settings } from 'lucide-react';

// Interfaces
interface TrainingEntry {
    id: string;
    categoria: string;
    pregunta: string;
    respuesta: string;
    created_at: string;
}

interface Conversation {
    id: string;
    titulo: string;
    created_at: string;
    usuario_id: string;
}

interface Message {
    id: string;
    contenido: string;
    es_usuario: boolean;
    created_at: string;
}

interface UserProfile {
    id: string;
    rol: string;
    created_at?: string;
    email?: string;
}

export const AdminDashboard = () => {
    // Navigation State
    const [activeTab, setActiveTab] = useState('overview');
    const navigate = useNavigate();

    // Data State
    const [entries, setEntries] = useState<TrainingEntry[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ pregunta: '', respuesta: '', categoria: '' });

    // Conversation Viewer State
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);

    const { toast } = useToast();

    // Analytics Data
    const [activityData, setActivityData] = useState<any[]>([]);
    const [categoryData, setCategoryData] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch training data
            const { data: trainingData } = await supabase
                .from('entrenamiento')
                .select('*')
                .order('created_at', { ascending: false });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setEntries((trainingData as any) || []);

            // Process Category Data for Pie Chart
            const categories: Record<string, number> = {};
            trainingData?.forEach((item: any) => {
                const cat = item.categoria || 'General';
                categories[cat] = (categories[cat] || 0) + 1;
            });
            const pieData = Object.keys(categories).map(key => ({ name: key, value: categories[key] }));
            setCategoryData(pieData);

            // Fetch conversations
            const { data: convData } = await supabase
                .from('conversaciones')
                .select('*')
                .order('created_at', { ascending: false });

            setConversations(convData || []);

            // Fetch Messages for Activity Chart (Last 7 days approx or just all for now if small)
            // Ideally use an RPC, but fetching last 1000 messages for client-side agg is okay for MVP
            const { data: msgData } = await supabase
                .from('mensajes')
                .select('created_at')
                .order('created_at', { ascending: false })
                .limit(2000);

            // Process Activity Data
            const dailyCounts: Record<string, number> = {};
            const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

            // Initialize last 7 days with 0
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dayName = days[d.getDay()];
                if (!dailyCounts[dayName]) dailyCounts[dayName] = 0;
            }

            msgData?.forEach((msg: any) => {
                const date = new Date(msg.created_at);
                const dayName = days[date.getDay()];
                // Only count moving window if valid date
                if (dailyCounts[dayName] !== undefined) {
                    dailyCounts[dayName]++;
                }
            });

            const chartData = Object.keys(dailyCounts).map(key => ({
                name: key,
                messages: dailyCounts[key],
                visitors: Math.floor(dailyCounts[key] * 0.4) // Mock visitor ratio for now since we track messages
            }));

            // Sort by day order is tricky with object keys unless strictly ordered. 
            // Better to reconstruct array based on today's relative position? 
            // Simpler: Just map the days array order
            const orderedChartData = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dayName = days[d.getDay()];
                orderedChartData.push({
                    name: dayName,
                    messages: dailyCounts[dayName] || 0,
                    visitors: Math.floor((dailyCounts[dayName] || 0) * 0.6) // Mock visitors
                });
            }
            setActivityData(orderedChartData);


            // Fetch Users
            const { data: userData } = await supabase
                .from('perfiles')
                .select('*');

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setUsers((userData as any) || []);

        } catch (error) {
            console.error('Error fetching data:', error);
            toast({
                title: "Error",
                description: "No se pudieron cargar los datos del administrador",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // --- Actions (Role, Delete, Export) ---
    const handleUpdateRole = async (userId: string, newRole: string) => {
        try {
            const { error } = await supabase
                .from('perfiles')
                .update({ rol: newRole })
                .eq('id', userId);

            if (error) throw error;

            setUsers(users.map(u => u.id === userId ? { ...u, rol: newRole } : u));
            toast({ title: "Rol actualizado", description: `El usuario ahora es ${newRole}` });
        } catch (error) {
            toast({ title: "Error", description: "No se pudo actualizar el rol", variant: "destructive" });
        }
    };

    const handleExportCSV = (data: any[], filename: string) => {
        if (!data.length) {
            toast({ title: "Sin datos", description: "No hay datos para exportar", variant: "default" });
            return;
        }
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map((fieldName: string) => {
                const value = row[fieldName];
                return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
            }).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${filename}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta entrada?')) return;
        try {
            const { error } = await supabase.from('entrenamiento').delete().eq('id', id);
            if (error) throw error;
            setEntries(entries.filter(e => e.id !== id));
            toast({ title: "Eliminado", description: "Entrada eliminada correctamente" });
        } catch (error) {
            toast({ title: "Error", description: "No se pudo eliminar", variant: "destructive" });
        }
    };

    // --- Edit Handlers ---
    const startEdit = (entry: TrainingEntry) => {
        setEditingId(entry.id);
        setEditForm({ pregunta: entry.pregunta, respuesta: entry.respuesta, categoria: entry.categoria || 'General' });
    };

    const saveEdit = async (id: string) => {
        try {
            const { error } = await supabase
                .from('entrenamiento')
                .update(editForm)
                .eq('id', id);
            if (error) throw error;
            setEntries(entries.map(e => e.id === id ? { ...e, ...editForm } : e));
            setEditingId(null);
            toast({ title: "Actualizado", description: "Entrada actualizada correctamente" });
        } catch (error) {
            toast({ title: "Error", description: "No se pudo actualizar", variant: "destructive" });
        }
    };

    // --- Conversation Viewer ---
    const handleViewConversation = async (conversation: Conversation) => {
        setSelectedConversation(conversation);
        setIsLoadingMessages(true);
        try {
            const { data, error } = await supabase
                .from('mensajes')
                .select('*')
                .eq('conversacion_id', conversation.id)
                .order('created_at', { ascending: true });
            if (error) throw error;
            setConversationMessages(data || []);
        } catch (error) {
            toast({ title: "Error", description: "No se pudieron cargar los mensajes", variant: "destructive" });
        } finally {
            setIsLoadingMessages(false);
        }
    };

    // --- Filtering ---
    const filteredEntries = entries.filter(e =>
        e.pregunta.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.respuesta.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getTabTitle = () => {
        switch (activeTab) {
            case 'overview': return 'Dashboard General';
            case 'users': return 'Gestión de Usuarios';
            case 'conversations': return 'Historial de Conversaciones';
            case 'training': return 'Entrenamiento IA';
            default: return 'Dashboard';
        }
    };

    // --- Render Content ---
    // --- Edit User Dialog State ---
    const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserProfile | null>(null);
    const [userEditForm, setUserEditForm] = useState({ email: '', password: '', fullName: '' });

    const handleEditUser = (user: UserProfile) => {
        setSelectedUserForEdit(user);
        setUserEditForm({
            email: user.email || '',
            password: '', // Always empty, just a placeholder
            fullName: user.email?.split('@')[0] || 'Usuario' // Mock name if not in DB
        });
    };

    const saveUserChanges = async () => {
        if (!selectedUserForEdit) return;
        // logic to update user - mostly mock for now as we can't update auth easily from here without admin api
        // But we can update profile data
        try {
            const { error } = await supabase
                .from('perfiles')
                .update({ email: userEditForm.email }) // Assuming we added email to profiles
                .eq('id', selectedUserForEdit.id);

            if (error) throw error;

            toast({ title: "Usuario Actualizado", description: "Los datos han sido guardados." });
            setSelectedUserForEdit(null);
            fetchData(); // Refresh
        } catch (e) {
            toast({ title: "Error", description: "No se pudo actualizar.", variant: 'destructive' });
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <AnalyticsDashboard
                        stats={{
                            totalUsers: users.length,
                            totalConversations: conversations.length,
                            totalTraining: entries.length
                        }}
                        activityData={activityData}
                        categoryData={categoryData}
                    />
                );
            case 'users':
                return (
                    <>
                        <Card className="bg-[#1a1c23] border-[#2d2f39] text-white">
                            <CardHeader className="flex flex-row justify-between items-center">
                                <CardTitle>Usuarios Registrados</CardTitle>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="bg-[#2d2f39] border-none text-gray-300 hover:bg-[#3d4150]">
                                        <Plus className="w-4 h-4 mr-2" /> Agregar Usuario
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleExportCSV(users, 'usuarios')} className="bg-[#2d2f39] border-none text-gray-300 hover:bg-[#3d4150]">
                                        <Download className="w-4 h-4 mr-2" /> Exportar
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-[#2d2f39] hover:bg-transparent">
                                            <TableHead className="text-gray-400">Usuario</TableHead>
                                            <TableHead className="text-gray-400">Rol</TableHead>
                                            <TableHead className="text-gray-400">Fecha</TableHead>
                                            <TableHead className="text-gray-400 text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow key={user.id} className="border-[#2d2f39] hover:bg-[#2d2f39]">
                                                <TableCell className="text-gray-300">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm">{user.email || 'Sin email'}</span>
                                                        <span className="text-xs text-gray-500 font-mono">{user.id.substring(0, 8)}...</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.rol === 'admin' ? 'bg-purple-900/50 text-purple-300 border border-purple-700' :
                                                        user.rol === 'banned' ? 'bg-red-900/50 text-red-300 border border-red-700' :
                                                            'bg-green-900/50 text-green-300 border border-green-700'
                                                        }`}>
                                                        {user.rol || 'usuario'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-gray-300">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end items-center gap-2">
                                                        <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)} className="h-8 w-8 p-0 text-blue-400 hover:text-white hover:bg-blue-900/30">
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                                                                    <Settings className="w-4 h-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="bg-[#1a1c23] border-[#2d2f39] text-gray-300">
                                                                <DropdownMenuLabel>Gestionar</DropdownMenuLabel>
                                                                <DropdownMenuSeparator className="bg-[#2d2f39]" />
                                                                <DropdownMenuItem onClick={() => handleUpdateRole(user.id, 'admin')} className="hover:bg-[#2d2f39] cursor-pointer">
                                                                    <Shield className="w-4 h-4 mr-2 text-purple-400" /> Convertir en Admin
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleUpdateRole(user.id, 'usuario')} className="hover:bg-[#2d2f39] cursor-pointer">
                                                                    <Users className="w-4 h-4 mr-2 text-green-400" /> Convertir en Usuario
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleUpdateRole(user.id, 'banned')} className="hover:bg-[#2d2f39] text-red-400 cursor-pointer">
                                                                    <Ban className="w-4 h-4 mr-2" /> Banear Usuario
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <Dialog open={!!selectedUserForEdit} onOpenChange={(open) => !open && setSelectedUserForEdit(null)}>
                            <DialogContent className="bg-[#1a1c23] border-[#2d2f39] text-white">
                                <DialogHeader>
                                    <DialogTitle>Editar Usuario</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Nombre (Opcional)</label>
                                        <Input
                                            value={userEditForm.fullName}
                                            onChange={(e) => setUserEditForm({ ...userEditForm, fullName: e.target.value })}
                                            className="bg-[#0f1115] border-[#2d2f39] text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Email</label>
                                        <Input
                                            value={userEditForm.email}
                                            onChange={(e) => setUserEditForm({ ...userEditForm, email: e.target.value })}
                                            className="bg-[#0f1115] border-[#2d2f39] text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Contraseña (Encriptada)</label>
                                        <div className="flex gap-2">
                                            <Input
                                                value="******"
                                                disabled
                                                className="bg-[#0f1115] border-[#2d2f39] text-gray-500 font-mono"
                                            />
                                            <Button variant="outline" className="border-[#2d2f39] text-gray-400 hover:text-white" onClick={() => toast({ description: "Enlace de restablecimiento enviado (simulado)" })}>
                                                Reset
                                            </Button>
                                        </div>
                                        <p className="text-xs text-gray-500">Por seguridad, las contraseñas no son visibles.</p>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Button variant="ghost" onClick={() => setSelectedUserForEdit(null)} className="text-gray-400 hover:text-white">Cancelar</Button>
                                    <Button onClick={saveUserChanges} className="bg-purple-600 hover:bg-purple-700 text-white">Guardar Cambios</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </>
                );
            case 'conversations':
                return (
                    <Card className="bg-[#1a1c23] border-[#2d2f39] text-white">
                        <CardHeader className="flex flex-row justify-between items-center">
                            <CardTitle>Historial Reciente</CardTitle>
                            <Button variant="outline" size="sm" onClick={() => handleExportCSV(conversations, 'conversaciones')} className="bg-[#2d2f39] border-none text-gray-300 hover:bg-[#3d4150]">
                                <Download className="w-4 h-4 mr-2" /> Exportar
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-[#2d2f39]">
                                        <TableHead className="text-gray-400">Título</TableHead>
                                        <TableHead className="text-gray-400">Fecha</TableHead>
                                        <TableHead className="text-gray-400 text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {conversations.map((conv) => (
                                        <TableRow key={conv.id} className="border-[#2d2f39] hover:bg-[#2d2f39]">
                                            <TableCell className="text-gray-300">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{conv.titulo}</span>
                                                    <span className="text-xs text-gray-500 font-mono">{conv.id}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-300">{new Date(conv.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" variant="ghost" onClick={() => handleViewConversation(conv)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20">
                                                    <Eye className="w-4 h-4 mr-2" /> Ver Detalles
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                );
            case 'training':
                return <AdminTrainingTab />;
            default:
                return null;
        }
    };

    return (
        <div className="flex h-screen bg-[#0f1115] overflow-hidden">
            <AdminSidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onLogout={async () => {
                    await supabase.auth.signOut();
                    navigate('/');
                }}
            />
            <AdminLayout headerTitle={getTabTitle()}>
                {renderContent()}

                {/* Dialog outside content to render on top */}
                <Dialog open={!!selectedConversation} onOpenChange={(open) => !open && setSelectedConversation(null)}>
                    <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col bg-[#1a1c23] border-[#2d2f39] text-white">
                        <DialogHeader>
                            <DialogTitle>{selectedConversation?.titulo}</DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 border border-[#2d2f39] rounded-md bg-[#0f1115] mt-2">
                            {isLoadingMessages ? (
                                <div className="text-center py-10 text-gray-500">Cargando mensajes...</div>
                            ) : conversationMessages.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">No hay mensajes.</div>
                            ) : (
                                conversationMessages.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.es_usuario ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] rounded-lg p-3 ${msg.es_usuario ? 'bg-purple-600 text-white' : 'bg-[#1a1c23] border border-[#2d2f39] text-gray-300'
                                            }`}>
                                            <p className="text-sm">{msg.contenido}</p>
                                            <span className="text-[10px] opacity-70 block mt-1">{new Date(msg.created_at).toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </AdminLayout>
        </div>
    );
};
