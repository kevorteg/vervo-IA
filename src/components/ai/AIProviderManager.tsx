import { webLLMManager } from './WebLLMManager';

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

// 1. Web Local LLM Provider (Primary)
export const localWebLLMProvider: AIProvider = {
  name: 'Local Web-LLM',
  generateResponse: async (messages: AIMessage[], userContext?: any): Promise<AIResponse> => {
    return await webLLMManager.generateResponse(messages as any, userContext);
  }
};

// ... (Keep other providers as fallbacks/options)

// AI Provider Manager
export class AIProviderManager {
  private currentProvider: AIProvider;
  private providers: AIProvider[];

  constructor() {
    this.providers = [localWebLLMProvider]; // Set WebLLM as the main provider
    this.currentProvider = localWebLLMProvider; // Default to WebLLM
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
      return await this.currentProvider.generateResponse(messages, userContext);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return {
        message: "Lo siento, ha ocurrido un error. Por favor intenta de nuevo.",
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const aiManager = new AIProviderManager();

