/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const Joi = require('joi');

const seoValidation = {
    updateSeoSchema: Joi.object({
        metaTitle: Joi.string().max(100).required(),
        metaDescription: Joi.string().max(250).required(),
        keywords: Joi.string().allow('', null),
        ogTitle: Joi.string().max(100).allow('', null),
        ogDescription: Joi.string().max(250).allow('', null),
        ogImage: Joi.string().uri().allow('', null),
        twitterHandle: Joi.string().allow('', null)
    })
};

module.exports = seoValidation;