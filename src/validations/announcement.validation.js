/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const Joi = require('joi');

const announcementValidation = {
    updateAnnouncementSchema: Joi.object({
        message: Joi.string().max(150).required(),
        link: Joi.string().allow('', null),
        backgroundColor: Joi.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).messages({
            'string.pattern.base': 'Background color must be a valid HEX code (e.g., #000000)'
        }).optional(),
        textColor: Joi.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
        isActive: Joi.boolean().optional(),
        schedule: Joi.object({
            startTime: Joi.date().iso().allow(null),
            endTime: Joi.date().iso().greater(Joi.ref('startTime')).allow(null)
        }).optional()
    })
};

module.exports = announcementValidation;