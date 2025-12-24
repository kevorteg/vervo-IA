
import { MLCEngine } from "@mlc-ai/web-llm";
import { supabase } from '@/integrations/supabase/client';
import { BibleService } from '@/services/BibleService';

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

const STATIC_KNOWLEDGE_BASE = [
  // UNICIDAD
  { q: "¿Dios es uno o tres?", a: "Dios es absoluta e indivisiblemente UNO. Deuteronomio 6:4 es claro: 'Jehová nuestro Dios, Jehová uno es'. No hay tres personas, sino un único Dios manifestado como Padre en la creación, Hijo en la redención y Espíritu Santo en la regeneración." },
  { q: "unicidad de dios", a: "La Unicidad enseña que Dios es uno solo, sin divisiones. Jesús es ese Dios único manifestado en carne (1 Timoteo 3:16). No es una 'segunda persona', es el Padre mismo habitando entre nosotros." },
  { q: "¿Por qué bautizarse en el nombre de Jesús?", a: "Porque es el único nombre para salvación (Hechos 4:12). Pedro ordenó en Hechos 2:38 bautizarse 'en el nombre de Jesucristo'. El mandato de Mateo 28:19 se cumple invocando el NOMBRE del Padre, Hijo y Espíritu Santo, que es Jesús." },
  // MISION JUVENIL
  { q: "¿Qué es Misión Juvenil?", a: "Somos jóvenes, líderes y profesionales cristianos comprometidos con llevar el mensaje de Jesucristo a colegios, universidades y entornos digitales. No somos un evento, somos una familia y una voz profética en el aula." },
  { q: "Historia de Misión Juvenil", a: "Comenzó en 2004 en la Univalle bajo un árbol de mango con 5 jóvenes. Luego se llamó 'Grace' y finalmente evolucionó a 'Misión Juvenil', expandiéndose a todo el distrito." },
  { q: "Misión Juvenil a un Click", a: "Es nuestro lema actual: llevar el evangelio más allá de los muros físicos, hasta cada pantalla, aula y corazón, usando la tecnología como puente." }
];

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
  private currentModel: string = 'Phi-3.5-mini-instruct-q4f16_1-MLC';
  private loadingState = false;

  constructor() {
    this.loadTrainingData();
  }

  // Cargar datos de entrenamiento locales y remotos (Supabase)
  public async loadTrainingData() {
    try {
      // 1. Cargar System Prompt Personalizado
      const { data: sysPromptData } = await supabase
        .from('entrenamiento')
        .select('respuesta')
        .eq('categoria', 'config_sys_prompt')
        .maybeSingle();

      let systemContent = `Eres Verbo IA, un asistente espiritual cristiano de Misión Juvenil creado con Aurora Celestial. 
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
          - Tienes acceso a una biblioteca espiritual con devocionales, sermones y estudios bíblicos`;

      if (sysPromptData && sysPromptData.respuesta) {
        console.log('✨ Personalidad personalizada cargada');
        systemContent = sysPromptData.respuesta;
      }

      this.trainingData = [
        {
          role: "system",
          content: systemContent
        },
        // Ejemplos base
        {
          role: "user",
          content: "¿Cómo puedo fortalecer mi fe?"
        },
        {
          role: "assistant",
          content: "¡Hermosa pregunta! 💫 La fe se fortalece de varias maneras preciosas: 1) Leyendo la Palabra de Dios diariamente 📖 - como dice en Romanos 10:17 'la fe viene por el oír, y el oír por la palabra de Dios', 2) Orando constantemente 🙏 - manteniendo esa conexión íntima con Papá Dios, 3) Congregándote con otros creyentes 👥 - el hierro se afila con hierro, 4) Sirviendo a los demás con amor ❤️ - cuando das, recibes bendición, y 5) Recordando las promesas de Dios en tu vida ✨. Recuerda que Él tiene planes de bien para ti (Jeremías 29:11). ¡Dios está contigo siempre, mi querido/a! 🌟"
        }
      ];

      // 2. Cargar datos de entrenamiento desde Supabase (Excluyendo config)
      const { data: supabaseData, error } = await supabase
        .from('entrenamiento')
        .select('pregunta, respuesta')
        .neq('categoria', 'config_sys_prompt') // Excluir prompt del sistema
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching Supabase training data:', error);
      } else if (supabaseData && supabaseData.length > 0) {
        console.log(`🧠 Cargando ${supabaseData.length} entradas de entrenamiento desde Supabase`);
        const remoteMessages = supabaseData.flatMap(entry => [
          { role: 'user' as const, content: entry.pregunta },
          { role: 'assistant' as const, content: entry.respuesta }
        ]);
        this.trainingData.push(...remoteMessages);
      }

      // 2. Cargar datos del localStorage (Legacy/Dev)
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
      // 3. Inyectar Base de Conocimiento Estática (Hardcoded Fallback)
      // Esto asegura que temas críticos (Unicidad, MJ) funcionen incluso sin internet/base de datos
      const staticMessages = STATIC_KNOWLEDGE_BASE.flatMap(entry => [
        { role: 'user' as const, content: entry.q },
        { role: 'assistant' as const, content: entry.a }
      ]);
      this.trainingData.push(...staticMessages);
      console.log(`📚 Inyectadas ${STATIC_KNOWLEDGE_BASE.length} entradas de conocimiento estático.`);

      // 4. Cargar biblioteca espiritual
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
    if (this.loadingState) {
      console.log('Ya se está inicializando Web-LLM...');
      return false;
    }

    this.loadingState = true;

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
      this.loadingState = false;

      console.log(`✅ Web-LLM inicializado exitosamente con ${this.currentModel}`);
      return true;
    } catch (error) {
      console.error('❌ Error inicializando Web-LLM:', error);
      this.isInitialized = false;
      this.loadingState = false;

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

        // --- INICIO LÓGICA RAG ---
        const lastUserMessageRaw = messages[messages.length - 1].content;

        // 0. Integración BIBLIA (API.Bible)
        // Detectar si el usuario pide un versículo específico (ej: "Juan 3:16")
        if (lastUserMessageRaw.length < 100 && /\b[1-3]?\s?[A-Za-zñáéíóú]+\s+\d+[:\.]\d+\b/i.test(lastUserMessageRaw)) {
          try {
            console.log("📖 Detectando posible cita bíblica...");
            const searchResults = await BibleService.search(lastUserMessageRaw);
            // El servicio devuelve data.data. Asumimos que tiene 'verses'.
            if (searchResults && searchResults.verses && searchResults.verses.length > 0) {
              const topVerse = searchResults.verses[0];
              const bibleContext = `\n[CONTEXTO BÍBLICO AUTOMÁTICO]\nFuente: API.Bible (RVR1909)\nCita: ${topVerse.reference}\nTexto: "${topVerse.text}"\n\nINSTRUCCIÓN: El usuario ha citado este versículo. Usa el Texto provisto para explicarlo o confirmarlo.`;

              console.log("✅ Contexto bíblico inyectado:", topVerse.reference);
              systemMessages.push({
                role: 'system',
                content: bibleContext
              });
            }
          } catch (e) {
            console.error("⚠️ Error consultando Biblia:", e);
          }
        }

        const lastUserMessage = lastUserMessageRaw.toLowerCase();
        let bestMatch = null;
        let maxOverlap = 0;

        const trainingPairs = [];
        for (let i = 0; i < this.trainingData.length; i++) {
          if (this.trainingData[i].role === 'user' && this.trainingData[i + 1]?.role === 'assistant') {
            trainingPairs.push({
              q: this.trainingData[i].content.toLowerCase(),
              a: this.trainingData[i + 1].content
            });
          }
        }

        // Buscar la mejor coincidencia
        for (const pair of trainingPairs) {
          const words = pair.q.split(' ').filter(w => w.length > 3);
          let overlap = 0;
          for (const word of words) {
            if (lastUserMessage.includes(word)) overlap++;
          }

          // Si coincide > 50% de las palabras clave O coincidencia exacta de frase
          if ((overlap > 0 && overlap >= words.length * 0.5) || lastUserMessage.includes(pair.q) || pair.q.includes(lastUserMessage)) {
            if (overlap > maxOverlap) {
              maxOverlap = overlap;
              bestMatch = pair;
            }
            // Si es coincidencia muy fuerte, nos quedamos con esta
            if (pair.q.includes(lastUserMessage) || lastUserMessage.includes(pair.q)) {
              bestMatch = pair;
              break;
            }
          }
        }

        if (bestMatch) {
          console.log(`💡 RAG Match: "${bestMatch.q}"`);
          const contextInstruction = `\n\n[INSTRUCCIÓN ESTRICTA]: El usuario pregunta sobre "${bestMatch.q}". \nTU RESPUESTA DEBE BASARSE EN ESTA INFORMACIÓN VERIFICADA: "${bestMatch.a}". \nPuedes adaptar el tono pero el CONTENIDO debe ser este.`;

          if (systemMessages.length > 0) {
            systemMessages[systemMessages.length - 1].content += contextInstruction;
          } else {
            systemMessages.push({ role: 'system', content: contextInstruction });
          }
        }
        // --- FIN LÓGICA RAG ---

        // Filter training examples (user/assistant files)
        // Cap at last 20 examples to prevent context overflow
        const trainingExamples = this.trainingData
          .filter(msg => msg.role !== 'system')
          .slice(-20);

        const fullMessages = [...systemMessages, ...trainingExamples, ...messages];

        console.log(`🤖 Generando con ${this.currentModel}...`);
        console.log(`📚 Contexto: ${systemMessages.length} sys + ${trainingExamples.length} ejemplos + ${messages.length} historial`);

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { message: "Error generating response", model: "Error" };
    }
  }

  // Sistema de respuestas por patrones mejorado como fallback (y ahora leector de JSON)
  private generatePatternResponse(messages: ChatMessage[], userContext: UserContext): AIResponse {
    const lastMessage = messages[messages.length - 1];
    const userMessage = lastMessage.content?.toLowerCase() || '';
    const userName = userContext.name ? userContext.name : '';

    // 1. BÚSQUEDA DIRECTA EN DATOS DE ENTRENAMIENTO (RAG LITE)
    // Esto permite que el bot responda con el JSON incluso si el motor AI está apagado.
    for (let i = 0; i < this.trainingData.length; i++) {
      if (this.trainingData[i].role === 'user' && this.trainingData[i + 1]?.role === 'assistant') {
        const q = this.trainingData[i].content.toLowerCase();
        const a = this.trainingData[i + 1].content;

        // Coincidencia exacta o muy cercana
        if (userMessage.includes(q) || q.includes(userMessage)) {
          console.log(`💡 Pattern Match (JSON): "${q}"`);
          return {
            message: a,
            model: "ChatMJ-RAG-Lite"
          };
        }

        // Coincidencia por palabras clave (Fuzzy)
        const words = q.split(' ').filter(w => w.length > 3);
        let overlap = 0;
        for (const word of words) {
          if (userMessage.includes(word)) overlap++;
        }
        if (overlap >= words.length * 0.6) { // 60% de coincidencia
          console.log(`💡 Pattern Match Fuzzy (JSON): "${q}"`);
          return {
            message: a,
            model: "ChatMJ-RAG-Lite"
          };
        }
      }
    }

    let response = "";

    // Patrones específicos para biblioteca espiritual backup
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // Importar JSON masivo (Lógica movida desde la UI)
  async importJSONData(jsonText: string): Promise<{ success: boolean; count: number; message?: string }> {
    try {
      if (!jsonText.trim()) return { success: false, count: 0, message: "El texto está vacío." };

      let parsed;
      try {
        parsed = JSON.parse(jsonText);
      } catch (e) {
        return { success: false, count: 0, message: "Sintaxis JSON inválida." };
      }

      let dataToProcess = [];

      if (Array.isArray(parsed)) {
        dataToProcess = parsed;
      } else if (parsed.data && Array.isArray(parsed.data)) {
        dataToProcess = parsed.data;
      } else {
        dataToProcess = [parsed];
      }

      const validData = dataToProcess.filter((item: any) =>
        (item.question || item.pregunta || item.usuario) && (item.answer || item.respuesta)
      ).map((item: any) => ({
        pregunta: item.question || item.pregunta || item.usuario,
        respuesta: item.answer || item.respuesta,
        categoria: item.category || item.categoria || 'general',
        libro: item.libro || item.book || null,
        version: item.version || null
      }));

      if (validData.length === 0) {
        return { success: false, count: 0, message: "No se encontraron entradas válidas (requiere [question|pregunta|usuario] y [answer|respuesta])." };
      }

      // Verificar duplicados
      const { data: existingData } = await supabase
        .from('entrenamiento')
        .select('pregunta');

      const existingQuestions = new Set(existingData?.map(e => e.pregunta.toLowerCase().trim()) || []);

      const uniqueData = validData.filter(item =>
        !existingQuestions.has(item.pregunta.toLowerCase().trim())
      );

      if (uniqueData.length === 0) {
        return { success: true, count: 0, message: "Todas las entradas ya existían en la base de datos (0 duplicados importados)." };
      }

      // Guardar en Supabase solo las únicas
      const { error } = await supabase.from('entrenamiento').insert(uniqueData);

      if (error) {
        console.error("Supabase Error:", error);
        return { success: false, count: 0, message: error.message };
      }

      // Recargar datos en memoria
      await this.loadTrainingData();

      const skipped = validData.length - uniqueData.length;
      return {
        success: true,
        count: uniqueData.length,
        message: `Importadas ${uniqueData.length} nuevas entradas.${skipped > 0 ? ` (Se omitieron ${skipped} duplicadas)` : ''}`
      };

    } catch (error) {
      console.error('Error in importJSONData:', error);
      return { success: false, count: 0, message: "Error desconocido al procesar." };
    }
  }

  // Verificar si está disponible
  isAvailable(): boolean {
    return this.isInitialized;
  }

  // Verificar si está cargando
  isLoading(): boolean {
    return this.loadingState;
  }

  // Obtener estadísticas de entrenamiento
  getTrainingStats() {
    return {
      totalMessages: this.trainingData.length,
      systemMessages: this.trainingData.filter(m => m.role === 'system').length,
      userMessages: this.trainingData.filter(m => m.role === 'user').length,
      assistantMessages: this.trainingData.filter(m => m.role === 'assistant').length,
      isInitialized: this.isInitialized,
      isLoading: this.loadingState,
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
