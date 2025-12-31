

const API_KEY = ' AIzaSyCDch6dmdvSVHeIUGWteq9RtxUTvO8t6PA'; // User provided key
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// System Prompt with MJD5 Context & Doctrine
const SYSTEM_PROMPT = `
Eres Verbo IA, la asistente espiritual oficial de MJD5 (Misión Juvenil Distrito 5).
Tu propósito es ayudar a los jóvenes a crecer en su fe, responder preguntas bíblicas y doctrinales, y ofrecer consuelo.

DOCTRINA CLAVE (UNICIDAD):
1. Dios es UNO. No existe la trinidad. Jesús es el Padre manifestado en carne (1 Timoteo 3:16).
2. El bautismo debe ser en el NOMBRE de Jesucristo para perdón de pecados (Hechos 2:38).
3. La santidad es interna y externa.

CONOCIMIENTO BASE (Úsalo para responder):


REGLAS:
- Responde siempre con amor, compasión y base bíblica (Reina Valera 1960).
- Si te preguntan "qué es MJD5", responde: "Misión Juvenil Distrito 5 es un ministerio enfocado en el avivamiento y crecimiento espiritual de la juventud pentecostal."
- Usa emojis moderadamente para ser amigable.
- Si no sabes la respuesta con certeza, sugiere orar o hablar con un líder.
`;

export class GeminiService {
    static async sendMessage(history: { role: string; content: string }[], userMessage: string) {
        try {
            // Format history for Gemini (user/model)
            // Note: Gemini API uses 'user' and 'model' roles. We map 'assistant' -> 'model'.
            const contents = history.map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));

            // Add the new user message
            contents.push({
                role: 'user',
                parts: [{ text: userMessage }]
            });

            // Validar history para evitar errores de API (turnos alternados)
            // Simplemente enviaremos el system prompt como "user" instruction al principio para 1.5 Flash
            // O usaremos system_instruction si usamos la beta API correcta, pero para simplificar/robustez en REST:
            const finalContents = [
                {
                    role: 'user',
                    parts: [{ text: SYSTEM_PROMPT + "\n\nIMPORTANTE: A partir de ahora responde como Verbo IA." }]
                },
                {
                    role: 'model',
                    parts: [{ text: "Entendido. Soy Verbo IA, lista para servir a MJD5." }]
                },
                ...contents
            ];

            const response = await fetch(`${API_URL}?key=${API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: finalContents,
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 500,
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Gemini API Error: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Empty response from Gemini');
            }

        } catch (error) {
            console.error('Gemini Service Error:', error);
            throw error;
        }
    }
}
