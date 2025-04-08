/**
 * B.O.B. AI Configuration
 */

const path = require('path');

module.exports = {
  // Core paths
  paths: {
    data: path.join(__dirname, 'data'),
    models: path.join(__dirname, 'data', 'models'),
    documents: path.join(__dirname, 'data', 'documents'),
    vectorDb: path.join(__dirname, 'data', 'vector_db'),
    temp: path.join(__dirname, 'temp')
  },
  
  // Ollama configuration
  ollama: {
    host: process.env.OLLAMA_HOST || 'localhost',
    port: process.env.OLLAMA_PORT || 11434,
    model: 'llama3:latest',  // Using your existing model
    options: {
      temperature: 0.7,
      top_k: 40,
      top_p: 0.9,
      num_predict: 2048,
    }
  },
  
  // Vector database configuration
  vectorDb: {
    collection: 'bob_knowledge',
    embeddingModel: 'all-MiniLM-L6-v2',
    chunkSize: 500,
    chunkOverlap: 100,
    retrievalCount: 5
  },
  
  // Task-specific configurations
  tasks: {
    prioritization: {
      temperature: 0.2,
      systemPrompt: "You are a task prioritization assistant for ADHD users. Focus on helping organize, prioritize, and structure tasks. Consider urgency, importance, complexity, and energy levels. Provide clear, structured guidance with minimal cognitive load. Use bullet points and short paragraphs. Highlight the most important next actions."
    },
    ideaOrganization: {
      temperature: 0.7,
      systemPrompt: "You are an idea organization assistant for ADHD users who experience idea overflow. Help connect scattered thoughts, identify patterns, and structure creative thinking. Organize thoughts into coherent themes. Identify connections that might not be obvious. Suggest ways to develop promising ideas further while helping prioritize which to focus on first."
    },
    conversation: {
      temperature: 0.7,
      systemPrompt: "You are a helpful assistant for ADHD users. Maintain a supportive, patient tone. Provide clear, concise responses. Watch for signs of overwhelm or executive dysfunction in the user's messages. Keep responses focused and helpful. Avoid overwhelming with too much information at once."
    },
    documentAnalysis: {
      temperature: 0.2,
      systemPrompt: "You are a document analysis assistant for ADHD users. Extract key information and action items from documents while minimizing information overload. Summarize the most important points. Highlight action items, deadlines, and commitments. Format information in an ADHD-friendly way with clear structure and minimal text walls."
    }
  },
  
  // Server configuration
  server: {
    port: process.env.PORT || 3001,
    maxUploadSize: '50mb'
  },
  
  // Resource management
  resources: {
    maxConcurrentRequests: 2,
    requestTimeout: 30000, // 30 seconds
    maxDocumentSize: 10 * 1024 * 1024 // 10MB
  }
};
