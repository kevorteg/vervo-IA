/**
 * Script para iniciar el servidor de API local
 * Este script inicia el servidor de API para el modelo de IA local
 */

const localLLMApi = require('./local-llm-api');

// Iniciar el servidor
console.log('Iniciando servidor de API para modelo de IA local...');

localLLMApi.start()
  .then(server => {
    console.log(`Servidor iniciado correctamente en http://${server.address().address}:${server.address().port}`);
    console.log('Presiona Ctrl+C para detener el servidor');
  })
  .catch(error => {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  });