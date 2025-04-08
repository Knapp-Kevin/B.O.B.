// index.js - Main entry point for B.O.B. AI Server
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { ChromaClient } = require('chromadb');
const axios = require('axios');
const knowledgeRoutes = require('./knowledgeRoutes');
const ragService = require('./src/ragService');

// Create app FIRST - this is the key change
const app = express();

// Initialize RAG service during startup
try {
  ragService.initialize().then(() => {
    console.log('RAG Service initialized');
  }).catch(err => {
    console.warn('RAG Service initialization failed:', err.message);
  });
} catch (error) {
  console.warn('Could not initialize RAG Service:', error.message);
}

// Load context router
const contextRouter = require('./src/contextRouter');

// Load document processor
const documentProcessor = require('./src/documentProcessor');

// Load configuration
let config;
try {
  config = require('./ai-config');
} catch (error) {
  console.warn('Config file not found, using defaults');
  config = {
    ollama: {
      host: process.env.OLLAMA_HOST || 'localhost',
      port: process.env.OLLAMA_PORT || 11434,
      model: 'llama3:latest',
    },
    paths: {
      data: path.join(__dirname, 'data'),
      documents: path.join(__dirname, 'data', 'documents'),
      vectorDb: path.join(__dirname, 'data', 'vector_db')
    },
    server: {
      port: process.env.PORT || 3001
    }
  };
}

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors());

// Add knowledge routes AFTER creating app
app.use('/api/knowledge', knowledgeRoutes);

// Ensure data directories exist
const ensureDirectories = () => {
  const directories = [
    config.paths.data,
    config.paths.documents,
    config.paths.vectorDb
  ];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};

ensureDirectories();

// Initialize ChromaDB client
let chromaClient;
try {
  chromaClient = new ChromaClient();
  console.log('ChromaDB client initialized');
} catch (error) {
  console.warn('Could not initialize ChromaDB:', error.message);
}

// Check Ollama connection
const checkOllamaConnection = async () => {
  try {
    await axios.get(`http://${config.ollama.host}:${config.ollama.port}/api/version`);
    console.log('Connected to Ollama successfully');
    return true;
  } catch (error) {
    console.error('Failed to connect to Ollama:', error.message);
    return false;
  }
};

// API Routes
app.use('/api/ai', contextRouter);

// Document upload endpoint
app.post('/api/documents/upload', async (req, res) => {
  try {
    const { fileName, content, mimeType } = req.body;
    
    if (!fileName || !content) {
      return res.status(400).json({ error: 'Missing fileName or content' });
    }
    
    // Determine file extension based on mimeType or fileName
    let fileExt = path.extname(fileName);
    if (!fileExt && mimeType) {
      const mimeToExt = {
        'application/pdf': '.pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
        'application/msword': '.doc',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
        'application/vnd.ms-excel': '.xls',
        'text/plain': '.txt',
        'text/markdown': '.md',
        'text/csv': '.csv'
      };
      fileExt = mimeToExt[mimeType] || '';
    }
    
    // Create full file path
    const filePath = path.join(config.paths.documents, fileName);
    
    // Convert base64 content to buffer (if applicable)
    let fileContent;
    if (content.startsWith('data:')) {
      // Handle data URL
      const base64Data = content.split(',')[1];
      fileContent = Buffer.from(base64Data, 'base64');
    } else if (Buffer.isBuffer(content)) {
      fileContent = content;
    } else {
      // Assume text content
      fileContent = Buffer.from(content);
    }
    
    // Write file to disk
    await fs.promises.writeFile(filePath, fileContent);
    console.log(`Saved file: ${fileName}`);
    
    // Process the document
    const processedDoc = await documentProcessor.processFile(filePath);
    
    // Return success with extracted text preview
    res.json({
      success: true,
      fileName,
      textPreview: processedDoc.text.substring(0, 200) + '...',
      metadata: processedDoc.metadata
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Document processing endpoint
app.post('/api/documents/process', async (req, res) => {
  try {
    const { filePath } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ error: 'Missing filePath' });
    }
    
    // Check if file exists
    const fullPath = path.join(config.paths.documents, filePath);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Process the document
    const processedDoc = await documentProcessor.processFile(fullPath);
    
    // Split into chunks
    const chunks = documentProcessor.splitIntoChunks(processedDoc.text);
    
    res.json({
      success: true,
      fileName: path.basename(filePath),
      chunkCount: chunks.length,
      firstChunkPreview: chunks[0].substring(0, 200) + '...',
      metadata: processedDoc.metadata
    });
  } catch (error) {
    console.error('Document processing error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  const ollamaConnected = await checkOllamaConnection();
  
  res.json({
    status: 'healthy',
    ollama: ollamaConnected ? 'connected' : 'disconnected',
    chroma: chromaClient ? 'initialized' : 'not initialized',
    version: '0.1.0'
  });
});

// Start server
const PORT = config.server?.port || 3001;
app.listen(PORT, () => {
  console.log(`B.O.B. AI Server running on port ${PORT}`);
  console.log(`Using model: ${config.ollama.model}`);
  
  // Check Ollama connection on startup
  checkOllamaConnection();
});

module.exports = app;

// Add a shutdown endpoint
app.post('/api/shutdown', (req, res) => {
  console.log('Shutdown request received from B.O.B. application');
  
  // Send response before shutting down
  res.json({ success: true, message: 'Server shutting down' });
  
  // Schedule shutdown after response is sent
  setTimeout(() => {
    console.log('AI server shutting down gracefully');
    process.exit(0);
  }, 1000);
});

// Add signal handlers
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});