/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const BaseAiAdapter = require('./base.adapter');
const axios = require('axios');

class OpenAiCompatibleAdapter extends BaseAiAdapter {
    async generateChatResponse(messages, options = {}) {
        const payload = {
            model: this.model.modelCode,
            messages: messages,
            temperature: options.temperature ?? this.config.inferenceConfig.temperature,
            max_tokens: options.maxTokens ?? this.config.inferenceConfig.maxTokens
        };

        const headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };

        // OpenRouter specific headers (Optional but recommended)
        if (this.config.providerCode === 'openrouter') {
            headers['HTTP-Referer'] = 'https://oikyo.me'; // Your verified platform URL
            headers['X-Title'] = 'OIKYO Commerce Platform';
        }

        try {
            const response = await axios.post(this.baseUrl, payload, { headers });
            const data = response.data;
            
            return {
                content: data.choices[0].message.content,
                promptTokens: data.usage?.prompt_tokens || 0,
                completionTokens: data.usage?.completion_tokens || 0
            };
        } catch (error) {
            const errorMsg = error.response?.data?.error?.message || error.message;
            throw new Error(`OpenAI/OpenRouter API Error: ${errorMsg}`);
        }
    }
}

module.exports = OpenAiCompatibleAdapter;