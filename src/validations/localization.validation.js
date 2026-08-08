/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const Joi = require('joi');

const localizationValidation = {
    createUpdateLanguageSchema: Joi.object({
        languageCode: Joi.string().min(2).max(10).required(),
        languageName: Joi.string().required(),
        currency: Joi.object({
            code: Joi.string().length(3).required(),
            symbol: Joi.string().required(),
            placement: Joi.string().valid('left', 'right').required()
        }).optional(),
        timezone: Joi.string().optional(),
        format: Joi.object({
            date: Joi.string().required(),
            time: Joi.string().valid('12h', '24h').required(),
            numberLocale: Joi.string().required()
        }).optional(),
        isDefault: Joi.boolean().optional(),
        isActive: Joi.boolean().optional(),
        translations: Joi.object().pattern(Joi.string(), Joi.string()).optional()
    })
};

module.exports = localizationValidation;