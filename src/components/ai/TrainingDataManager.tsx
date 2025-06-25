import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, Plus, Trash2, Save, FileText, Brain, Zap, Database, Settings, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { webLLMManager, AVAILABLE_MODELS } from './WebLLMManager';

interface TrainingEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface InitProgress {
  text: string;
  progress: number;
}

export const TrainingDataManager = () => {
  const [trainingData, setTrainingData] = useState<TrainingEntry[]>([]);
  const [newEntry, setNewEntry] = useState({
    question: '',
    answer: '',
    category: 'general'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<any>({});
  const [initProgress, setInitProgress] = useState<InitProgress>({ text: '', progress: 0 });
  const [selectedModel, setSelectedModel] = useState('Llama-3.2-1B-Instruct-q4f16_1-MLC');
  const { toast } = useToast();

  const categories = [
    { value: 'general', label: '🌟 General', desc: 'Preguntas generales sobre fe' },
    { value: 'oracion', label: '🙏 Oración', desc: 'Vida de oración y peticiones' },
    { value: 'devocional', label: '📖 Devocional', desc: 'Lecturas bíblicas y meditación' },
    { value: 'fe', label: '✨ Fe', desc: 'Fortalecimiento de la fe' },
    { value: 'crisis', label: '💙 Crisis', desc: 'Ayuda en momentos difíciles' },
    { value: 'evangelismo', label: '🌍 Evangelismo', desc: 'Testimonio y evangelización' },
    { value: 'biblia', label: '📚 Biblia', desc: 'Estudio bíblico profundo' },
    { value: 'juventud', label: '🎯 Juventud', desc: 'Temas específicos de jóvenes' }
  ];

  useEffect(() => {
    loadExistingData();
    updateStats();
    // Cargar modelo seleccionado del localStorage
    const savedModel = localStorage.getItem('chatmj_selected_model');
    if (savedModel && AVAILABLE_MODELS[savedModel as keyof typeof AVAILABLE_MODELS]) {
      setSelectedModel(savedModel);
      webLLMManager.setModel(savedModel);
    }
  }, []);

  const loadExistingData = () => {
    const saved = localStorage.getItem('chatmj_training_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setTrainingData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error loading training data:', error);
      }
    }
  };

  const updateStats = () => {
    const webLLMStats = webLLMManager.getTrainingStats();
    setStats(webLLMStats);
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    webLLMManager.setModel(modelId);
    localStorage.setItem('chatmj_selected_model', modelId);
    
    const modelInfo = AVAILABLE_MODELS[modelId as keyof typeof AVAILABLE_MODELS];
    toast({
      title: "🤖 Modelo seleccionado",
      description: `${modelInfo.name} - ${modelInfo.description}`,
    });
  };

  const addTrainingEntry = () => {
    if (!newEntry.question.trim() || !newEntry.answer.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa la pregunta y respuesta",
        variant: "destructive",
      });
      return;
    }

    const entry: TrainingEntry = {
      id: Date.now().toString(),
      ...newEntry
    };

    const updatedData = [...trainingData, entry];
    setTrainingData(updatedData);
    setNewEntry({ question: '', answer: '', category: 'general' });
    
    // Guardar automáticamente
    localStorage.setItem('chatmj_training_data', JSON.stringify(updatedData));
    
    toast({
      title: "✅ Entrada agregada",
      description: `Se agregó una nueva entrada en la categoría ${categories.find(c => c.value === entry.category)?.label}`,
    });
  };

  const removeEntry = (id: string) => {
    const updatedData = trainingData.filter(entry => entry.id !== id);
    setTrainingData(updatedData);
    localStorage.setItem('chatmj_training_data', JSON.stringify(updatedData));
    
    toast({
      title: "🗑️ Entrada eliminada",
      description: "Se eliminó la entrada de entrenamiento",
    });
  };

  const saveToWebLLM = async () => {
    setIsLoading(true);
    try {
      await webLLMManager.loadCustomTrainingData(trainingData);
      updateStats();
      
      toast({
        title: "🚀 Entrenamiento actualizado",
        description: `Se cargaron ${trainingData.length} entradas en Web-LLM`,
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "No se pudieron cargar los datos en Web-LLM",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const initializeWebLLM = async () => {
    setIsLoading(true);
    setInitProgress({ text: 'Iniciando...', progress: 0 });
    
    try {
      const success = await webLLMManager.initialize((progress) => {
        setInitProgress(progress);
      });
      
      updateStats();
      
      if (success) {
        toast({
          title: "🎉 Web-LLM Inicializado",
          description: `${AVAILABLE_MODELS[selectedModel as keyof typeof AVAILABLE_MODELS].name} cargado exitosamente`,
        });
      } else {
        toast({
          title: "⚠️ Modo Fallback",
          description: "Web-LLM no disponible, usando patrones locales",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Error de inicialización",
        description: "No se pudo inicializar Web-LLM. Verifica WebGPU en chrome://flags/",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setInitProgress({ text: '', progress: 0 });
    }
  };

  const loadFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let data = JSON.parse(content);
        
        // Manejar diferentes formatos
        if (!Array.isArray(data)) {
          data = [data];
        }
        
        // Validar formato
        const validData = data.filter(item =>
          item.question && item.answer && typeof item.question === 'string'
        ).map(item => ({
          ...item,
          id: item.id || Date.now().toString() + Math.random(),
          category: item.category || 'general'
        }));
        
        setTrainingData(validData);
        localStorage.setItem('chatmj_training_data', JSON.stringify(validData));
        
        toast({
          title: "📁 Datos cargados",
          description: `Se cargaron ${validData.length} entradas válidas`,
        });
      } catch (error) {
        toast({
          title: "❌ Error de formato",
          description: "Error al cargar el archivo. Verifica el formato JSON.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const exportData = () => {
    const exportObject = {
      version: "1.0",
      created: new Date().toISOString(),
      description: "Datos de entrenamiento de ChatMJ - Misión Juvenil",
      selectedModel,
      data: trainingData,
      stats: {
        totalEntries: trainingData.length,
        categories: categories.map(cat => ({
          ...cat,
          count: trainingData.filter(entry => entry.category === cat.value).length
        }))
      }
    };
    
    const dataStr = JSON.stringify(exportObject, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chatmj_training_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    toast({
      title: "📥 Exportación completa",
      description: "Archivo descargado exitosamente",
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-aurora-primario to-aurora-violet rounded-2xl p-6 text-white">
        <h2 className="text-3xl font-bold mb-2 flex items-center">
          <Brain className="w-8 h-8 mr-3" />
          Entrenamiento de ChatMJ
        </h2>
        <p className="text-aurora-celestial/90 mb-4">
          Entrena a ChatMJ con contenido específico de Misión Juvenil usando Web-LLM
        </p>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-2xl font-bold">{trainingData.length}</div>
            <div className="text-sm opacity-90">Entradas</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-2xl font-bold">{stats.totalMessages || 0}</div>
            <div className="text-sm opacity-90">Mensajes totales</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-2xl font-bold">{stats.isInitialized ? '✅' : '❌'}</div>
            <div className="text-sm opacity-90">Web-LLM</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-2xl font-bold text-xs">{stats.currentModel?.name?.split(' ')[0] || 'N/A'}</div>
            <div className="text-sm opacity-90">Modelo</div>
          </div>
        </div>
      </div>

      {/* Model Selection */}
      <Card className="border-2 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-6 h-6 mr-2 text-purple-600" />
            Seleccionar Modelo Web-LLM
          </CardTitle>
          <CardDescription>
            Elige el modelo de IA que mejor se adapte a tu hardware
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {Object.entries(AVAILABLE_MODELS).map(([modelId, modelInfo]) => (
              <div
                key={modelId}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedModel === modelId
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                }`}
                onClick={() => handleModelChange(modelId)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-lg">{modelInfo.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {modelInfo.description}
                    </p>
                    <div className="flex gap-3 mt-2">
                      <Badge variant="outline">
                        💾 {modelInfo.memoryRequired}
                      </Badge>
                      <Badge variant="outline">
                        📦 {modelInfo.downloadSize}
                      </Badge>
                    </div>
                  </div>
                  {selectedModel === modelId && (
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Web-LLM Control */}
      <Card className="border-2 border-aurora-primario/20">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-6 h-6 mr-2 text-aurora-primario" />
            Control de Web-LLM
          </CardTitle>
          <CardDescription>
            Inicializa y configura el modelo de IA local
          </CardDescription>
        </CardHeader>
        <CardContent>
          {initProgress.progress > 0 && initProgress.progress < 100 && (
            <div className="mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>{initProgress.text}</span>
                <span>{Math.round(initProgress.progress)}%</span>
              </div>
              <Progress value={initProgress.progress} className="w-full" />
            </div>
          )}
          
          <div className="flex flex-wrap gap-3 mb-4">
            <Button 
              onClick={initializeWebLLM} 
              disabled={isLoading}
              className="bg-aurora-primario hover:bg-orange-600"
            >
              <Brain className="w-4 h-4 mr-2" />
              {isLoading ? 'Inicializando...' : 'Inicializar Web-LLM'}
            </Button>
            
            <Button 
              onClick={saveToWebLLM} 
              disabled={isLoading || trainingData.length === 0}
              variant="outline"
            >
              <Database className="w-4 h-4 mr-2" />
              Cargar datos en IA
            </Button>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <div>
              {stats.isInitialized ? 
                `✅ Web-LLM activo con ${stats.currentModel?.name || 'modelo desconocido'}` : 
                '⚠️ Web-LLM no inicializado - usando respuestas por patrones'
              }
            </div>
            <div className="text-xs">
              💡 <strong>Tip:</strong> Si Web-LLM no funciona, habilita WebGPU en chrome://flags/
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add New Entry */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="w-6 h-6 mr-2 text-green-500" />
            Nueva entrada de entrenamiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category" className="text-sm font-medium">Categoría</Label>
              <select
                id="category"
                value={newEntry.category}
                onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
                className="w-full mt-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-aurora-primario"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label} - {cat.desc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="question" className="text-sm font-medium">Pregunta del usuario</Label>
              <Input
                id="question"
                value={newEntry.question}
                onChange={(e) => setNewEntry({ ...newEntry, question: e.target.value })}
                placeholder="Ejemplo: ¿Cómo puedo fortalecer mi fe?"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="answer" className="text-sm font-medium">Respuesta esperada (estilo Aurora Celestial)</Label>
              <Textarea
                id="answer"
                value={newEntry.answer}
                onChange={(e) => setNewEntry({ ...newEntry, answer: e.target.value })}
                placeholder="Escribe una respuesta cristocéntrica, empática y con versículos bíblicos..."
                rows={4}
                className="mt-1"
              />
              <div className="text-xs text-gray-500 mt-1">
                💡 Tip: Usa emojis, citas bíblicas y un tono cálido y juvenil
              </div>
            </div>

            <Button 
              onClick={addTrainingEntry} 
              className="bg-aurora-primario hover:bg-orange-600 w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar entrada
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* File Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-6 h-6 mr-2 text-blue-500" />
            Gestión de archivos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={exportData} 
              disabled={trainingData.length === 0}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar datos
            </Button>
            
            <div>
              <input
                type="file"
                accept=".json"
                onChange={loadFromFile}
                className="hidden"
                id="file-upload"
              />
              <Button variant="outline" asChild>
                <label htmlFor="file-upload" className="cursor-pointer flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  Cargar archivo
                </label>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training Data List */}
      {trainingData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              📚 Datos de entrenamiento ({trainingData.length} entradas)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto space-y-3">
              {trainingData.map((entry) => {
                const category = categories.find(c => c.value === entry.category);
                return (
                  <div key={entry.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div className="flex justify-between items-start mb-3">
                      <Badge className="bg-aurora-primario text-white">
                        {category?.label || entry.category}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEntry(entry.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          👤 Pregunta:
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-600 p-2 rounded">
                          {entry.question}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          🤖 Respuesta:
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-600 p-2 rounded">
                          {entry.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
