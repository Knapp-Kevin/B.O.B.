// ragService.js
const vectorStore = require('./vectorStore');

/**
 * RAG (Retrieval Augmented Generation) Service
 * Enhances AI prompts with relevant knowledge from the vector database
 */
class RAGService {
  constructor() {
    this.vectorStore = vectorStore;
    this.initialized = false;
  }

  /**
   * Initialize the RAG service
   * @returns {Promise<void>}
   */
  async initialize() {
    if (!this.initialized) {
      await this.vectorStore.initialize();
      this.initialized = true;
      console.log('RAG Service initialized');
    }
  }

  /**
   * Enhance a query with relevant context from the knowledge base
   * @param {string} query - User query
   * @param {string} taskType - Type of task
   * @param {Object} filters - Optional metadata filters
   * @returns {Promise<Object>} - Enhanced query with context
   */
  async enhanceQuery(query, taskType, filters = {}) {
    await this.initialize();
    
    try {
      console.log(`Enhancing query for task type: ${taskType}`);
      
      // Retrieve relevant documents based on query
      const results = await this.vectorStore.query(query, 5, filters);
      
      if (results.length === 0) {
        console.log('No relevant documents found');
        return {
          enhancedQuery: query,
          context: [],
          hasContext: false
        };
      }
      
      console.log(`Found ${results.length} relevant documents`);
      
      // Format retrieved context
      const formattedContext = results.map(result => ({
        text: result.text,
        source: result.metadata.source,
        relevance: 1 - result.distance // Convert distance to relevance score
      }));
      
      return {
        enhancedQuery: query,
        context: formattedContext,
        hasContext: true
      };
    } catch (error) {
      console.error('Error enhancing query:', error);
      
      // Return original query if enhancement fails
      return {
        enhancedQuery: query,
        context: [],
        hasContext: false,
        error: error.message
      };
    }
  }

  /**
   * Add a document to the knowledge base
   * @param {Object} document - Document to add
   * @returns {Promise<void>}
   */
  async addDocument(document) {
    await this.initialize();
    return this.vectorStore.addDocument(document);
  }

  /**
   * Add multiple documents to the knowledge base
   * @param {Array<Object>} documents - Documents to add
   * @returns {Promise<void>}
   */
  async addDocuments(documents) {
    await this.initialize();
    return this.vectorStore.addDocuments(documents);
  }

  /**
   * Process and add a document from a file
   * @param {string} filePath - Path to document file
   * @param {Object} processor - Document processor
   * @returns {Promise<Array<Object>>} - Added document chunks
   */
  async processAndAddDocument(filePath, processor) {
    await this.initialize();
    
    // Process document into chunks
    const documents = await this.vectorStore.processDocumentFile(filePath, processor);
    
    // Add documents to vector store
    await this.vectorStore.addDocuments(documents);
    
    return documents;
  }

  /**
   * Get all sources in the knowledge base
   * @returns {Promise<Array<string>>} - List of sources
   */
  async getSources() {
    await this.initialize();
    return this.vectorStore.getDocumentSources();
  }

  /**
   * Delete documents by source
   * @param {string} source - Source to delete
   * @returns {Promise<boolean>} - Success status
   */
  async deleteSource(source) {
    await this.initialize();
    return this.vectorStore.deleteDocumentsBySource(source);
  }
}

module.exports = new RAGService();
