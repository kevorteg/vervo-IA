import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Calendar, Heart, Book } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PrayerEntry {
    id: string;
    title: string;
    content: string;
    date: string;
    answered: boolean;
}

export const PrayerJournal = () => {
    const [entries, setEntries] = useState<PrayerEntry[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newEntry, setNewEntry] = useState({ title: '', content: '' });
    const { toast } = useToast();

    useEffect(() => {
        const saved = localStorage.getItem('chatmj_prayer_journal');
        if (saved) {
            setEntries(JSON.parse(saved));
        }
    }, []);

    const saveEntries = (updatedEntries: PrayerEntry[]) => {
        setEntries(updatedEntries);
        localStorage.setItem('chatmj_prayer_journal', JSON.stringify(updatedEntries));
    };

    const handleAddEntry = () => {
        if (!newEntry.title.trim() || !newEntry.content.trim()) return;

        const entry: PrayerEntry = {
            id: Date.now().toString(),
            title: newEntry.title,
            content: newEntry.content,
            date: new Date().toLocaleDateString(),
            answered: false
        };

        const updated = [entry, ...entries];
        saveEntries(updated);
        setNewEntry({ title: '', content: '' });
        setIsAdding(false);

        toast({
            title: "🙏 Oración guardada",
            description: "Tu petición ha sido añadida a tu diario personal.",
        });
    };

    const handleDelete = (id: string) => {
        const updated = entries.filter(e => e.id !== id);
        saveEntries(updated);
    };

    const toggleAnswered = (id: string) => {
        const updated = entries.map(e =>
            e.id === id ? { ...e, answered: !e.answered } : e
        );
        saveEntries(updated);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="bg-aurora-primario rounded-2xl p-8 text-white shadow-lg">
                <h1 className="text-3xl font-bold flex items-center mb-2">
                    <Book className="w-8 h-8 mr-3" />
                    Diario de Oración
                </h1>
                <p className="opacity-90">
                    Un espacio privado para tus conversaciones con Dios.
                </p>
            </div>

            {!isAdding ? (
                <Button
                    onClick={() => setIsAdding(true)}
                    className="w-full h-12 dashed border-2 border-gray-300 dark:border-gray-700 bg-transparent text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-aurora-primario"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Escribir nueva oración
                </Button>
            ) : (
                <Card className="animate-fade-in border-aurora-primario/20 shadow-md">
                    <CardHeader>
                        <CardTitle>Nueva Entrada</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            placeholder="Título (ej: Salud de mi familia)"
                            value={newEntry.title}
                            onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                        />
                        <Textarea
                            placeholder="Escribe tu oración aquí..."
                            value={newEntry.content}
                            onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                            className="min-h-[150px]"
                        />
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setIsAdding(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleAddEntry} className="bg-aurora-primario hover:bg-purple-700">
                                Guardar Oración
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                {entries.map((entry) => (
                    <Card key={entry.id} className={`group transition-all hover:shadow-md ${entry.answered ? 'bg-green-50 dark:bg-green-900/10 border-green-200' : ''}`}>
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-lg leading-tight">{entry.title}</CardTitle>
                                <div className="flex items-center text-xs text-gray-500">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {entry.date}
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-500"
                                onClick={() => handleDelete(entry.id)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                                {entry.content}
                            </p>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`mt-4 w-full justify-start ${entry.answered ? 'text-green-600' : 'text-gray-400 hover:text-green-600'}`}
                                onClick={() => toggleAnswered(entry.id)}
                            >
                                <Heart className={`w-4 h-4 mr-2 ${entry.answered ? 'fill-current' : ''}`} />
                                {entry.answered ? 'Respondida' : 'Marcar como respondida'}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};
