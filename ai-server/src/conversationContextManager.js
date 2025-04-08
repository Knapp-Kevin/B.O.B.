// conversationContextManager.js
class ConversationContextManager {
  constructor(maxHistoryLength = 10) {
    this.conversations = new Map();
    this.maxHistoryLength = maxHistoryLength;
  }

  // Start or continue a conversation
  addMessage(conversationId, message, role = 'user') {
    if (!this.conversations.has(conversationId)) {
      this.conversations.set(conversationId, []);
    }

    const conversation = this.conversations.get(conversationId);
    
    // Add the new message
    conversation.push({
      role,
      content: message,
      timestamp: new Date().toISOString()
    });

    // Trim conversation history if it exceeds max length
    if (conversation.length > this.maxHistoryLength) {
      conversation.shift();
    }
  }

  // Get conversation history
  getConversationHistory(conversationId, limit = null) {
    const conversation = this.conversations.get(conversationId) || [];
    
    // If limit is specified, return only the last N messages
    return limit ? conversation.slice(-limit) : conversation;
  }

  // Format conversation history for context
  formatConversationContext(conversationId, limit = 5) {
    const history = this.getConversationHistory(conversationId, limit);
    
    return history.map((msg, index) => 
      `${msg.role.toUpperCase()} ${index + 1}: ${msg.content}`
    ).join('\n\n');
  }

  // Clear conversation history
  clearConversation(conversationId) {
    if (this.conversations.has(conversationId)) {
      this.conversations.delete(conversationId);
    }
  }
}

module.exports = new ConversationContextManager();