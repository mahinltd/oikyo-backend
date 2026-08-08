/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const ApiError = require('../../utils/ApiError');
const GeminiAdapter = require('./adapters/gemini.adapter');
const OpenAiCompatibleAdapter = require('./adapters/openAiCompatible.adapter');

class AiFactory {
    createAdapter(providerConfig) {
        if (!providerConfig || !providerConfig.providerCode) {
            throw new ApiError(500, 'Invalid provider configuration passed to AI Factory.');
        }

        const code = providerConfig.providerCode.toLowerCase();
        const baseUrl = (providerConfig.baseUrl || '').toLowerCase();

        switch (code) {
            case 'gemini':
                return new GeminiAdapter(providerConfig);
            case 'openrouter':
            case 'openai':
            case 'deepseek':
            case 'grok':
                // All these use standard OpenAI Chat Completions API format
                return new OpenAiCompatibleAdapter(providerConfig);
            default:
                // Runtime provider records may carry a providerCode that is not a
                // vendor enum but still exercise an OpenAI-compatible endpoint. The
                // looser default keeps the gateway failover chain alive instead of
                // crashing the entire assistant pipeline on a lookup-only code name.
                if (baseUrl.includes('/v1/chat/completions') || baseUrl.includes('/chat/completions')) {
                    return new OpenAiCompatibleAdapter(providerConfig);
                }
                throw new ApiError(501, `AI Adapter for provider '${code}' is not implemented yet.`);
        }
    }
}

module.exports = new AiFactory();