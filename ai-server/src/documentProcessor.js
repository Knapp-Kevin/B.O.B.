// document-processor.js
const fs = require('fs').promises;
const path = require('path');
const mammoth = require('mammoth');
const ExcelJS = require('exceljs');
const pdfParse = require('pdf-parse');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

// Load configuration
let config;
try {
  config = require('../ai-config');
} catch (error) {
  // Default configuration if ai-config.js doesn't exist yet
  config = {
    paths: {
      documents: path.join(__dirname, '..', 'data', 'documents'),
      temp: path.join(__dirname, '..', 'temp')
    },
    vectorDb: {
      chunkSize: 500,
      chunkOverlap: 100
    }
  };
}

/**
 * Document processor class for handling various file formats
 */
class DocumentProcessor {
  constructor() {
    this.supportedExtensions = {
      '.pdf': this.processPdf,
      '.docx': this.processDocx,
      '.doc': this.processDoc,
      '.xlsx': this.processXlsx,
      '.xls': this.processXls,
      '.txt': this.processTxt,
      '.md': this.processTxt,
      '.csv': this.processCsv
    };
  }

  /**
   * Process a document file
   * @param {string} filePath - Path to the document file
   * @returns {Promise<Object>} - Extracted text and metadata
   */
  async processFile(filePath) {
    try {
      // Check if file exists
      await fs.access(filePath);
      
      const ext = path.extname(filePath).toLowerCase();
      const fileName = path.basename(filePath);
      
      // Check if extension is supported
      if (!this.supportedExtensions[ext]) {
        throw new Error(`Unsupported file extension: ${ext}`);
      }
      
      console.log(`Processing ${fileName}...`);
      
      // Process file based on extension
      const processor = this.supportedExtensions[ext].bind(this);
      const result = await processor(filePath);
      
      // Add metadata
      result.metadata = result.metadata || {};
      result.metadata.fileName = fileName;
      result.metadata.fileType = ext.substring(1); // Remove the dot
      result.metadata.processedDate = new Date().toISOString();
      
      return result;
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error.message);
      throw error;
    }
  }
  
  /**
   * Convert legacy .doc to .docx using LibreOffice (if available)
   * @param {string} docPath - Path to the .doc file
   * @returns {Promise<string>} - Path to the converted .docx file
   */
  async convertDocToDocx(docPath) {
    const outputDir = path.dirname(docPath);
    const docxPath = docPath.replace(/\.doc$/, '.docx');
    
    // Check if LibreOffice is available
    try {
      await exec('libreoffice --version');
      
      // Convert using LibreOffice
      await exec(`libreoffice --headless --convert-to docx --outdir "${outputDir}" "${docPath}"`);
      
      console.log(`Converted ${path.basename(docPath)} to DOCX format`);
      return docxPath;
    } catch (error) {
      // If LibreOffice is not available, try using mammoth directly (limited support)
      console.warn('LibreOffice not available, falling back to direct processing');
      return docPath;
    }
  }
  
  /**
   * Convert legacy .xls to .xlsx using LibreOffice (if available)
   * @param {string} xlsPath - Path to the .xls file
   * @returns {Promise<string>} - Path to the converted .xlsx file
   */
  async convertXlsToXlsx(xlsPath) {
    const outputDir = path.dirname(xlsPath);
    const xlsxPath = xlsPath.replace(/\.xls$/, '.xlsx');
    
    // Check if LibreOffice is available
    try {
      await exec('libreoffice --version');
      
      // Convert using LibreOffice
      await exec(`libreoffice --headless --convert-to xlsx --outdir "${outputDir}" "${xlsPath}"`);
      
      console.log(`Converted ${path.basename(xlsPath)} to XLSX format`);
      return xlsxPath;
    } catch (error) {
      // If LibreOffice is not available, try using exceljs directly (limited support)
      console.warn('LibreOffice not available, falling back to direct processing');
      return xlsPath;
    }
  }

  /**
   * Process PDF file
   * @param {string} filePath - Path to the PDF file
   * @returns {Promise<Object>} - Extracted text and metadata
   */
  async processPdf(filePath) {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    
    return {
      text: data.text,
      metadata: {
        pageCount: data.numpages,
        author: data.info?.Author || 'Unknown',
        creationDate: data.info?.CreationDate || 'Unknown'
      }
    };
  }

  /**
   * Process DOCX file
   * @param {string} filePath - Path to the DOCX file
   * @returns {Promise<Object>} - Extracted text and metadata
   */
  async processDocx(filePath) {
    const result = await mammoth.extractRawText({ path: filePath });
    
    return {
      text: result.value,
      metadata: {
        messages: result.messages
      }
    };
  }
  
  /**
   * Process DOC file by converting to DOCX first
   * @param {string} filePath - Path to the DOC file
   * @returns {Promise<Object>} - Extracted text and metadata
   */
  async processDoc(filePath) {
    try {
      // Try to convert DOC to DOCX
      const docxPath = await this.convertDocToDocx(filePath);
      
      // Process the converted DOCX
      if (docxPath.endsWith('.docx')) {
        return this.processDocx(docxPath);
      }
      
      // If direct conversion is not available, try mammoth anyway
      const result = await mammoth.extractRawText({ path: filePath });
      
      return {
        text: result.value,
        metadata: {
          messages: result.messages,
          conversionNote: 'Processed directly without conversion'
        }
      };
    } catch (error) {
      console.error(`Error processing DOC file: ${error.message}`);
      throw new Error(`DOC processing failed: ${error.message}`);
    }
  }

  /**
   * Process XLSX file
   * @param {string} filePath - Path to the XLSX file
   * @returns {Promise<Object>} - Extracted text and metadata
   */
  async processXlsx(filePath) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    let text = '';
    const sheetNames = [];
    
    workbook.eachSheet((worksheet, sheetId) => {
      sheetNames.push(worksheet.name);
      text += `\n\n--- Sheet: ${worksheet.name} ---\n\n`;
      
      // Process each row
      worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        const rowText = row.values
          .filter(Boolean) // Remove empty cells
          .slice(1) // ExcelJS adds an undefined value at index 0
          .join('\t');
        
        if (rowText.trim()) {
          text += `${rowText}\n`;
        }
      });
    });
    
    return {
      text: text.trim(),
      metadata: {
        sheetCount: sheetNames.length,
        sheetNames: sheetNames
      }
    };
  }
  
  /**
   * Process XLS file by converting to XLSX first
   * @param {string} filePath - Path to the XLS file
   * @returns {Promise<Object>} - Extracted text and metadata
   */
  async processXls(filePath) {
    try {
      // Try to convert XLS to XLSX
      const xlsxPath = await this.convertXlsToXlsx(filePath);
      
      // Process the converted XLSX
      if (xlsxPath.endsWith('.xlsx')) {
        return this.processXlsx(xlsxPath);
      }
      
      // If direct conversion is not available, try exceljs anyway
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      
      let text = '';
      const sheetNames = [];
      
      workbook.eachSheet((worksheet, sheetId) => {
        sheetNames.push(worksheet.name);
        text += `\n\n--- Sheet: ${worksheet.name} ---\n\n`;
        
        // Process each row
        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
          const rowText = row.values
            .filter(Boolean)
            .slice(1)
            .join('\t');
          
          if (rowText.trim()) {
            text += `${rowText}\n`;
          }
        });
      });
      
      return {
        text: text.trim(),
        metadata: {
          sheetCount: sheetNames.length,
          sheetNames: sheetNames,
          conversionNote: 'Processed directly without conversion'
        }
      };
    } catch (error) {
      console.error(`Error processing XLS file: ${error.message}`);
      throw new Error(`XLS processing failed: ${error.message}`);
    }
  }

  /**
   * Process TXT or MD file
   * @param {string} filePath - Path to the text file
   * @returns {Promise<Object>} - Extracted text and metadata
   */
  async processTxt(filePath) {
    const text = await fs.readFile(filePath, 'utf8');
    
    return {
      text: text,
      metadata: {
        lineCount: text.split('\n').length,
        characterCount: text.length
      }
    };
  }
  
  /**
   * Process CSV file
   * @param {string} filePath - Path to the CSV file
   * @returns {Promise<Object>} - Extracted text and metadata
   */
  async processCsv(filePath) {
    const text = await fs.readFile(filePath, 'utf8');
    
    // Convert to structured format
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(header => header.trim());
    
    let structuredText = `CSV Data with columns: ${headers.join(', ')}\n\n`;
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(value => value.trim());
      const rowData = headers.map((header, index) => {
        return `${header}: ${values[index] || ''}`;
      }).join(', ');
      
      structuredText += `Row ${i}: ${rowData}\n`;
    }
    
    return {
      text: structuredText,
      metadata: {
        rowCount: lines.length - 1,
        columnCount: headers.length,
        headers: headers
      }
    };
  }

  /**
   * Split text into chunks for processing
   * @param {string} text - Text to split
   * @param {number} chunkSize - Maximum size of each chunk
   * @param {number} overlap - Overlap between chunks
   * @returns {Array<string>} - Array of text chunks
   */
  splitIntoChunks(text, chunkSize = config.vectorDb.chunkSize, overlap = config.vectorDb.chunkOverlap) {
    const chunks = [];
    
    // Simple paragraph-based chunking
    const paragraphs = text.split(/\n\s*\n/);
    let currentChunk = '';
    
    for (const paragraph of paragraphs) {
      // If adding this paragraph would exceed chunk size, save current chunk and start a new one
      if (currentChunk.length + paragraph.length > chunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        
        // Start new chunk with overlap from the end of the previous chunk
        const words = currentChunk.split(' ');
        const overlapWords = words.slice(Math.max(0, words.length - overlap));
        currentChunk = overlapWords.join(' ') + ' ' + paragraph;
      } else {
        // Add paragraph to current chunk
        if (currentChunk.length > 0) {
          currentChunk += '\n\n';
        }
        currentChunk += paragraph;
      }
    }
    
    // Add the last chunk if it's not empty
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }
}

module.exports = new DocumentProcessor();
