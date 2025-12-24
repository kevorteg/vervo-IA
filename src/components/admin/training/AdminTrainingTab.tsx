import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Plus, Trash2, Save, FileText, Brain, Zap, Database, Settings, Download, X, MessageSquare, Sparkles, FileJson } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { webLLMManager, AVAILABLE_MODELS } from '@/components/ai/WebLLMManager';

interface TrainingEntry {
    id: string;
    question: string;
    answer: string;
    category: string;
    libro?: string;
    version?: string;
}

interface InitProgress {
    text: string;
    progress: number;
}

export const AdminTrainingTab = () => {
    const [trainingData, setTrainingData] = useState<TrainingEntry[]>([]);
    const [newEntry, setNewEntry] = useState({
        question: '',
        answer: '',
        category: 'general'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState<any>({});
    const [initProgress, setInitProgress] = useState<InitProgress>({ text: '', progress: 0 });
    const [selectedModel, setSelectedModel] = useState('Phi-3.5-mini-instruct-q4f16_1-MLC');

    // Advanced Features State
    const [systemPrompt, setSystemPrompt] = useState('');
    const [inboxMessages, setInboxMessages] = useState<any[]>([]);
    const [jsonInput, setJsonInput] = useState('');
    const [activeTab, setActiveTab] = useState("knowledge");

    const { toast } = useToast();

    const categories = [
        { value: 'general', label: '🌟 General', desc: 'Preguntas generales' },
        { value: 'oracion', label: '🙏 Oración', desc: 'Peticiones ' },
        { value: 'devocional', label: '📖 Devocional', desc: 'Lecturas' },
        { value: 'fe', label: '✨ Fe', desc: 'Dudas de fe' },
        { value: 'crisis', label: '💙 Crisis', desc: 'Apoyo emocional' },
        { value: 'evangelismo', label: '🌍 Evangelismo', desc: 'Compartir' },
        { value: 'biblia', label: '📚 Biblia', desc: 'Estudios' },
        { value: 'nuevo_testamento', label: '📜 Nuevo Testamento', desc: 'Libros NT' },
        { value: 'juventud', label: '🎯 Juventud', desc: 'Temas jóvenes' }
    ];

    useEffect(() => {
        loadExistingData();
        loadSystemPrompt();
        loadInbox();
        updateStats();
        const savedModel = localStorage.getItem('chatmj_selected_model');
        if (savedModel && AVAILABLE_MODELS[savedModel as keyof typeof AVAILABLE_MODELS]) {
            setSelectedModel(savedModel);
            webLLMManager.setModel(savedModel);
        }
    }, []);

    const processJsonInput = async () => {
        setIsLoading(true);
        toast({ title: "Procesando...", description: "Analizando contenido..." });

        try {
            // Updated to use the requested importJSONData method from WebLLMManager
            const result = await webLLMManager.importJSONData(jsonInput);

            if (result.success) {
                toast({ title: "Éxito", description: `Se importaron ${result.count} entradas correctamente.` });
                setJsonInput('');
                await loadExistingData(); // Refresh UI
            } else {
                toast({ title: "Error", description: result.message, variant: "destructive" });
            }
        } catch (err) {
            toast({ title: "Error Crítico", description: "Fallo inesperado al procesar JSON.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const loadExistingData = async () => {
        try {
            const { data, error } = await supabase
                .from('entrenamiento')
                .select('*')
                .filter('categoria', 'neq', 'config_sys_prompt')
                .order('created_at', { ascending: true });

            if (error) throw error;

            if (data) {
                const formattedData: TrainingEntry[] = data.map((item: any) => ({
                    id: item.id,
                    question: item.pregunta,
                    answer: item.respuesta,
                    category: item.categoria || 'general',
                    libro: item.libro,
                    version: item.version
                }));
                setTrainingData(formattedData);
                webLLMManager.loadCustomTrainingData(formattedData);
            }
        } catch (error) {
            console.error('Error loading training data:', error);
            toast({ title: "Error", description: "No se pudieron cargar los datos.", variant: "destructive" });
        }
    };

    const loadSystemPrompt = async () => {
        try {
            const { data } = await supabase
                .from('entrenamiento')
                .select('respuesta')
                .eq('categoria', 'config_sys_prompt')
                .single();

            if (data) {
                setSystemPrompt(data.respuesta);
            } else {
                setSystemPrompt(`Eres Verbo IA, un asistente espiritual cristiano, amable, empático...`);
            }
        } catch (error) {
            console.log('No system prompt found, using default');
        }
    };

    const saveSystemPrompt = async () => {
        try {
            const startStr = "Eres Verbo IA";
            if (!systemPrompt.includes(startStr) && !confirm("¿Seguro? El prompt no empieza con 'Eres Verbo IA'.")) return;

            await supabase.from('entrenamiento').delete().eq('categoria', 'config_sys_prompt');

            const { error } = await supabase.from('entrenamiento').insert({
                pregunta: 'SYSTEM_PROMPT_CONFIG', // Dummy
                respuesta: systemPrompt,
                categoria: 'config_sys_prompt'
            });

            if (error) throw error;

            toast({ title: "Guardado", description: "Personalidad del bot actualizada." });
            webLLMManager.loadTrainingData();

        } catch (error) {
            toast({ title: "Error", description: "No se pudo guardar la personalidad.", variant: "destructive" });
        }
    };

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ question: '', answer: '' });

    const loadInbox = async () => {
        // Fetch ALL recent messages to find pairs
        const { data } = await supabase
            .from('mensajes')
            .select('*')
            .order('created_at', { ascending: true }) // Oldest first to easier pairing
            .limit(200);

        if (data && data.length > 0) {
            const pairs = [];

            // Simple logic: If we find a user message, look at the NEXT message.
            // If the next message is NOT user and same conversation -> It's the reply.
            for (let i = 0; i < data.length; i++) {
                const msg = data[i];
                if (msg.es_usuario) {
                    let reply = null;
                    // Look ahead
                    if (i + 1 < data.length) {
                        const nextMsg = data[i + 1];
                        if (!nextMsg.es_usuario && nextMsg.conversacion_id === msg.conversacion_id) {
                            reply = nextMsg;
                        }
                    }
                    pairs.unshift({ user: msg, bot: reply }); // Add to start (newest first)
                }
            }
            setInboxMessages(pairs);
        }
    };

    const startEditing = (pair: any) => {
        setEditingId(pair.user.id);
        setEditForm({
            question: pair.user.contenido,
            answer: pair.bot ? pair.bot.contenido : ''
        });
    };

    const saveTrainingFromInbox = async () => {
        if (!editForm.question.trim() || !editForm.answer.trim()) return;

        try {
            const { error } = await supabase.from('entrenamiento').insert({
                pregunta: editForm.question,
                respuesta: editForm.answer,
                categoria: 'general'
            });

            if (error) throw error;

            toast({ title: "Entrenado", description: "Nueva entrada creada desde buzón." });

            // Remove from list visually
            setInboxMessages(prev => prev.filter(p => p.user.id !== editingId));

            setEditingId(null);
            loadExistingData();
        } catch (e) {
            toast({ title: "Error", description: "Fallo al guardar.", variant: "destructive" });
        }
    };

    const promoteToTraining = (msgContent: string) => {
        setNewEntry({
            ...newEntry,
            question: msgContent,
            answer: ''
        });
        setActiveTab("knowledge");
        toast({ title: "Importado", description: "Completa la respuesta para entrenar al bot." });
    };

    const updateStats = () => {
        const webLLMStats = webLLMManager.getTrainingStats();
        setStats(webLLMStats);
    };

    const handleModelChange = (modelId: string) => {
        setSelectedModel(modelId);
        webLLMManager.setModel(modelId);
        localStorage.setItem('chatmj_selected_model', modelId);
        toast({ title: "Modelo seleccionado", description: AVAILABLE_MODELS[modelId as keyof typeof AVAILABLE_MODELS].name });
    };

    const addTrainingEntry = async () => {
        if (!newEntry.question.trim() || !newEntry.answer.trim()) {
            toast({ title: "Requerido", description: "Completa pregunta y respuesta", variant: "destructive" });
            return;
        }

        try {
            const { data, error } = await supabase
                .from('entrenamiento')
                .insert({
                    pregunta: newEntry.question,
                    respuesta: newEntry.answer,
                    categoria: newEntry.category
                })
                .select()
                .single();

            if (error) throw error;

            const entry: TrainingEntry = {
                id: data.id,
                question: data.pregunta,
                answer: data.respuesta,
                category: data.categoria
            };

            const updatedData = [...trainingData, entry];
            setTrainingData(updatedData);
            setNewEntry({ ...newEntry, question: '', answer: '' });
            webLLMManager.loadCustomTrainingData(updatedData);
            toast({ title: "Agregado", description: "Entrada guardada correctamente." });

        } catch (error) {
            toast({ title: "Error", description: "No se pudo guardar.", variant: "destructive" });
        }
    };

    const removeEntry = async (id: string) => {
        try {
            const { error } = await supabase.from('entrenamiento').delete().eq('id', id);
            if (error) throw error;

            const updatedData = trainingData.filter(entry => entry.id !== id);
            setTrainingData(updatedData);
            webLLMManager.loadCustomTrainingData(updatedData);
            toast({ title: "Eliminado", description: "Entrada borrada." });
        } catch (error) {
            toast({ title: "Error", description: "Falló al eliminar.", variant: "destructive" });
        }
    };

    const initializeWebLLM = async () => {
        setIsLoading(true);
        setInitProgress({ text: 'Iniciando...', progress: 0 });
        try {
            const success = await webLLMManager.initialize((progress) => setInitProgress(progress));
            updateStats();
            if (success) toast({ title: "Web-LLM Listo", description: "Modelo cargado en memoria." });
            else toast({ title: "Fallback", description: "Web-LLM no disponible.", variant: "destructive" });
        } catch (error) {
            toast({ title: "Error", description: "Fallo al iniciar Web-LLM", variant: "destructive" });
        } finally {
            setIsLoading(false);
            setInitProgress({ text: '', progress: 0 });
        }
    };

    const loadFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const content = e.target?.result as string;
                // Reuse importJSONData logic simply by calling it
                const result = await webLLMManager.importJSONData(content);
                if (result.success) {
                    toast({ title: "Éxito", description: `Importadas ${result.count} entradas desde archivo.` });
                    await loadExistingData();
                } else {
                    toast({ title: "Error de Archivo", description: result.message, variant: "destructive" });
                }
            } catch (error) {
                console.error('Import error:', error);
                toast({ title: "Error", description: "Error al leer archivo.", variant: "destructive" });
            } finally {
                if (event.target) event.target.value = '';
            }
        };
        reader.readAsText(file);
    };

    const exportData = () => {
        const exportObject = {
            version: "1.0",
            created: new Date().toISOString(),
            data: trainingData
        };
        const dataStr = JSON.stringify(exportObject, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `entrenamiento_chatmj.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const removeDuplicates = async () => {
        if (!confirm("¿Estás seguro? Esto eliminará las preguntas repetidas dejando solo la más reciente.")) return;

        const unique = new Map();
        const duplicates: string[] = [];

        // Detectar duplicados (trainingData ya viene ordenado por fecha de creación ascendente)
        for (const entry of trainingData) {
            const key = entry.question.toLowerCase().trim();
            if (unique.has(key)) {
                // Si ya existe, marcamos el ANTERIOR para borrar (así nos quedamos con la versión más reciente)
                duplicates.push(unique.get(key).id);
                unique.set(key, entry);
            } else {
                unique.set(key, entry);
            }
        }

        if (duplicates.length === 0) {
            toast({ title: "Impecable", description: "No tienes preguntas duplicadas." });
            return;
        }

        try {
            const { error } = await supabase.from('entrenamiento').delete().in('id', duplicates);
            if (error) throw error;

            toast({ title: "Limpieza Exitosa", description: `Se eliminaron ${duplicates.length} entradas repetidas.` });
            loadExistingData();
        } catch (e) {
            toast({ title: "Error", description: "No se pudieron borrar los duplicados.", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-[#1a1c23] border-[#2d2f39] text-white">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                        <div className="text-2xl font-bold text-purple-400">{trainingData.length}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Entradas</div>
                    </CardContent>
                </Card>
                <Card className="bg-[#1a1c23] border-[#2d2f39] text-white">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                        <div className="text-2xl font-bold text-blue-400">{stats.totalMessages || 0}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Tokens/Msgs</div>
                    </CardContent>
                </Card>
                <Card className="bg-[#1a1c23] border-[#2d2f39] text-white">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                        <div className="text-2xl font-bold text-green-400">{stats.isInitialized ? 'ACTIVO' : 'INACTIVO'}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Motor IA</div>
                    </CardContent>
                </Card>
                <Card className="bg-[#1a1c23] border-[#2d2f39] text-white">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                        <div className="text-lg font-bold text-yellow-400 truncate w-full text-center">{selectedModel.split('-')[0]}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Modelo</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-[#1a1c23] border border-[#2d2f39]">
                    <TabsTrigger value="knowledge" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400 hover:text-white transition-colors">
                        <Database className="w-4 h-4 mr-2" /> Base de Conocimiento
                    </TabsTrigger>
                    <TabsTrigger value="json_editor" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-gray-400 hover:text-white transition-colors">
                        <FileJson className="w-4 h-4 mr-2" /> Editor JSON
                    </TabsTrigger>
                    <TabsTrigger value="inbox" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400 hover:text-white transition-colors">
                        <MessageSquare className="w-4 h-4 mr-2" /> Buzón de Aprendizaje
                    </TabsTrigger>
                    <TabsTrigger value="personality" className="data-[state=active]:bg-pink-600 data-[state=active]:text-white text-gray-400 hover:text-white transition-colors">
                        <Sparkles className="w-4 h-4 mr-2" /> Personalidad (Alma)
                    </TabsTrigger>
                </TabsList>

                {/* TAB: JSON EDITOR */}
                <TabsContent value="json_editor" className="mt-6">
                    <Card className="bg-[#1a1c23] border-[#2d2f39] text-white">
                        <CardHeader>
                            <CardTitle className="text-emerald-400">Importación Masiva JSON</CardTitle>
                            <CardDescription className="text-gray-300">
                                Pega aquí tus datos de entrenamiento y cárgalos directamente a la memoria de Aurora.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea
                                value={jsonInput}
                                onChange={(e) => setJsonInput(e.target.value)}
                                className="min-h-[300px] bg-slate-900 border-emerald-500/30 text-emerald-400 font-mono text-sm focus:border-emerald-500 transition-colors placeholder:text-emerald-700/50"
                                placeholder='[
  {
    "pregunta": "Hola Aurora, ¿quién eres?",
    "respuesta": "¡Hola! Soy Aurora Celestial... ✨",
    "categoria": "identidad"
  }
]'
                            />
                            <Button onClick={processJsonInput} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold tracking-wide">
                                <Brain className="w-4 h-4 mr-2" /> Entrenar a Aurora con JSON
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB: KNOWLEDGE BASE */}
                <TabsContent value="knowledge" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 space-y-6">
                            {/* AI Control */}
                            <Card className="bg-[#1a1c23] border-[#2d2f39] text-white">
                                <CardHeader>
                                    <CardTitle className="flex items-center text-lg">
                                        <Zap className="w-5 h-5 mr-2 text-yellow-400" /> Control IA
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {initProgress.progress > 0 && (
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs text-gray-400">
                                                <span>{initProgress.text}</span>
                                                <span>{Math.round(initProgress.progress)}%</span>
                                            </div>
                                            <Progress value={initProgress.progress} className="h-1 bg-gray-700" />
                                        </div>
                                    )}
                                    <Button
                                        onClick={initializeWebLLM}
                                        disabled={isLoading}
                                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                                    >
                                        <Brain className="w-4 h-4 mr-2" /> {isLoading ? 'Cargando...' : 'Inicializar Web-LLM'}
                                    </Button>

                                    <div className="space-y-2 pt-2 border-t border-[#2d2f39]">
                                        <Label className="text-xs text-gray-400">Modelo Seleccionado</Label>
                                        <select
                                            value={selectedModel}
                                            onChange={(e) => handleModelChange(e.target.value)}
                                            className="w-full bg-[#0f1115] border border-[#2d2f39] rounded p-2 text-sm text-gray-300"
                                        >
                                            {Object.entries(AVAILABLE_MODELS).map(([id, info]) => (
                                                <option key={id} value={id}>{info.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* New Entry Form */}
                            <Card className="bg-[#1a1c23] border-[#2d2f39] text-white">
                                <CardHeader>
                                    <CardTitle className="flex items-center text-lg">
                                        <Plus className="w-5 h-5 mr-2 text-green-400" /> Nueva Entrada
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label className="text-xs text-gray-400">Categoría</Label>
                                        <select
                                            value={newEntry.category}
                                            onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
                                            className="w-full mt-1 bg-[#0f1115] border border-[#2d2f39] rounded p-2 text-sm text-white"
                                        >
                                            {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-gray-400">Pregunta</Label>
                                        <Input
                                            value={newEntry.question}
                                            onChange={(e) => setNewEntry({ ...newEntry, question: e.target.value })}
                                            className="bg-[#0f1115] border-[#2d2f39] text-white mt-1"
                                            placeholder="¿Cómo orar?"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-gray-400">Respuesta</Label>
                                        <Textarea
                                            value={newEntry.answer}
                                            onChange={(e) => setNewEntry({ ...newEntry, answer: e.target.value })}
                                            className="bg-[#0f1115] border-[#2d2f39] text-white mt-1"
                                            placeholder="Respuesta esperada..."
                                            rows={4}
                                        />
                                    </div>
                                    <Button onClick={addTrainingEntry} className="w-full bg-green-600 hover:bg-green-700">Agregar</Button>
                                </CardContent>
                            </Card>

                            {/* File Actions */}
                            <Card className="bg-[#1a1c23] border-[#2d2f39] text-white">
                                <CardContent className="p-4 flex gap-2">
                                    <Button variant="outline" onClick={exportData} className="flex-1 bg-[#2d2f39] border-none text-gray-300 hover:bg-[#3d4150]">
                                        <Download className="w-4 h-4 mr-2" /> Exportar
                                    </Button>
                                    <div className="flex-1 relative">
                                        <Input type="file" accept=".json" onChange={loadFromFile} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        <Button variant="outline" className="w-full bg-[#2d2f39] border-none text-gray-300 hover:bg-[#3d4150]">
                                            <Upload className="w-4 h-4 mr-2" /> Importar
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column: Data List */}
                        <div className="lg:col-span-2">
                            <Card className="bg-[#1a1c23] border-[#2d2f39] text-white h-full flex flex-col">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="flex items-center">
                                                <Database className="w-5 h-5 mr-2 text-purple-400" /> Base de Conocimiento
                                            </CardTitle>
                                            <CardDescription className="text-gray-400">
                                                {trainingData.length} entradas registradas
                                            </CardDescription>
                                        </div>
                                        <Button
                                            onClick={removeDuplicates}
                                            variant="outline"
                                            size="sm"
                                            className="border-red-500/50 text-red-400 hover:bg-red-900/20 hover:text-red-300"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" /> Limpiar Duplicados
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 overflow-auto max-h-[800px] p-0">
                                    <div className="divide-y divide-[#2d2f39]">
                                        {trainingData.length === 0 ? (
                                            <div className="p-8 text-center text-gray-500">No hay datos. Agrega una nueva entrada.</div>
                                        ) : (
                                            trainingData.map(entry => (
                                                <div key={entry.id} className="p-4 hover:bg-[#2d2f39]/50 transition-colors">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex gap-2 flex-wrap">
                                                            <Badge className="bg-purple-900/50 text-purple-300 border-purple-700 hover:bg-purple-900">
                                                                {categories.find(c => c.value === entry.category)?.label || entry.category}
                                                            </Badge>
                                                            {entry.libro && <Badge variant="outline" className="text-blue-300 border-blue-500/30">{entry.libro}</Badge>}
                                                            {entry.version && <Badge variant="outline" className="text-yellow-300 border-yellow-500/30 text-[10px]">{entry.version}</Badge>}
                                                        </div>
                                                        <Button variant="ghost" size="sm" onClick={() => removeEntry(entry.id)} className="text-gray-500 hover:text-red-400 hover:bg-red-900/20 h-6 w-6 p-0">
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div>
                                                            <span className="text-xs text-gray-500 uppercase font-bold">P:</span>
                                                            <p className="text-sm text-gray-200">{entry.question}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-xs text-gray-500 uppercase font-bold">R:</span>
                                                            <p className="text-sm text-gray-400">{entry.answer}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* TAB: INBOX */}
                <TabsContent value="inbox" className="mt-6">
                    <Card className="bg-[#1a1c23] border-[#2d2f39] text-white">
                        <CardHeader>
                            <CardTitle>Buzón de Preguntas Reales</CardTitle>
                            <CardDescription>
                                Aprende de lo que tus usuarios están preguntando realmente. Convierte estas dudas en conocimiento.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {inboxMessages.length === 0 ? (
                                    <div className="text-center py-10 text-gray-500">
                                        No hay mensajes recientes de usuarios.
                                    </div>
                                ) : (
                                    inboxMessages.map(pair => (
                                        <div key={pair.user.id} className="p-4 border border-[#2d2f39] rounded-lg bg-[#0f1115] hover:border-purple-500/50 transition-colors">
                                            {editingId === pair.user.id ? (
                                                <div className="space-y-3 bg-[#1a1c23] p-4 rounded-md border border-emerald-500/50 animate-in fade-in zoom-in-95">
                                                    <div>
                                                        <Label className="text-xs text-emerald-400">Pregunta del Usuario</Label>
                                                        <Input
                                                            value={editForm.question}
                                                            onChange={e => setEditForm({ ...editForm, question: e.target.value })}
                                                            className="bg-[#0f1115] border-emerald-500/30 text-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs text-emerald-400">Respuesta Correcta (Lo que debió decir)</Label>
                                                        <Textarea
                                                            value={editForm.answer}
                                                            onChange={e => setEditForm({ ...editForm, answer: e.target.value })}
                                                            className="bg-[#0f1115] border-emerald-500/30 text-white min-h-[100px]"
                                                        />
                                                    </div>
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" onClick={() => setEditingId(null)} className="text-gray-400 hover:text-white">Cancelar</Button>
                                                        <Button size="sm" onClick={saveTrainingFromInbox} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                                            <Save className="w-3 h-3 mr-2" /> Guardar Aprendizaje
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="space-y-1 w-full mr-4">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-xs font-bold text-blue-400">USUARIO</span>
                                                                <span className="text-[10px] text-gray-600">{new Date(pair.user.created_at).toLocaleString()}</span>
                                                            </div>
                                                            <p className="text-gray-200 text-sm">{pair.user.contenido}</p>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => startEditing(pair)}
                                                            className="bg-purple-600 hover:bg-purple-700 text-white shrink-0"
                                                        >
                                                            <Brain className="w-4 h-4 mr-2" /> Entrenar
                                                        </Button>
                                                    </div>

                                                    {pair.bot && (
                                                        <div className="ml-8 mt-2 space-y-1 bg-[#2d2f39]/30 p-2 rounded border-l-2 border-yellow-500/30">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-xs font-bold text-yellow-500/70">AURORA (IA)</span>
                                                            </div>
                                                            <p className="text-gray-400 text-sm italic">{pair.bot.contenido}</p>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB: PERSONALITY */}
                <TabsContent value="personality" className="mt-6">
                    <Card className="bg-[#1a1c23] border-[#2d2f39] text-white">
                        <CardHeader>
                            <CardTitle>Personalidad del Asistente (System Prompt)</CardTitle>
                            <CardDescription>
                                Define quién es Verbo IA. Estas son las instrucciones fundamentales que guían todo su comportamiento.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea
                                value={systemPrompt}
                                onChange={(e) => setSystemPrompt(e.target.value)}
                                className="min-h-[400px] bg-[#0f1115] border-[#2d2f39] text-gray-300 font-mono text-sm leading-relaxed"
                            />
                            <div className="flex justify-end">
                                <Button onClick={saveSystemPrompt} className="bg-purple-600 hover:bg-purple-700 text-white">
                                    <Save className="w-4 h-4 mr-2" /> Guardar Personalidad
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs >
        </div >
    );
};
