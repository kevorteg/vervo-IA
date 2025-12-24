# ✨ Verbo IA - Tu Compañera Espiritual

**Verbo IA** (anteriormente ChatMJ) es una plataforma de inteligencia artificial cristiana diseñada para acompañar, evangelizar y discipular a los jóvenes de **Misión Juvenil**. 

A diferencia de otros chatbots, Verbo IA está integrada con una **Biblioteca Espiritual**, un **Diario de Oración** y capacidades de **Voz (TTS/STT)**, todo funcionando con privacidad y rapidez gracias a la tecnología de IA local.

---

## 🚀 Características Principales

### ✝️ Espiritualidad y Discipulado
- **Conversaciones con Propósito**: Un asistente entrenado para responder desde una cosmovisión bíblica.
- **Biblioteca Espiritual**: Acceso directo a devocionales, libros y sermones dentro de la app.
- **Diario de Oración (Privado)**: Un espacio privado y persistente para escribir tus peticiones y agradecimientos.

### 📖 Biblia Integrada & Inteligente (Nuevo v2.5)
- **Lector Bíblico**: Sección `/biblia` para leer las escrituras (Reina Valera 1909) con diseño limpio.
- **Búsqueda Inteligente**: La IA detecta cuando citas un versículo (ej: "Juan 3:16") y **busca el texto real** vía API para responderte con precisión absoluta (RAG).
- **Auto-Corrección**: No importa si escribes "Salmo" o "Salmos", el sistema te entiende.
- **Versículo del Día**: Una promesa diaria para inspirarte cada vez que entras.

### 🤖 Tecnología Avanzada
- **IA Local (Web-LLM)**: El modelo de inteligencia artificial se ejecuta directamente en tu navegador. Tus conversaciones no viajan a servidores externos de IA.
- **Modo de Voz**: Habla con Verbo IA y escucha sus respuestas con una voz natural (Text-to-Speech y Speech-to-Text).
- **Persistencia Inteligente**: Tus chats se guardan en la nube (Supabase) si te registras, o puedes usarlos temporalmente en **Modo Invitado**.

### 🛡️ Administración y Seguridad
- **Roles de Usuario**: Diferenciación entre usuarios normales, invitados y administradores.
- **Panel de Control (Admin)**: 
    - Entrena a la IA con nuevos datos JSON o editando conversaciones reales.
    - Gestiona usuarios.
    - Edita la "Personalidad" del bot.
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

## 👑 Gestión de Administradores

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
- `/src/components/bible`: Lector bíblico y servicios.
- `/src/components/ai`: Lógica de IA (Web-LLM) y gestión de entrenamiento.
- `/src/pages`: Rutas principales de la aplicación.
- `/src/services`: Servicios externos (API.Bible).
- `/src/integrations/supabase`: Cliente y configuración de base de datos.

---

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Por favor, abre un "Issue" o envía un "Pull Request" si deseas mejorar Verbo IA.

---

*Desarrollado con ❤️ para la gloria de Dios y la juventud cristiana.*
