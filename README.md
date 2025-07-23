
# ✨ ChatMJ – Asistente Cristiano de Misión Juvenil

Bienvenido a **ChatMJ**, una IA cristocéntrica entrenada para acompañar, evangelizar y discipular jóvenes como tú, con estilo, amor y verdad bíblica. Inspirado en ChatGPT, pero con el alma de **Misión Juvenil**, este chatbot está diseñado para hablar al corazón.

---

## 🌟 ¿Qué es ChatMJ?

ChatMJ es más que un chatbot. Es un **compañero espiritual** creado con React, conectado a modelos de IA locales usando Web-LLM. Conversa, enseña y guía con empatía, versículos bíblicos y sabiduría doctrinal.

### 🚀 Características principales:
- **Modo Invitado**: Comienza a chatear inmediatamente sin registro
- **IA Local**: Usa Web-LLM para procesamiento local y privacidad
- **Entrenamiento Personalizado**: Agrega tus propios datos de entrenamiento
- **Interfaz Familiar**: Diseño similar a ChatGPT pero con toque cristiano
- **Respuestas Contextuales**: Basadas en principios bíblicos y juventud cristiana

---

## 🧰 Tecnologías usadas

- 🧠 **React + Vite** - Framework principal
- 🌐 **Supabase** - Base de datos + Autenticación  
- 🎨 **TailwindCSS** - Diseño y estilos
- 🤖 **Web-LLM** - Modelos de IA locales en el navegador
- ⚙️ **API flexible** - Compatible con OpenAI, DeepSeek, Claude...
- 🔐 **Modo Invitado** - Sin necesidad de registro inicial

---

## 🚀 Cómo ejecutar localmente

```bash
# Clona el repositorio
git clone https://github.com/kevorteg/ChatMjd5
cd ChatMjd5

# Instala dependencias
npm install

# Crea un archivo .env con tus claves
cp .env.example .env
# Edita .env con tus credenciales de Supabase

# Ejecuta en modo desarrollo
npm run dev
```

### 📋 Variables de entorno requeridas:
```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
OPENAI_API_KEY=tu_openai_key (opcional)
```

---

## 🤖 Web-LLM: IA Local en tu Navegador

ChatMJ utiliza **Web-LLM** para ejecutar modelos de IA directamente en tu navegador, garantizando privacidad y velocidad.

### 🔧 Configuración de Web-LLM

#### Modelos disponibles:
- **Llama-3.2-1B-Instruct** (Recomendado para ChatMJ)
- **Llama-3.2-3B-Instruct** (Más potente, requiere más memoria)
- **Phi-3.5-mini-instruct** (Alternativa ligera)

#### Inicialización automática:
```typescript
// El sistema intenta inicializar Web-LLM automáticamente
// Si falla, usa un sistema de patrones como fallback
await webLLMManager.initialize();
```

### 💾 Requisitos del sistema:
- **RAM**: Mínimo 4GB, recomendado 8GB+
- **Navegador**: Chrome/Edge con WebGPU habilitado
- **Conexión**: Solo para descarga inicial del modelo

---

## 📚 Sistema de Entrenamiento Personalizado

ChatMJ incluye un sistema robusto para entrenar la IA con datos específicos de Misión Juvenil.

### 🎯 Cómo agregar datos de entrenamiento:

#### Opción 1: Interfaz Web
1. Ve a **Configuración** > **Entrenamiento de ChatMJ**
2. Agrega preguntas y respuestas personalizadas
3. Selecciona la categoría apropiada
4. Guarda los datos

#### Opción 2: Archivo JSON
```json
[
  {
    "id": "1",
    "question": "¿Cómo puedo orar por los jóvenes?",
    "answer": "La oración por los jóvenes es fundamental... [respuesta completa]",
    "category": "oracion"
  }
]
```

### 📝 Categorías de entrenamiento:
- `general` - Preguntas generales sobre fe
- `oracion` - Temas de oración y vida espiritual
- `devocional` - Lecturas bíblicas y devocionales
- `fe` - Fortalecimiento de la fe
- `crisis` - Ayuda en momentos difíciles
- `evangelismo` - Testimonio y evangelización
- `biblia` - Estudio bíblico
- `juventud` - Temas específicos de jóvenes

### 🔄 Proceso de entrenamiento:
1. **Recolección**: Agrega datos específicos de Misión Juvenil
2. **Formateo**: El sistema convierte a formato Web-LLM
3. **Integración**: Se integra con el modelo base
4. **Validación**: Prueba las respuestas generadas

---

## 🎨 Personalización del Estilo "Aurora Celestial"

ChatMJ está diseñado con el estilo **Aurora Celestial**:

### 📖 Características del estilo:
- **Cristocéntrico**: Jesús es el centro de toda conversación
- **Poético**: Lenguaje hermoso y emotivo
- **Empático**: Comprende y acompaña en el dolor
- **Bíblico**: Fundamentado en las Escrituras
- **Evangelístico**: Siempre apunta a Cristo
- **Juvenil**: Lenguaje apropiado para jóvenes



## 🔧 Configuración Avanzada

### 🌐 Proveedores de IA múltiples:
```typescript
// Configurar diferentes proveedores
aiManager.setProvider('WebLLM');     // Local
aiManager.setProvider('OpenAI');     // Nube
aiManager.setProvider('DeepSeek');   // Alternativo
```

### 🎛️ Parámetros de generación:
```typescript
const response = await engine.chat.completions.create({
  messages: messages,
  temperature: 0.7,        // Creatividad
  max_tokens: 500,         // Longitud máxima
  top_p: 0.9,             // Diversidad
});
```

---

## 📊 Monitoreo y Analytics

### 📈 Métricas disponibles:
- Conversaciones por día
- Temas más consultados  
- Eficacia de respuestas
- Uso de versículos bíblicos
- Satisfacción del usuario

### 🔍 Debug y logs:
```javascript
// Ver estadísticas de entrenamiento
console.log(webLLMManager.getTrainingStats());

// Verificar estado de Web-LLM
console.log('Web-LLM disponible:', webLLMManager.isAvailable());
```

---

## 🚢 Despliegue en Producción

### 🌐 Opciones de hosting:
1. **Vercel** (Recomendado)
2. **Netlify** 
3. **GitHub Pages**
4. **Servidor propio**

### ⚙️ Variables de producción:
```env
NODE_ENV=production
VITE_SUPABASE_URL=tu_url_produccion
VITE_SUPABASE_ANON_KEY=tu_key_produccion
```

---

## 🤝 Contribuir al Proyecto

### 🎯 Áreas de contribución:
- **Datos de entrenamiento** - Agrega más contenido cristiano
- **Mejoras de UI** - Perfecciona la experiencia de usuario  
- **Optimización de IA** - Mejora los modelos y respuestas
- **Documentación** - Ayuda a otros desarrolladores

### 📋 Proceso:
1. Fork del repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'Agrega nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`  
5. Abre un Pull Request

---

## 📞 Soporte y Comunidad

### 💬 Canales de ayuda:
- **Issues**: Reporta bugs en GitHub
- **Discussions**: Comparte ideas y sugerencias
- **Email**: contacto@misionjuvenil.org
- **WhatsApp**: Botón de "Contactar Líder" en la app

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ve el archivo [LICENSE](LICENSE) para más detalles.

**Desarrollado con ❤️ para la juventud cristiana**

---

*"Ninguno tenga en poco tu juventud" - 1 Timoteo 4:12*
