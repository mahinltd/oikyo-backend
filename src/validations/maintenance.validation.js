/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const Joi = require('joi');

const maintenanceValidation = {
    updateMaintenanceSchema: Joi.object({
        isActive: Joi.boolean().required(),
        message: Joi.string().max(300).required(),
        expectedLiveTime: Joi.date().iso().greater('now').allow(null).messages({
            'date.greater': 'Expected live time must be a future date and time'
        }),
        bypassToken: Joi.string().alphanum().min(6).max(20).allow('', null)
    })
};

module.exports = maintenanceValidation;