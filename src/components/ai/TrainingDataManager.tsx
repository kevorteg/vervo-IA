
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Plus, Trash2, Save, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { webLLMManager } from './WebLLMManager';

interface TrainingEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const TrainingDataManager = () => {
  const [trainingData, setTrainingData] = useState<TrainingEntry[]>([]);
  const [newEntry, setNewEntry] = useState({
    question: '',
    answer: '',
    category: 'general'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const categories = [
    'general',
    'oracion',
    'devocional',
    'fe',
    'crisis',
    'evangelismo',
    'biblia',
    'juventud'
  ];

  const addTrainingEntry = () => {
    if (!newEntry.question.trim() || !newEntry.answer.trim()) {
      toast({
        title: "Error",
        description: "Por favor completa la pregunta y respuesta",
        variant: "destructive",
      });
      return;
    }

    const entry: TrainingEntry = {
      id: Date.now().toString(),
      ...newEntry
    };

    setTrainingData([...trainingData, entry]);
    setNewEntry({ question: '', answer: '', category: 'general' });
    
    toast({
      title: "Entrada agregada",
      description: "Se agregó una nueva entrada de entrenamiento",
    });
  };

  const removeEntry = (id: string) => {
    setTrainingData(trainingData.filter(entry => entry.id !== id));
    toast({
      title: "Entrada eliminada",
      description: "Se eliminó la entrada de entrenamiento",
    });
  };

  const saveTrainingData = async () => {
    setIsLoading(true);
    try {
      // Convertir a formato para WebLLM
      const formattedData = trainingData.flatMap(entry => [
        {
          role: "user",
          content: entry.question
        },
        {
          role: "assistant", 
          content: entry.answer
        }
      ]);

      await webLLMManager.loadCustomTrainingData(formattedData);
      
      // Guardar en localStorage como backup
      localStorage.setItem('chatmj_training_data', JSON.stringify(trainingData));
      
      toast({
        title: "Datos guardados",
        description: `Se guardaron ${trainingData.length} entradas de entrenamiento`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron guardar los datos de entrenamiento",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (Array.isArray(data)) {
          setTrainingData(data);
          toast({
            title: "Datos cargados",
            description: `Se cargaron ${data.length} entradas`,
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al cargar el archivo",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(trainingData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'chatmj_training_data.json';
    link.click();
    
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <FileText className="w-6 h-6 mr-2" />
          Entrenamiento de ChatMJ
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Agrega datos de entrenamiento personalizados para mejorar las respuestas de ChatMJ
        </p>

        {/* Agregar nueva entrada */}
        <div className="space-y-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white">Nueva entrada de entrenamiento</h3>
          
          <div>
            <Label htmlFor="category">Categoría</Label>
            <select
              id="category"
              value={newEntry.category}
              onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
              className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="question">Pregunta/Mensaje del usuario</Label>
            <Input
              id="question"
              value={newEntry.question}
              onChange={(e) => setNewEntry({ ...newEntry, question: e.target.value })}
              placeholder="¿Cómo puedo fortalecer mi fe?"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="answer">Respuesta esperada</Label>
            <Textarea
              id="answer"
              value={newEntry.answer}
              onChange={(e) => setNewEntry({ ...newEntry, answer: e.target.value })}
              placeholder="La fe se fortalece través de la oración, lectura bíblica..."
              rows={3}
              className="mt-1"
            />
          </div>

          <Button onClick={addTrainingEntry} className="bg-aurora-primario hover:bg-orange-600">
            <Plus className="w-4 h-4 mr-2" />
            Agregar entrada
          </Button>
        </div>

        {/* Acciones de archivo */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button onClick={saveTrainingData} disabled={isLoading || trainingData.length === 0}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Guardando...' : 'Guardar datos'}
          </Button>
          
          <Button variant="outline" onClick={exportData} disabled={trainingData.length === 0}>
            <Upload className="w-4 h-4 mr-2" />
            Exportar
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
                <FileText className="w-4 h-4 mr-2" />
                Cargar archivo
              </label>
            </Button>
          </div>
        </div>

        {/* Lista de entradas */}
        {trainingData.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Datos de entrenamiento ({trainingData.length} entradas)
            </h3>
            
            <div className="max-h-96 overflow-y-auto space-y-2">
              {trainingData.map((entry) => (
                <div key={entry.id} className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs bg-aurora-primario text-white px-2 py-1 rounded">
                      {entry.category}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEntry(entry.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Pregunta:</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{entry.question}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Respuesta:</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{entry.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
