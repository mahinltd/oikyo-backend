/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const Joi = require('joi');

const themeValidation = {
    createThemeSchema: Joi.object({
        themeName: Joi.string().required(),
        version: Joi.string().optional(),
        colors: Joi.object({
            primary: Joi.string(),
            secondary: Joi.string(),
            accent: Joi.string(),
            background: Joi.string(),
            text: Joi.string(),
            border: Joi.string()
        }).optional(),
        typography: Joi.object({
            primaryFont: Joi.string(),
            secondaryFont: Joi.string(),
            baseFontSize: Joi.string()
        }).optional(),
        components: Joi.object({
            buttonStyle: Joi.string().valid('rounded', 'sharp', 'pill'),
            inputStyle: Joi.string().valid('outlined', 'filled', 'underlined')
        }).optional(),
        layout: Joi.object({
            containerMaxWidth: Joi.string(),
            gridStyle: Joi.string().valid('comfortable', 'compact')
        }).optional()
    }),

    switchThemeSchema: Joi.object({
        themeId: Joi.string().hex().length(24).required().messages({
            'string.length': 'Invalid Theme ID format'
        })
    })
};

module.exports = themeValidation;