/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

class BaseAiAdapter {
    constructor(providerConfig) {
        this.config = providerConfig;
        // Simplified API Key mapping based on new business rule
        this.apiKey = providerConfig.credentials.apiKey; 
        this.baseUrl = providerConfig.baseUrl;
        
        // Find the active/default model
        this.model = providerConfig.models.find(m => m.isActive && m.isDefault) 
                  || providerConfig.models[0];
    }

    /**
     * @param {Array} messages - Array of message objects { role: 'system'|'user'|'assistant', content: '...' }
     * @param {Object} options - inferenceConfig like temperature, maxTokens
     * @returns {Object} { content: '...', promptTokens: 0, completionTokens: 0 }
     */
    async generateChatResponse(messages, options = {}) {
        throw new Error('generateChatResponse() must be implemented by the specific AI adapter');
    }
}

module.exports = BaseAiAdapter;