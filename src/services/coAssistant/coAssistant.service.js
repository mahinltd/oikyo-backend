/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const aiGateway = require('../ai/aiGateway.service');

// Strictly constraints the AI to act ONLY as OIKYO's Domain-Specific Commerce Assistant
const OIKYO_DOMAIN_GUARD_PROMPT = `
You are the OIKYO Co-Assistant, an exclusive domain-specific enterprise commerce assistant for the OIKYO Platform. 
Your SOLE purpose is to assist users with:
- Website navigation and features
- Product information, categories, and availability
- Order processing, shipping, and delivery
- Payment methods and policies
- OIKYO FAQ and Customer Support workflows

STRICT DOMAIN BOUNDARIES:
1. You MUST NOT answer any questions related to general knowledge, history, science, politics, or news.
2. You MUST NOT write code, solve mathematical equations, or perform programming tasks.
3. If a user asks anything outside the OIKYO commerce domain, you must politely decline and state: "I am the OIKYO Co-Assistant. I am specially trained to assist you only with OIKYO products, orders, and platform services. How can I help you with your shopping today?"
4. Always maintain a professional, helpful, and concise tone.
5. You represent the OIKYO brand. Never provide unverified external links.
`;

class CoAssistantService {
    
    /**
     * Handles customer inquiries strictly within the OIKYO domain.
     * @param {String} userMessage - The customer's message
     * @param {Array} chatHistory - Previous chat context (optional)
     */
    async handleCustomerQuery(userMessage, chatHistory = []) {
        
        // 1. Construct the secure prompt with the Domain Guard
        const messages = [
            { role: 'system', content: OIKYO_DOMAIN_GUARD_PROMPT },
            ...chatHistory,
            { role: 'user', content: userMessage }
        ];

        // 2. Options can be dynamically adjusted (e.g., lower temperature for strict factual answers)
        const options = {
            temperature: 0.3, // Low temperature to reduce hallucination and keep answers focused
            maxTokens: 500
        };

        // 3. Delegate to the AI Gateway (Provider Agnostic)
        try {
            const aiResponse = await aiGateway.executeChat(messages, options);
            return {
                success: true,
                reply: aiResponse.content
            };
        } catch (error) {
            console.error('Co-Assistant Gateway Error:', error);
            return {
                success: false,
                reply: "I apologize, but our support system is currently undergoing maintenance. Please try again later or contact our live support team."
            };
        }
    }
}

module.exports = new CoAssistantService();