/**
 * Módulo para procesar y cargar datos de entrenamiento para el chatbot
 */

const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const mammoth = require('mammoth');
const pdf = require('pdf-parse');

// Ruta a la carpeta de entrenamiento
const TRAINING_FOLDER = path.join(__dirname, 'Entrenamiento');

/**
 * Función para cargar y procesar todos los datos de entrenamiento
 * @returns {Promise<Object>} Datos de entrenamiento procesados
 */
async function loadTrainingData() {
  console.log('Cargando datos de entrenamiento desde:', TRAINING_FOLDER);
  
  const trainingData = {
    excel: [],
    documents: [],
    pdf: []
  };
  
  try {
    // Verificar si la carpeta existe
    if (!fs.existsSync(TRAINING_FOLDER)) {
      console.error('La carpeta de entrenamiento no existe:', TRAINING_FOLDER);
      return trainingData;
    }
    
    // Leer archivos en la carpeta
    const files = fs.readdirSync(TRAINING_FOLDER);
    
    // Procesar cada archivo según su tipo
    for (const file of files) {
      const filePath = path.join(TRAINING_FOLDER, file);
      const fileExt = path.extname(file).toLowerCase();
      
      // Ignorar archivos temporales
      if (file.startsWith('~$')) continue;
      
      console.log(`Procesando archivo: ${file}`);
      
      try {
        if (fileExt === '.xlsx' || fileExt === '.xls') {
          // Procesar archivos Excel
          const excelData = await processExcelFile(filePath);
          trainingData.excel.push({
            fileName: file,
            data: excelData
          });
        } else if (fileExt === '.docx' || fileExt === '.doc') {
          // Procesar documentos Word
          const docData = await processWordDocument(filePath);
          trainingData.documents.push({
            fileName: file,
            content: docData
          });
        } else if (fileExt === '.pdf') {
          // Procesar archivos PDF
          const pdfData = await processPdfFile(filePath);
          trainingData.pdf.push({
            fileName: file,
            content: pdfData
          });
        }
      } catch (fileError) {
        console.error(`Error al procesar el archivo ${file}:`, fileError);
      }
    }
    
    console.log('Datos de entrenamiento cargados exitosamente');
    return trainingData;
  } catch (error) {
    console.error('Error al cargar los datos de entrenamiento:', error);
    return trainingData;
  }
}

/**
 * Procesa un archivo Excel y extrae sus datos
 * @param {string} filePath Ruta al archivo Excel
 * @returns {Promise<Array>} Datos extraídos del Excel
 */
async function processExcelFile(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  
  const result = [];
  
  workbook.eachSheet((worksheet) => {
    const sheetData = {
      name: worksheet.name,
      rows: []
    };
    
    // Obtener encabezados (primera fila)
    const headers = [];
    worksheet.getRow(1).eachCell((cell) => {
      headers.push(cell.value);
    });
    
    // Procesar filas de datos
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Omitir la fila de encabezados
        const rowData = {};
        row.eachCell((cell, colNumber) => {
          if (headers[colNumber - 1]) {
            rowData[headers[colNumber - 1]] = cell.value;
          }
        });
        sheetData.rows.push(rowData);
      }
    });
    
    result.push(sheetData);
  });
  
  return result;
}

/**
 * Procesa un documento Word y extrae su contenido
 * @param {string} filePath Ruta al documento Word
 * @returns {Promise<string>} Contenido extraído del documento
 */
async function processWordDocument(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

/**
 * Procesa un archivo PDF y extrae su contenido
 * @param {string} filePath Ruta al archivo PDF
 * @returns {Promise<string>} Contenido extraído del PDF
 */
async function processPdfFile(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
}

/**
 * Prepara los datos de entrenamiento para el modelo de OpenAI
 * @param {Object} trainingData Datos de entrenamiento procesados
 * @returns {Object} Datos formateados para el entrenamiento
 */
function prepareTrainingContext(trainingData) {
  let context = '';
  
  // Procesar datos de documentos Word
  trainingData.documents.forEach(doc => {
    context += `Documento: ${doc.fileName}\n\n${doc.content}\n\n`;
  });
  
  // Procesar datos de PDF
  trainingData.pdf.forEach(pdfDoc => {
    context += `Documento PDF: ${pdfDoc.fileName}\n\n${pdfDoc.content}\n\n`;
  });
  
  // Procesar datos de Excel
  trainingData.excel.forEach(excelFile => {
    context += `Datos de Excel: ${excelFile.fileName}\n\n`;
    
    excelFile.data.forEach(sheet => {
      context += `Hoja: ${sheet.name}\n`;
      
      // Convertir datos de filas a formato legible
      sheet.rows.forEach((row, index) => {
        context += `Registro ${index + 1}: `;
        Object.entries(row).forEach(([key, value]) => {
          context += `${key}: ${value}, `;
        });
        context += '\n';
      });
      
      context += '\n';
    });
  });
  
  return {
    context,
    summary: generateSummary(trainingData)
  };
}

/**
 * Genera un resumen de los datos de entrenamiento
 * @param {Object} trainingData Datos de entrenamiento procesados
 * @returns {string} Resumen de los datos
 */
function generateSummary(trainingData) {
  const summary = [];
  
  // Contar documentos por tipo
  const excelCount = trainingData.excel.length;
  const docCount = trainingData.documents.length;
  const pdfCount = trainingData.pdf.length;
  
  if (excelCount > 0) {
    summary.push(`${excelCount} archivo(s) Excel procesado(s)`);
  }
  
  if (docCount > 0) {
    summary.push(`${docCount} documento(s) Word procesado(s)`);
  }
  
  if (pdfCount > 0) {
    summary.push(`${pdfCount} archivo(s) PDF procesado(s)`);
  }
  
  return summary.join(', ');
}

module.exports = {
  loadTrainingData,
  prepareTrainingContext
};