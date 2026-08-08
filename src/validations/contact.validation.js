/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const Joi = require('joi');

const contactValidation = {
    updateContactSchema: Joi.object({
        supportEmail: Joi.string().email().allow('', null).messages({
            'string.email': 'Please provide a valid support email address'
        }),
        supportPhone: Joi.string().max(20).allow('', null),
        corporateAddress: Joi.string().max(300).allow('', null),
        workingHours: Joi.string().max(100).allow('', null),
        googleMapLink: Joi.string().uri().allow('', null),
        socialLinks: Joi.array().items(
            Joi.object({
                platform: Joi.string().required(),
                url: Joi.string().uri().required(),
                isActive: Joi.boolean().default(true)
            })
        ).optional()
    })
};

module.exports = contactValidation;