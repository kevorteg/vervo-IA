import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Trash2, Edit, Save, X, Database, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

export const AdminDashboard = () => {
    const [entries, setEntries] = useState<TrainingEntry[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ pregunta: '', respuesta: '', categoria: '' });
    const { toast } = useToast();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch training data
            const { data: trainingData, error: trainingError } = await supabase
                .from('entrenamiento')
                .select('*')
                .order('created_at', { ascending: false });

            if (trainingError) throw trainingError;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setEntries((trainingData as any) || []);

            // Fetch conversations (admin view)
            const { data: convData, error: convError } = await supabase
                .from('conversaciones')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50); // Limit to recent 50

            if (convError) throw convError;
            setConversations(convData || []);

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

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta entrada?')) return;

        try {
            const { error } = await supabase
                .from('entrenamiento')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setEntries(entries.filter(e => e.id !== id));
            toast({ title: "Eliminado", description: "Entrada eliminada correctamente" });
        } catch (error) {
            toast({ title: "Error", description: "No se pudo eliminar", variant: "destructive" });
        }
    };

    const startEdit = (entry: TrainingEntry) => {
        setEditingId(entry.id);
        setEditForm({
            pregunta: entry.pregunta,
            respuesta: entry.respuesta,
            categoria: entry.categoria || 'General'
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({ pregunta: '', respuesta: '', categoria: '' });
    };

    const saveEdit = async (id: string) => {
        try {
            const { error } = await supabase
                .from('entrenamiento')
                .update({
                    pregunta: editForm.pregunta,
                    respuesta: editForm.respuesta,
                    categoria: editForm.categoria
                })
                .eq('id', id);

            if (error) throw error;

            setEntries(entries.map(e => e.id === id ? { ...e, ...editForm } : e));
            setEditingId(null);
            toast({ title: "Actualizado", description: "Entrada actualizada correctamente" });
        } catch (error) {
            toast({ title: "Error", description: "No se pudo actualizar", variant: "destructive" });
        }
    };

    const filteredEntries = entries.filter(e =>
        e.pregunta.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.respuesta.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <div className="bg-aurora-primario rounded-2xl p-8 text-white shadow-lg flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center mb-2">
                        <Database className="w-8 h-8 mr-3" />
                        Panel de Administración
                    </h1>
                    <p className="opacity-90">Gestión centralizada de Verbo IA</p>
                </div>
            </div>

            <Tabs defaultValue="training" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="training">Entrenamiento IA ({entries.length})</TabsTrigger>
                    <TabsTrigger value="conversations">Conversaciones Recientes ({conversations.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="training">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Base de Conocimiento</CardTitle>
                                <div className="relative w-72">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        placeholder="Buscar preguntas o respuestas..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="text-center p-8">Cargando datos...</div>
                            ) : (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[150px]">Categoría</TableHead>
                                                <TableHead className="w-[30%]">Pregunta</TableHead>
                                                <TableHead className="w-[40%]">Respuesta Ideal</TableHead>
                                                <TableHead className="text-right">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredEntries.map((entry) => (
                                                <TableRow key={entry.id}>
                                                    <TableCell className="font-medium">
                                                        {editingId === entry.id ? (
                                                            <Input
                                                                value={editForm.categoria}
                                                                onChange={(e) => setEditForm({ ...editForm, categoria: e.target.value })}
                                                            />
                                                        ) : (
                                                            <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                                                {entry.categoria || 'General'}
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {editingId === entry.id ? (
                                                            <Input
                                                                value={editForm.pregunta}
                                                                onChange={(e) => setEditForm({ ...editForm, pregunta: e.target.value })}
                                                            />
                                                        ) : (
                                                            entry.pregunta
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {editingId === entry.id ? (
                                                            <Input
                                                                value={editForm.respuesta}
                                                                onChange={(e) => setEditForm({ ...editForm, respuesta: e.target.value })}
                                                            />
                                                        ) : (
                                                            <p className="line-clamp-2 text-sm text-gray-600">{entry.respuesta}</p>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {editingId === entry.id ? (
                                                            <div className="flex justify-end gap-2">
                                                                <Button size="sm" variant="ghost" onClick={cancelEdit}>
                                                                    <X className="w-4 h-4" />
                                                                </Button>
                                                                <Button size="sm" onClick={() => saveEdit(entry.id)}>
                                                                    <Save className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex justify-end gap-2">
                                                                <Button size="sm" variant="ghost" onClick={() => startEdit(entry)}>
                                                                    <Edit className="w-4 h-4 text-blue-500" />
                                                                </Button>
                                                                <Button size="sm" variant="ghost" onClick={() => handleDelete(entry.id)}>
                                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="conversations">
                    <Card>
                        <CardHeader>
                            <CardTitle>Historial Global</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Título</TableHead>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Usuario ID</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {conversations.map((conv) => (
                                        <TableRow key={conv.id}>
                                            <TableCell className="font-mono text-xs">{conv.id.slice(0, 8)}...</TableCell>
                                            <TableCell className="font-medium">{conv.titulo}</TableCell>
                                            <TableCell>{new Date(conv.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-xs text-gray-500">{conv.usuario_id}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};
