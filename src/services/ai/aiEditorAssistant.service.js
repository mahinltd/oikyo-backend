/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const AiPromptTemplate = require('../../models/ai/aiPromptTemplate.model');
const aiGatewayService = require('./aiGateway.service');
const ApiError = require('../../utils/ApiError');

class AiEditorAssistantService {

    /**
     * Executes an AI task for the Product Editor (e.g., Generate SEO, Rewrite Description).
     * @param {String} taskType - The specific task identifier
     * @param {Object} productData - Current product context (Title, Desc, Category)
     */
    async executeTask(taskType, productData) {
        // 1. Fetch Dynamic Template
        const template = await AiPromptTemplate.findOne({ taskType, isActive: true });
        if (!template) {
            throw new ApiError(404, `Active prompt template for task '${taskType}' not found.`);
        }

        // 2. Hydrate Template with Context Variables
        let userPrompt = template.userPromptTemplate;
        userPrompt = userPrompt.replace('{{title}}', productData.title || '');
        userPrompt = userPrompt.replace('{{description}}', productData.description || '');
        userPrompt = userPrompt.replace('{{category}}', productData.categoryName || 'General');

        // 3. Construct Gateway Payload
        const messages = [
            { role: 'system', content: template.systemPrompt },
            { role: 'user', content: userPrompt }
        ];

        // Ensure JSON response if configured
        if (template.expectedOutputFormat === 'json') {
            messages[0].content += `\n\nCRITICAL RULE: You MUST return the response ONLY as a valid JSON object. Do not include markdown code blocks (\`\`\`json) or any other text.`;
        }

        const options = {
            temperature: 0.4, // Balanced for creativity and structure
            maxTokens: 1000
        };

        // 4. Execute via Enterprise Gateway (Handles Fallback/Routing automatically)
        const response = await aiGatewayService.executeChat(messages, options);

        // 5. Parse and Return
        if (template.expectedOutputFormat === 'json') {
            try {
                // Strip potential markdown wrappers just in case AI ignores the rule
                let cleanJsonStr = response.content.replace(/```json/gi, '').replace(/```/g, '').trim();
                const parsedJson = JSON.parse(cleanJsonStr);
                return parsedJson;
            } catch (error) {
                console.error('[AI Assistant] JSON Parse Failed:', response.content);
                throw new ApiError(500, 'AI failed to generate a valid JSON structure.');
            }
        }

        return { result: response.content };
    }
}

module.exports = new AiEditorAssistantService();