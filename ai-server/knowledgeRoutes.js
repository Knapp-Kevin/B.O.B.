// knowledgeRoutes.js
const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Load RAG service and document processor
const ragService = require('./src/ragService');
const documentProcessor = require('./src/documentProcessor');

// Load configuration
let config;
try {
  config = require('./ai-config');
} catch (error) {
  config = {
    paths: {
      documents: path.join(__dirname, 'data', 'documents')
    }
  };
}

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.paths.documents);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with original extension
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

const router = express.Router();

// Add knowledge routes

/**
 * Upload and process a document for the knowledge base
 * POST /api/knowledge/document
 */
router.post('/document', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { file } = req;
    const originalName = req.body.originalName || file.originalname;
    const category = req.body.category || 'general';
    const description = req.body.description || '';
    
    // Store original file information
    const fileInfo = {
      id: path.basename(file.path, path.extname(file.path)),
      originalName,
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimeType: file.mimetype,
      category,
      description,
      uploadDate: new Date().toISOString()
    };
    
    // Save file info
    const infoPath = path.join(config.paths.documents, `${fileInfo.id}.json`);
    await fs.writeFile(infoPath, JSON.stringify(fileInfo, null, 2));
    
    // Process document and add to knowledge base
    console.log(`Processing ${originalName} for knowledge base...`);
    const documents = await ragService.processAndAddDocument(file.path, documentProcessor);
    
    res.json({
      success: true,
      message: `Added ${documents.length} chunks to knowledge base`,
      originalName,
      chunks: documents.length,
      fileInfo
    });
  } catch (error) {
    console.error('Error processing knowledge document:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get list of knowledge sources
 * GET /api/knowledge/sources
 */
router.get('/sources', async (req, res) => {
  try {
    const sources = await ragService.getSources();
    res.json({ sources });
  } catch (error) {
    console.error('Error getting knowledge sources:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete a knowledge source
 * DELETE /api/knowledge/source/:source
 */
router.delete('/source/:source', async (req, res) => {
  try {
    const { source } = req.params;
    
    if (!source) {
      return res.status(400).json({ error: 'Source name is required' });
    }
    
    const result = await ragService.deleteSource(source);
    res.json({ success: result, message: `Deleted source: ${source}` });
  } catch (error) {
    console.error('Error deleting knowledge source:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Process all documents in the documents directory
 * POST /api/knowledge/process-all
 */
router.post('/process-all', async (req, res) => {
  try {
    console.log('Processing all documents in the documents directory...');
    
    // Get list of JSON metadata files to exclude
    const files = await fs.readdir(config.paths.documents);
    const jsonFiles = files.filter(file => file.endsWith('.json')).map(file => file);
    
    // Count of documents processed
    let processedCount = 0;
    let errorCount = 0;
    
    // Process each file that's not a JSON metadata file
    for (const file of files) {
      if (jsonFiles.includes(file) || file.endsWith('.temp')) {
        continue;
      }
      
      const filePath = path.join(config.paths.documents, file);
      
      try {
        // Check if file exists and is a file
        const stat = await fs.stat(filePath);
        if (!stat.isFile()) continue;
        
        // Get file extension
        const ext = path.extname(file).toLowerCase();
        
        // Skip if not a supported extension
        if (!documentProcessor.supportedExtensions[ext]) {
          console.log(`Skipping unsupported file: ${file}`);
          continue;
        }
        
        // Process document
        console.log(`Processing ${file}...`);
        const documents = await ragService.processAndAddDocument(filePath, documentProcessor);
        
        console.log(`Added ${documents.length} chunks from ${file}`);
        processedCount += documents.length;
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
        errorCount++;
      }
    }
    
    res.json({
      success: true,
      message: `Processed ${processedCount} document chunks with ${errorCount} errors`,
      processedCount,
      errorCount
    });
  } catch (error) {
    console.error('Error processing all documents:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Test knowledge retrieval
 * POST /api/knowledge/test
 */
router.post('/test', async (req, res) => {
  try {
    const { query, limit = 5 } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    // Retrieve relevant knowledge
    const results = await ragService.enhanceQuery(query, 'test');
    
    res.json({
      success: true,
      query,
      hasContext: results.hasContext,
      context: results.context
    });
  } catch (error) {
    console.error('Error testing knowledge retrieval:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
