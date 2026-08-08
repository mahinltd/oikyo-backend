/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const Joi = require('joi');

const aiValidation = {
    createUpdateProviderSchema: Joi.object({
        providerName: Joi.string().required(),
        providerCode: Joi.string().required(),
        apiVersion: Joi.string().optional(),
        baseUrl: Joi.string().uri().allow('', null).optional(),
        credentials: Joi.object().pattern(Joi.string(), Joi.string()).required(),
        models: Joi.array().items(
            Joi.object({
                modelCode: Joi.string().required(),
                displayName: Joi.string().required(),
                isDefault: Joi.boolean().default(false),
                isActive: Joi.boolean().default(true),
                contextWindowTokens: Joi.number().required(),
                maxOutputTokens: Joi.number().required()
            })
        ).min(1).required(),
        status: Joi.string().valid('active', 'inactive', 'maintenance').optional(),
        isEnabled: Joi.boolean().optional(),
        priority: Joi.number().optional()
    }),

    askAssistantSchema: Joi.object({
        message: Joi.string().max(1000).required().messages({
            'string.empty': 'Please enter a message to ask the assistant.',
            'string.max': 'Message is too long. Please keep it under 1000 characters.'
        }),
        chatHistory: Joi.array().items(
            Joi.object({
                role: Joi.string().valid('user', 'assistant').required(),
                content: Joi.string().required()
            })
        ).optional().default([])
    })
};

module.exports = aiValidation;