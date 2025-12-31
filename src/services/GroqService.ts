
import { supabase } from '../integrations/supabase/client';
const API_KEY = import.meta.env.VITE_GROQ_API_KEY || ''; // Ensure key is set in .env
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Base System Prompt (Fallback)
const DEFAULT_SYSTEM_PROMPT = `
Eres Verbo IA, una asistente cristiana conversacional para jóvenes.

ROL:
– Acompañas, escuchas y respondes como una guía espiritual cercana.
– No predicas a menos que el usuario lo pida.
– Respondes como en una conversación, no como un manual doctrinal.

ESTILO:
– Respuestas claras, breves y humanas.
– Por defecto usa entre 3 y 6 líneas.
– Usa lenguaje sencillo, cercano y respetuoso.
– Usa emojis con moderación 🙏✨

PROGRESIVIDAD:
– No expliques todo de una vez.
– Da solo la información necesaria para la pregunta.
– Siempre puedes invitar a profundizar con una pregunta corta.

DOCTRINA BASE (UNICIDAD):
– Dios es UNO. Jesús es Dios manifestado en carne (1 Timoteo 3:16).
– Bautismo en el Nombre de Jesucristo (Hechos 2:38).
– Santidad interna y externa.
⚠️ Estas doctrinas se explican SOLO si el tema lo requiere.

LÍMITES:
– No responder con estudios largos si no se solicitan.
– No usar tono de sermón por defecto.
– Priorizar relación antes que información.

`;

export class GroqService {
    private static async getSystemPrompt(): Promise<string> {
        try {
            // 1. Try to fetch custom system prompt from DB
            const { data } = await supabase
                .from('entrenamiento')
                .select('respuesta')
                .eq('categoria', 'config_sys_prompt')
                .single();

            if (data && data.respuesta) {
                return data.respuesta;
            }
        } catch (e) {
            console.warn('Could not fetch system prompt from DB, using default.');
        }
        return DEFAULT_SYSTEM_PROMPT;
    }

    private static async getTrainingContext(): Promise<string> {
        try {
            // 2. Fetch Q&A pairs from DB (exclude config)
            // IMPORTANT: Sort by newest first to ensure recent training is included
            // Increased limit to 100 to capture more context
            const { data } = await supabase
                .from('entrenamiento')
                .select('pregunta, respuesta')
                .neq('categoria', 'config_sys_prompt')
                .order('created_at', { ascending: false })
                .limit(100);

            if (data && data.length > 0) {
                console.log('Contexto de entrenamiento cargado:', data.length, 'entradas');
                return JSON.stringify(data, null, 2);
            }
        } catch (e) {
            console.warn('Could not fetch training data, using default JSON.', e);
        }
        // Fallback to static JSON (Empty now as file was deleted)
        return "[]";
    }

    static async sendMessage(history: { role: string; content: string }[], userMessage: string) {
        try {
            // Load dynamic context
            const dynamicSystemPrompt = await this.getSystemPrompt();
            const trainingContext = await this.getTrainingContext();

            // Inject context into the prompt
            const fullSystemMessage = `
${dynamicSystemPrompt}

CONOCIMIENTO BASE ADICIONAL (Prioridad Alta):
${trainingContext}
`;

            // Format messages for OpenAI/Groq format
            const messages = [
                { role: 'system', content: fullSystemMessage },
                ...history.map(msg => ({
                    role: msg.role === 'assistant' ? 'assistant' : 'user', // Ensure correct roles
                    content: msg.content
                })),
                { role: 'user', content: userMessage }
            ];

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile", // Fast and good model
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 1024
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Groq API Error Details:', errorData);
                throw new Error(`Groq API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (data.choices && data.choices.length > 0 && data.choices[0].message) {
                return data.choices[0].message.content;
            } else {
                throw new Error('Empty response from Groq');
            }

        } catch (error) {
            console.error('Groq Service Error:', error);
            throw error;
        }
    }
}
