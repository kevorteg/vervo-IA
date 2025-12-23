# ✨ Verbo IA - Tu Compañera Espiritual

**Verbo IA** (anteriormente ChatMJ) es una plataforma de inteligencia artificial cristiana diseñada para acompañar, evangelizar y discipular a los jóvenes de **Misión Juvenil**. 

A diferencia de otros chatbots, Verbo IA está integrada con una **Biblioteca Espiritual**, un **Diario de Oración** y capacidades de **Voz (TTS/STT)**, todo funcionando con privacidad y rapidez gracias a la tecnología de IA local.

---

## 🚀 Características Principales

### ✝️ Espiritualidad y Discipulado
- **Conversaciones con Propósito**: Un asistente entrenado para responder desde una cosmovisión bíblica.
- **Biblioteca Espiritual**: Acceso directo a devocionales, libros y sermones dentro de la app.
- **Diario de Oración**: Un espacio privado y persistente para escribir tus peticiones y agradecimientos.

### 🤖 Tecnología Avanzada
- **IA Local (Web-LLM)**: El modelo de inteligencia artificial se ejecuta directamente en tu navegador. Tus conversaciones no viajan a servidores externos de IA.
- **Modo de Voz**: Habla con Verbo IA y escucha sus respuestas con una voz natural (Text-to-Speech y Speech-to-Text).
- **Persistencia Inteligente**: Tus chats se guardan en la nube (Supabase) si te registras, o puedes usarlos temporalmente en **Modo Invitado**.

### 🛡️ Administración y Seguridad
- **Roles de Usuario**: Diferenciación entre usuarios normales, invitados y administradores.
- **Panel de Control (Admin)**: Interfaz exclusiva para gestionar el entrenamiento de la IA y moderar conversaciones.
- **Edición de Perfil**: Personaliza tu foto de perfil y gestiona tu cuenta.
- **Eliminación de Datos**: Control total para borrar tus conversaciones cuando lo desees.

---

## 🛠️ Instalación y Configuración Local

Si deseas correr este proyecto en tu máquina local, sigue estos pasos:

### 1. Prerrequisitos
- **Node.js** (v18 o superior)
- **Git**

### 2. Clonar el repositorio
```bash
git clone https://github.com/kevorteg/vervo-IA.git
cd vervo-IA
```

### 3. Instalar dependencias
```bash
npm install
```

### 4. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto con tus credenciales de Supabase:
```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

### 5. Iniciar el servidor de desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:8080`.

---

## � Gestión de Administradores

Para habilitar las funciones de administrador (Panel de Control, Entrenamiento), debes asignar el rol en la base de datos de Supabase.

1. Ve a tu proyecto en Supabase > **SQL Editor**.
2. Ejecuta el siguiente comando, reemplazando el email:
   ```sql
   UPDATE public.perfiles
   SET rol = 'admin'
   WHERE id = (SELECT id FROM auth.users WHERE email = 'usuario@ejemplo.com');
   ```
3. Recarga la aplicación. Verás la etiqueta **Admin** en tu perfil y nuevas opciones en el menú lateral.

---

## 📂 Estructura del Proyecto

- `/src/components`: Componentes reutilizables (Chat, Sidebar, Auth).
- `/src/components/admin`: Panel de administración.
- `/src/components/ai`: Lógica de IA (Web-LLM) y gestión de entrenamiento.
- `/src/pages`: Rutas principales de la aplicación.
- `/src/integrations/supabase`: Cliente y configuración de base de datos.

---

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Por favor, abre un "Issue" o envía un "Pull Request" si deseas mejorar Verbo IA.

---

*Desarrollado con ❤️ para la gloria de Dios y la juventud cristiana.*

---

## 🔄 Actualización Reciente (v2.0) - Diciembre 2025

### 🧠 Nuevo Sistema de Entrenamiento
- **Editor JSON Masivo**: Nueva herramienta en el panel admin para cargar cientos de preguntas/respuestas simultáneamente con pegado directo.
- **Formato Estándar**: Soporta formato `[{"pregunta": "...", "respuesta": "..."}]` para fácil integración.
- **Base de Conocimiento Instantánea**: Los datos cargados se usan inmediatamente sin re-entrenamiento lento.

### ⚡ Motor de IA Mejorado (RAG Lite)
- **Búsqueda Estricta (Strict-RAG)**: El bot ahora detecta si la pregunta del usuario coincide con el material de entrenamiento y **prioriza** esa respuesta sobre la generación creativa.
- **Funcionamiento Offline**: Incluso si el "cerebro" pesado (Web-LLM) no ha cargado, el bot responde instantáneamente usando la base de datos JSON local.
- **Corrección de "Modo Demo"**: Se eliminó un proveedor simulado que daba respuestas genéricas; ahora el chat está conectado 100% al motor real.

### 🎨 Mejoras de Interfaz (UI/UX)
- **Modo Silencioso**: Se eliminó la voz automática (Text-to-Speech) a petición de los usuarios para una experiencia más fluida y menos robótica.
- **Estilo Admin Renovado**: Pestañas de colores vibrantes para mejor visibilidad y editor de código estilo "Matrix" (`bg-slate-900` + `text-emerald-400`).
- **Feedback Visual**: Mejores alertas y notificaciones al cargar datos.
