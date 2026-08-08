/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const Joi = require('joi');

const featureToggleValidation = {
    createUpdateToggleSchema: Joi.object({
        name: Joi.string().required(),
        slug: Joi.string().required(),
        type: Joi.string().valid('feature', 'module').required(),
        status: Joi.string().valid('enabled', 'beta', 'deprecated', 'disabled').optional(),
        description: Joi.string().allow('', null)
    })
};

module.exports = featureToggleValidation;