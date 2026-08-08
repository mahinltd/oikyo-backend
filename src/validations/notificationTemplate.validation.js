/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const Joi = require('joi');

const notificationTemplateValidation = {
    createUpdateTemplateSchema: Joi.object({
        name: Joi.string().required(),
        type: Joi.string().valid('email', 'push', 'sms').required(),
        templateGroup: Joi.string().valid('authentication', 'orders', 'products', 'marketing', 'system', 'payment', 'custom').required(),
        eventKey: Joi.string().required(),
        subject: Joi.string().allow('', null).when('type', {
            is: 'email',
            then: Joi.required()
        }),
        body: Joi.string().required(),
        variables: Joi.array().items(Joi.string()).optional(),
        isActive: Joi.boolean().optional()
    })
};

module.exports = notificationTemplateValidation;