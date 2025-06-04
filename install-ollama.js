/**
 * Script para instalar y configurar Ollama
 * Este script ayuda a descargar e instalar Ollama para ejecutar modelos de IA localmente
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const os = require('os');

// Configuración
const CONFIG = {
  // URL de descarga de Ollama para Windows
  downloadUrl: 'https://ollama.com/download/ollama-windows-amd64.zip',
  // Directorio de instalación
  installDir: path.join(os.homedir(), 'ollama'),
  // Modelos a precargar
  models: [
    'phi',      // Microsoft Phi-2 (2.7B parámetros)
    'mistral',   // Mistral 7B
    'llama2'     // Meta Llama 2
  ]
};

/**
 * Descarga un archivo desde una URL
 * @param {string} url - URL del archivo a descargar
 * @param {string} destPath - Ruta de destino
 * @returns {Promise<void>}
 */
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    console.log(`Descargando desde ${url} a ${destPath}...`);
    
    const file = fs.createWriteStream(destPath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Error al descargar: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log('Descarga completada');
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {}); // Eliminar archivo parcial
      reject(err);
    });
  });
}

/**
 * Ejecuta un comando del sistema
 * @param {string} command - Comando a ejecutar
 * @returns {Promise<string>} - Salida del comando
 */
function runCommand(command) {
  return new Promise((resolve, reject) => {
    console.log(`Ejecutando: ${command}`);
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error al ejecutar comando: ${error.message}`);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.warn(`Advertencia: ${stderr}`);
      }
      
      console.log(`Salida: ${stdout}`);
      resolve(stdout);
    });
  });
}

/**
 * Instala Ollama
 * @returns {Promise<void>}
 */
async function installOllama() {
  try {
    // Crear directorio de instalación si no existe
    if (!fs.existsSync(CONFIG.installDir)) {
      fs.mkdirSync(CONFIG.installDir, { recursive: true });
    }
    
    // Ruta del archivo ZIP
    const zipPath = path.join(CONFIG.installDir, 'ollama.zip');
    
    // Descargar Ollama
    await downloadFile(CONFIG.downloadUrl, zipPath);
    
    // Extraer ZIP
    console.log('Extrayendo archivo ZIP...');
    await runCommand(`powershell -command "Expand-Archive -Path '${zipPath}' -DestinationPath '${CONFIG.installDir}' -Force"`);
    
    // Eliminar ZIP
    fs.unlinkSync(zipPath);
    
    console.log('Ollama instalado correctamente');
    
    // Iniciar Ollama
    console.log('Iniciando Ollama...');
    await runCommand(`start "Ollama" /B "${path.join(CONFIG.installDir, 'ollama.exe')}"`);
    
    // Esperar a que Ollama esté listo
    console.log('Esperando a que Ollama esté listo...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Descargar modelos
    for (const model of CONFIG.models) {
      console.log(`Descargando modelo ${model}...`);
      try {
        await runCommand(`"${path.join(CONFIG.installDir, 'ollama.exe')}" pull ${model}`);
        console.log(`Modelo ${model} descargado correctamente`);
      } catch (error) {
        console.error(`Error al descargar modelo ${model}: ${error.message}`);
      }
    }
    
    console.log('\nInstalación completada. Ollama está ejecutándose en segundo plano.');
    console.log('Puedes usar el chatbot con modelos locales ahora.');
    console.log('Para detener Ollama, cierra su ventana o usa el Administrador de tareas.');
  } catch (error) {
    console.error('Error durante la instalación:', error);
  }
}

// Ejecutar instalación
console.log('Iniciando instalación de Ollama...');
installOllama();