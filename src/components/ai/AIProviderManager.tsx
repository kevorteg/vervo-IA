import { GeminiService } from '../../services/GeminiService';
import { GroqService } from '../../services/GroqService';

interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIResponse {
  message: string;
  error?: string;
  model?: string;
}

export interface AIProvider {
  name: string;
  apiKey?: string;
  generateResponse: (messages: AIMessage[], userContext?: any) => Promise<AIResponse>;
}

// 1. Google Gemini Provider (Backup)
export const geminiProvider: AIProvider = {
  name: 'Google Gemini',
  generateResponse: async (messages: AIMessage[], userContext?: any): Promise<AIResponse> => {
    const lastMsg = messages[messages.length - 1];
    const history = messages.slice(0, -1);

    if (!lastMsg || lastMsg.role !== 'user') {
      return { message: "Error: No user message found to send." };
    }

    const response = await GeminiService.sendMessage(history, lastMsg.content);
    return { message: response };
  }
};

// 2. Groq Provider (Primary)
export const groqProvider: AIProvider = {
  name: 'Groq (Llama 3)',
  generateResponse: async (messages: AIMessage[], userContext?: any): Promise<AIResponse> => {
    const lastMsg = messages[messages.length - 1];
    const history = messages.slice(0, -1);

    if (!lastMsg || lastMsg.role !== 'user') {
      return { message: "Error: No user message found to send." };
    }

    const response = await GroqService.sendMessage(history, lastMsg.content);
    return { message: response };
  }
};

// AI Provider Manager
export class AIProviderManager {
  private currentProvider: AIProvider;
  private providers: AIProvider[];

  constructor() {
    this.providers = [groqProvider, geminiProvider]; // Priority: Groq
    this.currentProvider = groqProvider; // Set Groq as default
  }

  setProvider(providerName: string) {
    const provider = this.providers.find(p => p.name === providerName);
    if (provider) {
      this.currentProvider = provider;
    }
  }

  getCurrentProvider(): AIProvider {
    return this.currentProvider;
  }

  getAvailableProviders(): string[] {
    return this.providers.map(p => p.name);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async generateResponse(messages: AIMessage[], userContext?: any): Promise<AIResponse> {
    try {
      console.log('Generating response with:', this.currentProvider.name);
      return await this.currentProvider.generateResponse(messages, userContext);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('AI Generation Error:', error);

      // Groq Failover to Gemini
      if (this.currentProvider.name === 'Groq (Llama 3)') {
        console.log('Failing over to Google Gemini...');
        try {
          const gemini = this.providers.find(p => p.name === 'Google Gemini');
          if (gemini) {
            return await gemini.generateResponse(messages, userContext);
          }
        } catch (e) {
          console.error('Fallback Gemini also failed', e);
        }
      }


      return {
        message: "Lo siento, ha ocurrido un error al conectar con Verbo IA. Por favor intenta de nuevo.",
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const aiManager = new AIProviderManager();

