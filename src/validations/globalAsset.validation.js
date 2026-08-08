/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const Joi = require('joi');

const globalAssetValidation = {
    updateAssetSchema: Joi.object({
        primaryLogo: Joi.string().uri().allow('', null).messages({
            'string.uri': 'Primary logo must be a valid URL'
        }),
        textLogo: Joi.string().uri().allow('', null),
        footerLogo: Joi.string().uri().allow('', null),
        favicon: Joi.string().uri().allow('', null),
        defaultProductImage: Joi.string().uri().allow('', null),
        defaultAvatar: Joi.string().uri().allow('', null),
        paymentIcons: Joi.array().items(
            Joi.object({
                name: Joi.string().required(),
                url: Joi.string().uri().required(),
                isActive: Joi.boolean().default(true)
            })
        ).optional()
    })
};

module.exports = globalAssetValidation;