
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Mic,
  Heart,
  Search,
  Plus,
  Trash2,
  Calendar,
  Star,
  Tag
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SpiritualContent {
  id: string;
  title: string;
  content: string;
  author?: string;
  category: string;
  tags: string[];
  dateCreated: string;
  isFavorite: boolean;
}

interface SpiritualLibrary {
  devotionals: SpiritualContent[];
  sermons: SpiritualContent[];
  studies: SpiritualContent[];
  prayers: SpiritualContent[];
}

export const SpiritualLibrary = () => {
  const [library, setLibrary] = useState<SpiritualLibrary>({
    devotionals: [],
    sermons: [],
    studies: [],
    prayers: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('devotionals');
  const [isAddingContent, setIsAddingContent] = useState(false);
  const [newContent, setNewContent] = useState({
    title: '',
    content: '',
    author: '',
    category: 'devotionals',
    tags: ''
  });
  const { toast } = useToast();

  const contentTypes = [
    {
      id: 'devotionals',
      label: '📖 Devocionales',
      icon: BookOpen,
      description: 'Reflexiones diarias para el alma',
      color: 'bg-blue-500'
    },
    {
      id: 'sermons',
      label: '🎤 Sermones',
      icon: Mic,
      description: 'Mensajes inspiradores y enseñanzas',
      color: 'bg-green-500'
    },
    {
      id: 'studies',
      label: '📚 Estudios',
      icon: BookOpen,
      description: 'Estudios bíblicos profundos',
      color: 'bg-purple-500'
    },
    {
      id: 'prayers',
      label: '🙏 Oraciones',
      icon: Heart,
      description: 'Oraciones para diferentes situaciones',
      color: 'bg-pink-500'
    }
  ];

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = () => {
    const saved = localStorage.getItem('chatmj_spiritual_library');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setLibrary(data);
      } catch (error) {
        console.error('Error cargando biblioteca:', error);
      }
    } else {
      // Cargar contenido predeterminado
      loadDefaultContent();
    }
  };

  const loadDefaultContent = () => {
    const defaultLibrary: SpiritualLibrary = {
      devotionals: [
        {
          id: '1',
          title: 'Confianza en la Tormenta',
          content: '**Versículo del día:** "Jehová peleará por vosotros, y vosotros estaréis tranquilos" - Éxodo 14:14\n\n**Reflexión:** Cuando las tormentas de la vida nos sacuden, es fácil perder la calma. Pero Dios nos recuerda que Él pelea nuestras batallas. No tenemos que enfrentar solos los desafíos. 🌊⚡\n\n**Oración:** Padre celestial, en medio de mis luchas, ayúdame a recordar que Tú peleas por mí. Dame paz para confiar en tu proceso perfecto. Amén. 🙏\n\n**Aplicación:** Hoy, en lugar de preocuparte, entrega tus cargas a Dios y descansa en Su cuidado.',
          author: 'Misión Juvenil',
          category: 'fe',
          tags: ['confianza', 'paz', 'batallas', 'descanso'],
          dateCreated: new Date().toISOString(),
          isFavorite: true
        },
        {
          id: '2',
          title: 'Propósito Divino',
          content: '**Versículo del día:** "Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis" - Jeremías 29:11\n\n**Reflexión:** A veces no entendemos por qué pasan ciertas cosas, pero Dios tiene un plan perfecto. Sus pensamientos hacia nosotros son de bien, no de mal. 💭✨\n\n**Oración:** Señor, ayúdame a confiar en tu plan perfecto, incluso cuando no entienda el camino. Gracias por tus propósitos de bien en mi vida. Amén.\n\n**Desafío:** Escribe 3 formas en que Dios ha mostrado Su bondad en tu vida esta semana.',
          author: 'Misión Juvenil',
          category: 'propósito',
          tags: ['propósito', 'planes de Dios', 'esperanza', 'futuro'],
          dateCreated: new Date().toISOString(),
          isFavorite: false
        }
      ],
      sermons: [
        {
          id: '3',
          title: 'El Poder de la Adoración',
          content: '**Tema:** La adoración que transforma vidas\n\n**Versículo clave:** "Mas la hora viene, y ahora es, cuando los verdaderos adoradores adorarán al Padre en espíritu y en verdad; porque también el Padre tales adoradores busca que le adoren" - Juan 4:23\n\n**Puntos principales:**\n1. **Adoración en espíritu** - Desde el corazón, no solo rituales\n2. **Adoración en verdad** - Basada en quien Dios realmente es\n3. **Dios busca adoradores** - Él desea nuestra comunión\n\n**Aplicación:** La adoración auténtica cambia nuestra perspectiva y nos conecta con el corazón de Dios. 🎵✨',
          author: 'Pastor MJ',
          category: 'adoración',
          tags: ['adoración', 'espíritu', 'verdad', 'comunión'],
          dateCreated: new Date().toISOString(),
          isFavorite: false
        }
      ],
      studies: [
        {
          id: '4',
          title: 'Estudio: Los Frutos del Espíritu',
          content: '**Texto base:** Gálatas 5:22-23\n\n**Introducción:** El Espíritu Santo produce frutos en nuestra vida que reflejan el carácter de Cristo.\n\n**Los 9 Frutos:**\n1. **Amor** (ágape) - Amor incondicional\n2. **Gozo** - Alegría que no depende de circunstancias\n3. **Paz** - Tranquilidad interior\n4. **Paciencia** - Perseverancia en dificultades\n5. **Benignidad** - Bondad práctica\n6. **Bondad** - Generosidad del corazón\n7. **Fe** - Fidelidad y confianza\n8. **Mansedumbre** - Fortaleza bajo control\n9. **Templanza** - Autocontrol\n\n**Reflexión:** ¿Cuáles frutos necesitas desarrollar más en tu vida? 🍎✨',
          author: 'Equipo MJ',
          category: 'crecimiento',
          tags: ['Espíritu Santo', 'carácter', 'frutos', 'crecimiento'],
          dateCreated: new Date().toISOString(),
          isFavorite: true
        }
      ],
      prayers: [
        {
          id: '5',
          title: 'Oración por Fortaleza',
          content: '**Para momentos difíciles**\n\nPadre celestial,\n\nEn este momento de dificultad, vengo a ti buscando tu fortaleza. Sé que en mi debilidad, tu poder se perfecciona. 💪\n\nTe pido:\n• Fortaleza para enfrentar cada desafío\n• Sabiduría para tomar decisiones correctas\n• Paz que sobrepase todo entendimiento\n• Fe para confiar en tu plan perfecto\n\nRecuérdame que "todo lo puedo en Cristo que me fortalece" y que nunca me abandonarás.\n\nEn el nombre poderoso de Jesús, amén. 🙏✨',
          author: 'Misión Juvenil',
          category: 'fortaleza',
          tags: ['fortaleza', 'dificultades', 'poder de Dios', 'fe'],
          dateCreated: new Date().toISOString(),
          isFavorite: false
        }
      ]
    };

    setLibrary(defaultLibrary);
    saveLibrary(defaultLibrary);
  };

  const saveLibrary = (libraryData: SpiritualLibrary) => {
    localStorage.setItem('chatmj_spiritual_library', JSON.stringify(libraryData));
  };

  const addContent = () => {
    if (!newContent.title.trim() || !newContent.content.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa título y contenido",
        variant: "destructive",
      });
      return;
    }

    const content: SpiritualContent = {
      id: Date.now().toString(),
      title: newContent.title,
      content: newContent.content,
      author: newContent.author || 'Anónimo',
      category: newContent.category,
      tags: newContent.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      dateCreated: new Date().toISOString(),
      isFavorite: false
    };

    const updatedLibrary = {
      ...library,
      [newContent.category]: [...library[newContent.category as keyof SpiritualLibrary], content]
    };

    setLibrary(updatedLibrary);
    saveLibrary(updatedLibrary);
    setNewContent({ title: '', content: '', author: '', category: 'devotionals', tags: '' });
    setIsAddingContent(false);

    toast({
      title: "✅ Contenido agregado",
      description: `Se agregó nuevo contenido a ${contentTypes.find(t => t.id === newContent.category)?.label}`,
    });
  };

  const deleteContent = (type: string, id: string) => {
    const updatedLibrary = {
      ...library,
      [type]: library[type as keyof SpiritualLibrary].filter(item => item.id !== id)
    };

    setLibrary(updatedLibrary);
    saveLibrary(updatedLibrary);

    toast({
      title: "🗑️ Contenido eliminado",
      description: "El contenido se eliminó correctamente",
    });
  };

  const toggleFavorite = (type: string, id: string) => {
    const updatedLibrary = {
      ...library,
      [type]: library[type as keyof SpiritualLibrary].map(item =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    };

    setLibrary(updatedLibrary);
    saveLibrary(updatedLibrary);
  };

  const filteredContent = (type: string) => {
    const content = library[type as keyof SpiritualLibrary];
    if (!searchTerm) return content;

    return content.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-aurora-primario rounded-2xl p-6 text-white">
        <h2 className="text-3xl font-bold mb-2 flex items-center">
          <BookOpen className="w-8 h-8 mr-3" />
          Biblioteca Espiritual
        </h2>
        <p className="text-white/90 mb-4">
          Recursos espirituales para fortalecer tu fe y crecimiento cristiano
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {contentTypes.map(type => (
            <div key={type.id} className="bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold">
                {library[type.id as keyof SpiritualLibrary].length}
              </div>
              <div className="text-sm opacity-90">{type.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Add */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar en la biblioteca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button
          onClick={() => setIsAddingContent(true)}
          className="bg-aurora-primario hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar Contenido
        </Button>
      </div>

      {/* Add Content Modal */}
      {isAddingContent && (
        <Card className="border-2 border-aurora-primario/20">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="w-5 h-5 mr-2 text-aurora-primario" />
              Agregar Nuevo Contenido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={newContent.title}
                  onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                  placeholder="Título del contenido"
                />
              </div>
              <div>
                <Label htmlFor="author">Autor</Label>
                <Input
                  id="author"
                  value={newContent.author}
                  onChange={(e) => setNewContent({ ...newContent, author: e.target.value })}
                  placeholder="Nombre del autor"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category">Categoría</Label>
              <select
                id="category"
                value={newContent.category}
                onChange={(e) => setNewContent({ ...newContent, category: e.target.value })}
                className="w-full mt-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                {contentTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.label} - {type.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="tags">Etiquetas (separadas por comas)</Label>
              <Input
                id="tags"
                value={newContent.tags}
                onChange={(e) => setNewContent({ ...newContent, tags: e.target.value })}
                placeholder="fe, esperanza, oración, juventud"
              />
            </div>

            <div>
              <Label htmlFor="content">Contenido</Label>
              <Textarea
                id="content"
                value={newContent.content}
                onChange={(e) => setNewContent({ ...newContent, content: e.target.value })}
                placeholder="Escribe el contenido completo aquí..."
                rows={8}
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={addContent} className="bg-aurora-primario hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Agregar
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsAddingContent(false)}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          {contentTypes.map(type => (
            <TabsTrigger key={type.id} value={type.id} className="flex items-center">
              <type.icon className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">{type.label}</span>
              <Badge variant="secondary" className="ml-2">
                {library[type.id as keyof SpiritualLibrary].length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {contentTypes.map(type => (
          <TabsContent key={type.id} value={type.id} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContent(type.id).map(item => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(type.id, item.id)}
                          className={item.isFavorite ? 'text-yellow-500' : 'text-gray-400'}
                        >
                          <Star className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteContent(type.id, item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="flex items-center justify-between">
                      <span>Por {item.author}</span>
                      <span className="text-xs flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(item.dateCreated).toLocaleDateString()}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                        {item.content.substring(0, 150)}...
                      </p>

                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                          {item.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{item.tags.length - 3} más
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
