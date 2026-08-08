/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const Joi = require('joi');

const cmsValidation = {
    createUpdatePageSchema: Joi.object({
        title: Joi.string().required(),
        slug: Joi.string().required(), // Admin can define custom slugs
        content: Joi.string().required(),
        pageType: Joi.string().valid('policy', 'information', 'landing_page', 'custom').optional(),
        status: Joi.string().valid('published', 'draft', 'archived').optional(),
        seo: Joi.object({
            metaTitle: Joi.string().allow('', null),
            metaDescription: Joi.string().allow('', null),
            keywords: Joi.string().allow('', null)
        }).optional()
    })
};

module.exports = cmsValidation;