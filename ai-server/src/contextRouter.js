// context-router.js
const express = require('express');
const axios = require('axios');
const ragService = require('./ragService');
const conversationContextManager = require('./conversationContextManager');

// Load configuration
let config;
try {
  config = require('../ai-config');
} catch (error) {
  // Default configuration if ai-config.js doesn't exist yet
  config = {
    ollama: {
      host: process.env.OLLAMA_HOST || 'localhost',
      port: process.env.OLLAMA_PORT || 11434,
      model: 'llama3:latest',
      options: {
        temperature: 0.7,
        top_k: 40,
        top_p: 0.9,
        num_predict: 2048,
      }
    },
    tasks: {
      conversation: {
        temperature: 0.7,
        systemPrompt: "You are B.O.B. (Better Organized Brain), a supportive AI assistant designed to help neurodivergent individuals. Maintain context, be patient, and provide clear, structured support."
      }
    }
  };
}

// Initialize router
const router = express.Router();

// Detect task type (simplified for now)
function detectTaskType(input) {
  return 'conversation';
}

// Create prompt for Ollama
function createPrompt(input, taskType, conversationContext = '', userData = {}, retrievedContext = []) {
  const taskConfig = config.tasks[taskType];
  
  // Build system message
  let systemMessage = taskConfig.systemPrompt;
  
  // Add conversation history context
  let conversationHistoryPrompt = conversationContext ? 
    `\n\nConversation History:\n${conversationContext}\n` : '';
  
  // Add retrieved context if available
  let retrievedContextPrompt = '';
  if (retrievedContext && retrievedContext.length > 0) {
    retrievedContextPrompt = '\nRelevant Information:\n';
    retrievedContext.forEach((item, index) => {
      retrievedContextPrompt += `--- Context ${index + 1} ---\n${item.text}\n\n`;
    });
  }
  
  // Create the full prompt
  const prompt = `${systemMessage}${conversationHistoryPrompt}${retrievedContextPrompt}\n\nUser Query: ${input}\n\nResponse:`;
  
  // Ollama parameters
  return {
    model: config.ollama.model,
    prompt: prompt,
    options: {
      temperature: taskConfig.temperature || config.ollama.options.temperature,
      top_k: config.ollama.options.top_k,
      top_p: config.ollama.options.top_p,
      num_predict: config.ollama.options.num_predict
    }
  };
}

// API endpoint for querying the model
router.post('/query', async (req, res) => {
  try {
    const { 
      text, 
      userData = {}, 
      metadata = {}, 
      conversationId = 'default',
      fileData = null,
      hasProcessedFiles = false
    } = req.body;
    
    // Validate input
    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }
    
    // Add user message to conversation context
    conversationContextManager.addMessage(conversationId, text, 'user');
    
    // Get conversation history
    const conversationContext = conversationContextManager.formatConversationContext(conversationId);
    
    // Detect task type
    const taskType = metadata?.taskType || detectTaskType(text, hasProcessedFiles);
    console.log(`Detected task type: ${taskType}`);
    
    // Enhance query with RAG
    let enhancedQuery = { enhancedQuery: text, context: [], hasContext: false };
    try {
      enhancedQuery = await ragService.enhanceQuery(text, taskType);
      console.log('Enhanced Query Context:', JSON.stringify(enhancedQuery.context, null, 2));
    } catch (error) {
      console.warn('RAG enhancement failed, continuing without context:', error.message);
    }
    
    // Process file data if available
    let fileContext = '';
    if (fileData && fileData.length > 0) {
      fileContext = await processFileDataForContext(fileData);
      console.log('Added file context to prompt');
    }
    
    // Create context-aware prompt
    const prompt = createPrompt(
      text, 
      taskType, 
      conversationContext, 
      userData, 
      enhancedQuery.context,
      fileContext
    );
    console.log('Prompt to Ollama:', JSON.stringify(prompt, null, 2));
    
    // Send to Ollama
    const response = await axios.post(
      `http://${config.ollama.host}:${config.ollama.port}/api/generate`, 
      prompt
    );
    
    // Process streaming response
    let fullResponse = '';
    const responseData = response.data.split('\n').filter(line => line.trim() !== '');
    responseData.forEach(line => {
      try {
        const parsedLine = JSON.parse(line);
        if (parsedLine.response) {
          fullResponse += parsedLine.response;
        }
      } catch (parseError) {
        console.error('Error parsing response line:', parseError);
      }
    });
    
    console.log('Full Ollama Response:', fullResponse);
    
    // Ensure we have a valid response
    if (!fullResponse) {
      return res.status(500).json({ 
        error: "No response from Ollama", 
        prompt: prompt 
      });
    }
    
    // Add B.O.B.'s response to conversation context
    conversationContextManager.addMessage(conversationId, fullResponse, 'assistant');
    
    // Send response
    res.json({
      response: fullResponse,
      task_type: taskType,
      enhanced: enhancedQuery.hasContext,
      conversationId: conversationId
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ 
      error: "Error processing request", 
      details: error.message,
      fullError: error.toString() 
    });
  }
});

// Helper function to process file data for context
async function processFileDataForContext(fileData) {
  // Extract Excel data if available
  let fileContext = '\n\nFile Data:';
  
  for (const file of fileData) {
    fileContext += `\n- File: ${file.name}`;
    
    if (file.excel) {
      fileContext += ` (Excel file with ${file.excel.totalSheets || 1} sheets)`;
      
      if (file.excel.headers) {
        fileContext += `\n  Headers: ${file.excel.headers.join(', ')}`;
      }
      
      if (file.dataPreview && file.dataPreview.length > 0) {
        fileContext += '\n  Data Preview:';
        
        // Add preview rows (limit to 5 rows max)
        const maxRows = Math.min(file.dataPreview.length, 5);
        for (let i = 0; i < maxRows; i++) {
          const row = file.dataPreview[i];
          if (Array.isArray(row)) {
            fileContext += `\n    Row ${i+1}: ${row.join(', ')}`;
          }
        }
      }
      
      if (file.content && file.content.parsed) {
        fileContext += `\n  Total Rows: ${file.content.parsed.length}`;
        // Add additional structure info if available
      }
    } else {
      fileContext += ` (${file.type})`;
    }
  }
  
  return fileContext;
}

// Update createPrompt function to include file context
function createPrompt(input, taskType, conversationContext = '', userData = {}, retrievedContext = [], fileContext = '') {
  const taskConfig = config.tasks[taskType];
  
  // Build system message
  let systemMessage = taskConfig.systemPrompt;
  
  // Add conversation history context
  let conversationHistoryPrompt = conversationContext ? 
    `\n\nConversation History:\n${conversationContext}\n` : '';
  
  // Add retrieved context if available
  let retrievedContextPrompt = '';
  if (retrievedContext && retrievedContext.length > 0) {
    retrievedContextPrompt = '\nRelevant Information:\n';
    retrievedContext.forEach((item, index) => {
      retrievedContextPrompt += `--- Context ${index + 1} ---\n${item.text}\n\n`;
    });
  }
  
  // Create the full prompt
  const prompt = `${systemMessage}${conversationHistoryPrompt}${retrievedContextPrompt}${fileContext}\n\nUser Query: ${input}\n\nResponse:`;
  
  // Ollama parameters
  return {
    model: config.ollama.model,
    prompt: prompt,
    options: {
      temperature: taskConfig.temperature || config.ollama.options.temperature,
      top_k: config.ollama.options.top_k,
      top_p: config.ollama.options.top_p,
      num_predict: config.ollama.options.num_predict
    }
  };
}

// Updated detectTaskType function to detect Excel analysis
function detectTaskType(input, hasProcessedFiles = false) {
  // If we have processed files, this might be a data analysis task
  if (hasProcessedFiles) {
    if (input.toLowerCase().includes('excel') || 
        input.toLowerCase().includes('spreadsheet') ||
        input.toLowerCase().includes('data') ||
        input.toLowerCase().includes('column') ||
        input.toLowerCase().includes('row') ||
        input.toLowerCase().includes('analyze') ||
        input.toLowerCase().includes('chart') ||
        input.toLowerCase().includes('plot')) {
      return 'documentAnalysis';
    }
  }
  
  // Default to conversation
  return 'conversation';
}

// Endpoint to clear conversation context
router.post('/query', async (req, res) => {
  try {
    const { 
      text, 
      userData = {}, 
      metadata = {}, 
      conversationId = 'default',
      files = [],
      hasAttachedFiles = false
    } = req.body;
    
    // Validate input
    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }
    
    // Add user message to conversation context
    conversationContextManager.addMessage(conversationId, text, 'user');
    
    // Get conversation history
    const conversationContext = conversationContextManager.formatConversationContext(conversationId);
    
    // Detect task type - include file analysis if files are attached
    const taskType = hasAttachedFiles ? 'documentAnalysis' : 'conversation';
    console.log(`Detected task type: ${taskType}`);
    
    // Enhance query with RAG
    let enhancedQuery = { enhancedQuery: text, context: [], hasContext: false };
    try {
      enhancedQuery = await ragService.enhanceQuery(text, taskType);
    } catch (error) {
      console.warn('RAG enhancement failed, continuing without context:', error.message);
    }
    
    // Add file information to context
    let fileContext = '';
    if (files && files.length > 0) {
      fileContext = '\n\nFile Information:\n';
      files.forEach((file, index) => {
        fileContext += `File ${index + 1}: ${file.name} (${file.type}, ${formatFileSize(file.size)})\n`;
        
        if (file.isExcel && file.excelInfo) {
          fileContext += `Excel file with ${file.excelInfo.sheetNames?.length || 1} sheets.\n`;
          if (file.excelInfo.rowCount) {
            fileContext += `Contains approximately ${file.excelInfo.rowCount} rows and ${file.excelInfo.columnCount} columns.\n`;
          }
          if (file.excelInfo.headers && file.excelInfo.headers.length > 0) {
            fileContext += `Headers: ${file.excelInfo.headers.join(', ')}\n`;
          }
        }
      });
    }
    
    // Create context-aware prompt
    const prompt = createPrompt(
      text, 
      taskType, 
      conversationContext, 
      userData, 
      enhancedQuery.context,
      fileContext
    );
    
    // Send to Ollama
    const response = await axios.post(
      `http://${config.ollama.host}:${config.ollama.port}/api/generate`, 
      prompt
    );
    
    // Process streaming response
    let fullResponse = '';
    const responseData = response.data.split('\n').filter(line => line.trim() !== '');
    responseData.forEach(line => {
      try {
        const parsedLine = JSON.parse(line);
        if (parsedLine.response) {
          fullResponse += parsedLine.response;
        }
      } catch (parseError) {
        console.error('Error parsing response line:', parseError);
      }
    });
    
    // Ensure we have a valid response
    if (!fullResponse) {
      return res.status(500).json({ 
        error: "No response from Ollama", 
        prompt: prompt 
      });
    }
    
    // Add B.O.B.'s response to conversation context
    conversationContextManager.addMessage(conversationId, fullResponse, 'assistant');
    
    // Send response
    res.json({
      response: fullResponse,
      task_type: taskType,
      enhanced: enhancedQuery.hasContext,
      conversationId: conversationId
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ 
      error: "Error processing request", 
      details: error.message,
      fullError: error.toString() 
    });
  }
});

// Helper function to format file size
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
}

// Update createPrompt function to include file context
function createPrompt(input, taskType, conversationContext = '', userData = {}, retrievedContext = [], fileContext = '') {
  const taskConfig = config.tasks[taskType] || config.tasks.conversation;
  
  // Build system message
  let systemMessage = taskConfig.systemPrompt;
  
  // If this is a document analysis task, enhance the system prompt
  if (taskType === 'documentAnalysis') {
    systemMessage += "\n\nThe user has uploaded one or more files. Help analyze and explain the content of these files. If the files are Excel spreadsheets, assist with data analysis, calculations, and insights from the data.";
  }
  
  // Add conversation history context
  let conversationHistoryPrompt = conversationContext ? 
    `\n\nConversation History:\n${conversationContext}\n` : '';
  
  // Add retrieved context if available
  let retrievedContextPrompt = '';
  if (retrievedContext && retrievedContext.length > 0) {
    retrievedContextPrompt = '\nRelevant Information:\n';
    retrievedContext.forEach((item, index) => {
      retrievedContextPrompt += `--- Context ${index + 1} ---\n${item.text}\n\n`;
    });
  }
  
  // Add file context if available
  let fileContextPrompt = fileContext || '';
  
  // Create the full prompt
  const prompt = `${systemMessage}${conversationHistoryPrompt}${retrievedContextPrompt}${fileContextPrompt}\n\nUser Query: ${input}\n\nResponse:`;
  
  // Ollama parameters
  return {
    model: config.ollama.model,
    prompt: prompt,
    options: {
      temperature: taskConfig.temperature || config.ollama.options.temperature,
      top_k: config.ollama.options.top_k,
      top_p: config.ollama.options.top_p,
      num_predict: config.ollama.options.num_predict
    }
  };
}

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

module.exports = router;