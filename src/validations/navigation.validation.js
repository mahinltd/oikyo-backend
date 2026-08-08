/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const Joi = require('joi');

const navigationValidation = {
    headerSchema: Joi.object({
        title: Joi.string().required(),
        parentId: Joi.string().hex().length(24).allow(null).optional(),
        linkType: Joi.string().valid('custom_url', 'cms_page', 'catalog_category').required(),
        url: Joi.string().allow('', null),
        referenceId: Joi.string().hex().length(24).allow(null).optional(),
        order: Joi.number().integer().min(0).optional(),
        visibility: Joi.boolean().optional(),
        isMegaMenu: Joi.boolean().optional()
    }),

    footerSchema: Joi.object({
        title: Joi.string().required(),
        order: Joi.number().integer().min(0).optional(),
        visibility: Joi.boolean().optional(),
        links: Joi.array().items(
            Joi.object({
                label: Joi.string().required(),
                url: Joi.string().required(),
                isExternal: Joi.boolean().default(false)
            })
        ).optional()
    })
};

module.exports = navigationValidation;