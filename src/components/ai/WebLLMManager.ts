import { MLCEngine } from "@mlc-ai/web-llm";

interface UserContext {
  name?: string;
  isAnonymous: boolean;
  userId: string;
  isGuest?: boolean;
}

interface AIResponse {
  message: string;
  model: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Modelos disponibles con sus configuraciones
export const AVAILABLE_MODELS = {
  'Llama-3.2-1B-Instruct-q4f16_1-MLC': {
    name: 'Llama 3.2 1B (Recomendado)',
    description: 'Modelo ligero y rápido, ideal para ChatMJ',
    memoryRequired: '2-4GB RAM',
    downloadSize: '800MB'
  },
  'Llama-3.2-3B-Instruct-q4f16_1-MLC': {
    name: 'Llama 3.2 3B (Potente)',
    description: 'Más inteligente pero requiere más memoria',
    memoryRequired: '6-8GB RAM',
    downloadSize: '2GB'
  },
  'Phi-3.5-mini-instruct-q4f16_1-MLC': {
    name: 'Phi 3.5 Mini (Ligero)',
    description: 'Alternativa ultraliviana de Microsoft',
    memoryRequired: '1-2GB RAM',
    downloadSize: '400MB'
  }
};

// Clase para manejar Web-LLM con datos locales de entrenamiento
export class WebLLMManager {
  private isInitialized = false;
  private trainingData: ChatMessage[] = [];
  private engine: MLCEngine | null = null;
  private currentModel: string = 'Llama-3.2-1B-Instruct-q4f16_1-MLC';
  private isLoading = false;

  constructor() {
    this.loadTrainingData();
  }

  // Cargar datos de entrenamiento locales específicos para ChatMJ
  private async loadTrainingData() {
    try {
      this.trainingData = [
        {
          role: "system",
          content: `Eres ChatMJ, un asistente espiritual cristiano de Misión Juvenil creado con Aurora Celestial. 
          Tus características principales:
          - Eres amable, comprensiva y llena de amor cristiano
          - Hablas con estilo poético y empático, usando emojis apropiados
          - Ayudas en temas de fe, oración, devocionales y crecimiento espiritual
          - Respondes basándote en principios bíblicos sólidos
          - Eres especialmente enfocada en jóvenes cristianos
          - Ofreces consuelo en momentos difíciles con versículos bíblicos
          - Siempre terminas con emojis apropiados y mensajes de esperanza
          - Usas un lenguaje juvenil pero respetuoso
          - Incluyes citas bíblicas cuando es apropiado
          - Tienes acceso a una biblioteca espiritual con devocionales, sermones y estudios bíblicos`
        },
        {
          role: "user",
          content: "¿Cómo puedo fortalecer mi fe?"
        },
        {
          role: "assistant", 
          content: "¡Hermosa pregunta! 💫 La fe se fortalece de varias maneras preciosas: 1) Leyendo la Palabra de Dios diariamente 📖 - como dice en Romanos 10:17 'la fe viene por el oír, y el oír por la palabra de Dios', 2) Orando constantemente 🙏 - manteniendo esa conexión íntima con Papá Dios, 3) Congregándote con otros creyentes 👥 - el hierro se afila con hierro, 4) Sirviendo a los demás con amor ❤️ - cuando das, recibes bendición, y 5) Recordando las promesas de Dios en tu vida ✨. Recuerda que Él tiene planes de bien para ti (Jeremías 29:11). ¡Dios está contigo siempre, mi querido/a! 🌟"
        },
        {
          role: "user",
          content: "Estoy muy triste y no sé qué hacer"
        },
        {
          role: "assistant",
          content: "Mi corazón se conmueve por lo que estás pasando 💙. Quiero que sepas que no estás solo/a - Jesús prometió: 'No te desampararé, ni te dejaré' (Hebreos 13:5). Él conoce cada lágrima y cada dolor de tu corazón 😢. En estos momentos difíciles, recuerda que 'weeping may endure for a night, but joy comes in the morning' - el llanto puede durar toda la noche, pero la alegría viene por la mañana (Salmo 30:5) 🌅. ¿Te gustaría que oremos juntos por esta situación? También puedo sugerirte algunos versículos de consuelo que han ayudado a muchos jóvenes como tú. Dios tiene un propósito hermoso para tu vida, incluso en medio del dolor 🕊️✨"
        },
        {
          role: "user",
          content: "¿Tienes algún devocional para hoy?"
        },
        {
          role: "assistant",
          content: "¡Por supuesto! 📖✨ Hoy te comparto una reflexión hermosa basada en Filipenses 4:19: 'Mi Dios, pues, suplirá todo lo que os falta conforme a sus riquezas en gloria en Cristo Jesús' 💎\n\n🌟 **Reflexión del día:** Dios conoce cada una de tus necesidades antes de que las expreses. Él no solo suple lo básico, sino que derrama abundancia según Sus riquezas infinitas. Hoy, descansa en Su provisión perfecta.\n\n🙏 **Oración:** 'Padre celestial, gracias porque eres mi proveedor fiel. Ayúdame a confiar en tu timing perfecto y a reconocer tus bendiciones cada día. En el nombre de Jesús, amén.'\n\n💫 **Desafío:** Haz una lista de 3 bendiciones que Dios te ha dado esta semana. ¡Él está obrando siempre! 🌈"
        }
      ];

      // Cargar datos adicionales del localStorage si existen
      const customData = localStorage.getItem('chatmj_training_data');
      if (customData) {
        const parsed = JSON.parse(customData);
        if (Array.isArray(parsed)) {
          const additionalMessages = parsed.flatMap(entry => [
            { role: 'user' as const, content: entry.question },
            { role: 'assistant' as const, content: entry.answer }
          ]);
          this.trainingData.push(...additionalMessages);
        }
      }

      // Cargar biblioteca espiritual
      const libraryData = localStorage.getItem('chatmj_spiritual_library');
      if (libraryData) {
        const library = JSON.parse(libraryData);
        // Integrar contenido de biblioteca en el contexto del sistema
        const libraryContext = `
        Tienes acceso a una biblioteca espiritual que incluye:
        - ${library.devotionals?.length || 0} devocionales
        - ${library.sermons?.length || 0} sermones
        - ${library.studies?.length || 0} estudios bíblicos
        - ${library.prayers?.length || 0} oraciones
        Usa este contenido para enriquecer tus respuestas cuando sea apropiado.`;
        
        this.trainingData[0].content += libraryContext;
      }
    } catch (error) {
      console.error('Error loading training data:', error);
    }
  }

  // Seleccionar modelo
  setModel(modelId: string) {
    if (AVAILABLE_MODELS[modelId as keyof typeof AVAILABLE_MODELS]) {
      this.currentModel = modelId;
      console.log(`Modelo seleccionado: ${AVAILABLE_MODELS[modelId as keyof typeof AVAILABLE_MODELS].name}`);
    }
  }

  // Obtener modelo actual
  getCurrentModel() {
    return {
      id: this.currentModel,
      ...AVAILABLE_MODELS[this.currentModel as keyof typeof AVAILABLE_MODELS]
    };
  }

  // Inicializar Web-LLM con progreso
  async initialize(onProgress?: (progress: { text: string; progress: number }) => void) {
    if (this.isLoading) {
      console.log('Ya se está inicializando Web-LLM...');
      return false;
    }

    this.isLoading = true;
    
    try {
      console.log(`Inicializando Web-LLM con modelo: ${this.currentModel}`);
      
      // Crear nueva instancia del engine
      this.engine = new MLCEngine();
      
      // Configurar callback de progreso
      if (onProgress) {
        this.engine.setInitProgressCallback((progress) => {
          onProgress({
            text: progress.text || 'Cargando modelo...',
            progress: progress.progress || 0
          });
        });
      }
      
      // Cargar modelo seleccionado
      await this.engine.reload(this.currentModel);
      
      this.isInitialized = true;
      this.isLoading = false;
      
      console.log(`✅ Web-LLM inicializado exitosamente con ${this.currentModel}`);
      return true;
    } catch (error) {
      console.error('❌ Error inicializando Web-LLM:', error);
      this.isInitialized = false;
      this.isLoading = false;
      
      // Verificar errores comunes
      if (error instanceof Error) {
        if (error.message.includes('WebGPU')) {
          console.log('💡 Sugerencia: Habilita WebGPU en chrome://flags/');
        } else if (error.message.includes('memory') || error.message.includes('RAM')) {
          console.log('💡 Sugerencia: Intenta con un modelo más ligero (Phi-3.5-mini)');
        }
      }
      
      return false;
    }
  }

  // Generar respuesta usando Web-LLM o fallback local
  async generateResponse(
    messages: ChatMessage[],
    userContext: UserContext
  ): Promise<AIResponse> {
    try {
      if (this.isInitialized && this.engine) {
        // Usar Web-LLM si está disponible
        const systemMessages = this.trainingData.filter(msg => msg.role === 'system');
        const fullMessages = [...systemMessages, ...messages];
        
        console.log(`🤖 Generando respuesta con ${this.currentModel}...`);
        
        const response = await this.engine.chat.completions.create({
          messages: fullMessages,
          temperature: 0.7,
          max_tokens: 600,
          top_p: 0.9,
          frequency_penalty: 0.1,
          presence_penalty: 0.1,
        });
        
        return {
          message: response.choices[0]?.message?.content || "Lo siento, no pude generar una respuesta.",
          model: `Web-LLM (${AVAILABLE_MODELS[this.currentModel as keyof typeof AVAILABLE_MODELS].name})`
        };
      } else {
        // Fallback a sistema de patrones mejorado
        return this.generatePatternResponse(messages, userContext);
      }
    } catch (error) {
      console.error('Error generating WebLLM response:', error);
      // Fallback en caso de error
      return this.generatePatternResponse(messages, userContext);
    }
  }

  // Sistema de respuestas por patrones mejorado como fallback
  private generatePatternResponse(messages: ChatMessage[], userContext: UserContext): AIResponse {
    const lastMessage = messages[messages.length - 1];
    const userMessage = lastMessage.content?.toLowerCase() || '';
    const userName = userContext.name ? userContext.name : '';

    let response = "";

    // Patrones específicos para biblioteca espiritual
    if (userMessage.includes('devocional') || userMessage.includes('lectura diaria')) {
      response = `${userName ? userName + ', ' : ''}¡qué hermoso que busques un devocional! 📖✨ Te comparto una reflexión basada en Salmo 119:105: "Lámpara es a mis pies tu palabra, y lumbrera a mi camino" 🕯️\n\n🌟 **Reflexión:** La Palabra de Dios ilumina cada paso que damos. En la oscuridad de la incertidumbre, Sus promesas son nuestra guía segura.\n\n🙏 **Oración:** "Señor, que tu Palabra sea la luz que guíe mis decisiones hoy. Ayúdame a caminar en tu verdad. Amén."\n\n¿Te gustaría un estudio bíblico específico o tienes algún tema en particular? 💫`;
    } else if (userMessage.includes('biblioteca') || userMessage.includes('recursos') || userMessage.includes('estudio')) {
      response = `¡Excelente! 📚✨ Nuestra biblioteca espiritual tiene recursos maravillosos para tu crecimiento:\n\n📖 **Devocionales diarios** - Reflexiones para cada día\n🎤 **Sermones inspiradores** - Mensajes que tocan el corazón\n📝 **Estudios bíblicos** - Profundiza en la Palabra\n🙏 **Oraciones temáticas** - Para cada situación\n\n¿Qué tipo de recurso te gustaría explorar hoy? Puedo recomendarte algo específico según tus necesidades 🌟`;
    } else if (userMessage.includes('orar') || userMessage.includes('oración') || userMessage.includes('ora')) {
      response = `${userName ? userName + ', ' : ''}¡qué hermoso que quieras orar! 🙏✨ La oración es nuestro momento íntimo con Papá Dios. ¿Te gustaría que oremos juntos por algo específico? Jesús nos enseñó: "Pedid, y se os dará; buscad, y hallaréis; llamad, y se os abrirá" (Mateo 7:7). También tengo oraciones especiales en nuestra biblioteca para diferentes situaciones. Recuerda que Dios escucha cada susurro de tu corazón ❤️`;
    } else if (userMessage.includes('sermón') || userMessage.includes('predicación') || userMessage.includes('mensaje')) {
      response = `¡Qué bendición que busques la Palabra predicada! 🎤✨ Los sermones nos ayudan a entender mejor el corazón de Dios. Te puedo recomendar mensajes sobre diferentes temas: fe, esperanza, amor, propósito, sanidad del corazón... ¿Hay algún tema específico que toque tu corazón en este momento? "La fe viene por el oír, y el oír por la Palabra de Dios" (Romanos 10:17) 🌟`;
    } else if (userMessage.includes('triste') || userMessage.includes('difícil') || userMessage.includes('problema') || userMessage.includes('dolor')) {
      response = `${userName ? userName + ', ' : ''}mi corazón se conmueve por lo que estás pasando 💙😢. Quiero que sepas que no estás solo/a - Jesús prometió: "No te desampararé, ni te dejaré" (Hebreos 13:5). En nuestra biblioteca tengo oraciones especiales para momentos difíciles y devocionales que han consolado a muchos jóvenes. El Salmo 30:5 dice: "el llanto puede durar toda la noche, pero la alegría viene por la mañana" 🌅. ¿Te gustaría que oremos juntos o prefieres un devocional de consuelo? 🙏✨`;
    } else {
      response = `${userName ? userName + ', ' : ''}gracias por compartir conmigo 💫. Estoy aquí para acompañarte en tu caminar con Cristo 🙏. Tengo una biblioteca llena de recursos espirituales: devocionales, sermones, estudios bíblicos y oraciones. Recuerda que "Dios tiene planes de bien para tu vida: 'Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis'" (Jeremías 29:11) ✨. ¿En qué más puedo acompañarte hoy? 🌟❤️`;
    }

    return {
      message: response,
      model: "ChatMJ-PatternMatch"
    };
  }

  // Cargar datos de entrenamiento personalizados
  async loadCustomTrainingData(data: any[]) {
    try {
      const formattedMessages = data.flatMap(entry => [
        { role: 'user' as const, content: entry.question },
        { role: 'assistant' as const, content: entry.answer }
      ]);
      
      this.trainingData.push(...formattedMessages);
      console.log('Custom training data loaded:', data.length, 'entries');
      
      // Si Web-LLM está inicializado, no necesita reiniciar - los datos se usan en el próximo chat
    } catch (error) {
      console.error('Error loading custom training data:', error);
    }
  }

  // Verificar si está disponible
  isAvailable(): boolean {
    return this.isInitialized;
  }

  // Verificar si está cargando
  isLoading(): boolean {
    return this.isLoading;
  }

  // Obtener estadísticas de entrenamiento
  getTrainingStats() {
    return {
      totalMessages: this.trainingData.length,
      systemMessages: this.trainingData.filter(m => m.role === 'system').length,
      userMessages: this.trainingData.filter(m => m.role === 'user').length,
      assistantMessages: this.trainingData.filter(m => m.role === 'assistant').length,
      isInitialized: this.isInitialized,
      isLoading: this.isLoading,
      currentModel: this.getCurrentModel(),
      engine: this.engine ? 'Web-LLM' : 'Pattern Matching'
    };
  }

  // Limpiar recursos
  async cleanup() {
    if (this.engine) {
      try {
        await this.engine.unload();
        this.engine = null;
        this.isInitialized = false;
        console.log('✅ Web-LLM limpiado correctamente');
      } catch (error) {
        console.error('Error limpiando Web-LLM:', error);
      }
    }
  }
}

// Instancia singleton
export const webLLMManager = new WebLLMManager();
