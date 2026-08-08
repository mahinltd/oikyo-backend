/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const aiRegistry = require('./aiProviderRegistry.service');
const aiFactory = require('./aiFactory.service');
const AiErrorLog = require('../../models/ai/aiErrorLog.model');

class AiGatewayService {
    
    /**
     * The single entry point for all AI interactions in the platform.
     * Handles routing, execution, failover, and basic error logging.
     */
    async executeChat(messages, options = {}) {
        // 1. Get Decrypted & Sorted Providers from Redis/DB
        const providers = await aiRegistry.getActiveProvidersChain();
        
        if (!providers || providers.length === 0) {
            throw new Error('No active AI providers available in the system.');
        }

        // 2. Iterate through providers (Failover Chain)
        let lastError = null;

        for (const provider of providers) {
            try {
                // Initialize the specific Adapter
                const adapter = aiFactory.createAdapter(provider);
                
                // Execute API Call
                const response = await adapter.generateChatResponse(messages, options);
                
                // Note: In a background task, you would update the usageMetrics here
                return response;

            } catch (error) {
                lastError = error.message;
                
                // Log the error decoupled from the main provider model
                await AiErrorLog.create({
                    providerId: provider._id,
                    providerCode: provider.providerCode,
                    modelCode: provider.models.find(m => m.isDefault)?.modelCode,
                    errorMessage: error.message,
                    requestSummary: 'Chat execution failed during gateway routing'
                });

                console.warn(`[AI Gateway] Provider '${provider.providerCode}' failed. Attempting failover...`);
                // Continue to the next provider in the chain
            }
        }

        // If loop completes without returning, all providers failed
        throw new Error(`AI Gateway Execution Failed. All fallback providers exhausted. Last Error: ${lastError}`);
    }
}

module.exports = new AiGatewayService();