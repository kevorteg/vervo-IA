
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BibleService } from '@/services/BibleService';
import { Quote, Share2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function DailyVerse() {
    const [verse, setVerse] = useState<{ text: string; ref: string } | null>(null);
    const [loading, setLoading] = useState(true);

    // Lista de versículos populares para rotar si la API falla o para "al azar" local
    const FALLBACK_VERSES = [
        { ref: "Juan 3:16", text: "Porque de tal manera amó Dios al mundo, que ha dado á su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna." },
        { ref: "Salmos 23:1", text: "Jehová es mi pastor; nada me faltará." },
        { ref: "Filipenses 4:13", text: "Todo lo puedo en Cristo que me fortalece." },
        { ref: "Jeremías 29:11", text: "Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis." },
        { ref: "Proverbios 3:5", text: "Fíate de Jehová de todo tu corazón, Y no estribes en tu prudencia." }
    ];

    const loadVerse = async () => {
        setLoading(true);
        try {
            // Intentar obtener un versículo aleatorio de la API es complejo porque requiere IDs específicos.
            // ESTRATEGIA: Usaremos la lista de fallback rotativa basada en el día del año para simular "Versículo del Día"
            // O haremos una búsqueda aleatoria de palabras clave como "amor", "paz", "fe".

            const keywords = ["amor", "paz", "esperanza", "fe", "luz", "camino", "verdad"];
            const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];

            const results = await BibleService.search(randomKeyword);

            if (results && results.verses && results.verses.length > 0) {
                // Elegir uno al azar de los resultados
                const randomIdx = Math.floor(Math.random() * Math.min(results.verses.length, 5));
                const v = results.verses[randomIdx];
                setVerse({ text: v.text, ref: v.reference });
            } else {
                throw new Error("No results");
            }
        } catch (error) {
            console.log("Using fallback verse");
            const randomFallback = FALLBACK_VERSES[Math.floor(Math.random() * FALLBACK_VERSES.length)];
            setVerse(randomFallback);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVerse();
    }, []);

    const handleShare = () => {
        if (verse) {
            navigator.clipboard.writeText(`"${verse.text}" - ${verse.ref}`);
            toast.success("Versículo copiado al portapapeles");
        }
    };

    return (
        <Card className="bg-gradient-to-br from-purple-900/50 to-indigo-900/30 border-purple-500/30 text-white overflow-hidden relative group hover:border-purple-500/50 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10" onClick={loadVerse}>
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10" onClick={handleShare}>
                    <Share2 className="w-4 h-4" />
                </Button>
            </div>

            <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-purple-300 mb-1">
                    <Quote className="w-4 h-4 transform scale-x-[-1]" />
                    <span className="text-xs font-bold tracking-wider uppercase">Promesa Diaria</span>
                </div>
            </CardHeader>

            <CardContent>
                {loading ? (
                    <div className="space-y-2 animate-pulse">
                        <div className="h-4 bg-white/10 rounded w-3/4"></div>
                        <div className="h-4 bg-white/10 rounded w-1/2"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-lg md:text-xl font-serif text-white/90 leading-relaxed italic">
                            "{verse?.text}"
                        </p>
                        <p className="text-right text-sm font-bold text-purple-400">
                            — {verse?.ref}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
