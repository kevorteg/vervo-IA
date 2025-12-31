
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { GroqService } from '@/services/GroqService';
import { useToast } from '@/hooks/use-toast';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

interface BibleChatProps {
    currentBookName?: string;
    currentChapter?: string;
    chapterContent?: string; // To give context to AI
}

export const BibleChat = ({ currentBookName, currentChapter, chapterContent }: BibleChatProps) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: '¡Hola! Soy tu asistente bíblico. Puedo ayudarte con el contexto histórico, traducción original o reflexiones sobre este capítulo. ¿Qué tienes en mente? 🙏'
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => scrollToBottom(), [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput('');
        const newMsg: Message = { id: Date.now().toString(), role: 'user', content: userMsg };
        setMessages(prev => [...prev, newMsg]);
        setLoading(true);

        try {
            // Construct context-aware prompt
            const contextPrompt = `
            ESTÁS EN EL MODO "ASISTENTE BÍBLICO".
            CONTEXTO ACTUAL:
            Libro: ${currentBookName || 'Ninguno'}
            Capítulo: ${currentChapter || 'Ninguno'}
            
            CONTENIDO LEÍDO (Fragmento):
            ${chapterContent ? chapterContent.substring(0, 1000) + '...' : 'No hay contenido cargado.'}

            Tu tarea es responder preguntas sobre este texto específico, explicar términos difíciles, dar contexto histórico o aplicación devocional.
            Sé conciso y espiritual.
            `;

            // We adapt GroqService history format
            const history = messages.map(m => ({ role: m.role, content: m.content }));

            // Override the default system prompt logic implicitly by asking GroqService
            // Actually GroqService hardcodes the system prompt.
            // Ideally we should have a generic AI service.
            // For now, we will prepend the context to the user message to "force" the context focus.

            const fullMessage = `${contextPrompt}\n\nPREGUNTA DEL USUARIO: ${userMsg}`;

            const responseText = await GroqService.sendMessage(history, fullMessage);

            const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: responseText };
            setMessages(prev => [...prev, aiMsg]);

        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "No pude procesar tu pregunta.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#111215] border-l border-[#2d2f39]">
            {/* Header */}
            <div className="p-4 border-b border-[#2d2f39] flex justify-between items-center bg-[#16181d]">
                <h3 className="font-bold text-yellow-500 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> CHAT DE ESTUDIO
                </h3>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(m => (
                    <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${m.role === 'user'
                                ? 'bg-purple-600 text-white rounded-tr-none'
                                : 'bg-[#2d2f39] text-gray-200 rounded-tl-none'
                            }`}>
                            {m.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-[#2d2f39] p-3 rounded-2xl rounded-tl-none">
                            <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[#2d2f39] bg-[#16181d]">
                <div className="relative">
                    <Input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder="Pregunta sobre el capítulo..."
                        className="bg-[#0b0c0e] border-[#2d2f39] text-white pr-10 focus-visible:ring-purple-500"
                    />
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleSend}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-purple-500 hover:text-purple-400 hover:bg-transparent"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
