/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const Joi = require('joi');

const identityValidation = {
    updateIdentitySchema: Joi.object({
        websiteName: Joi.string().max(100).required().messages({
            'string.empty': 'Website name is required',
            'any.required': 'Website name is required'
        }),
        shortName: Joi.string().max(50).allow('', null),
        tagline: Joi.string().max(200).allow('', null),
        description: Joi.string().max(500).allow('', null),
        defaultLanguage: Joi.string().max(10).allow('', null)
    })
};

module.exports = identityValidation;