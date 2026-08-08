/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const BaseAiAdapter = require('./base.adapter');
const axios = require('axios'); // Assuming axios is installed

class GeminiAdapter extends BaseAiAdapter {
    async generateChatResponse(messages, options = {}) {
        // Map standard OpenAI-style messages to Gemini format
        const systemInstruction = messages.find(m => m.role === 'system')?.content || '';
        const geminiContents = messages
            .filter(m => m.role !== 'system')
            .map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }]
            }));

        const payload = {
            contents: geminiContents,
            generationConfig: {
                temperature: options.temperature ?? this.config.inferenceConfig.temperature,
                maxOutputTokens: options.maxTokens ?? this.config.inferenceConfig.maxTokens
            }
        };

        if (systemInstruction) {
            payload.systemInstruction = { parts: [{ text: systemInstruction }] };
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model.modelCode}:generateContent?key=${this.apiKey}`;
        
        try {
            const response = await axios.post(url, payload);
            const data = response.data;
            
            return {
                content: data.candidates[0].content.parts[0].text,
                promptTokens: data.usageMetadata?.promptTokenCount || 0,
                completionTokens: data.usageMetadata?.candidatesTokenCount || 0
            };
        } catch (error) {
            const errorMsg = error.response?.data?.error?.message || error.message;
            throw new Error(`Gemini API Error: ${errorMsg}`);
        }
    }
}

module.exports = GeminiAdapter;