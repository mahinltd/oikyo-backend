/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const Joi = require('joi');

const authValidation = {
    registerSchema: Joi.object({
        fullName: Joi.string().max(100).required().messages({
            'string.empty': 'Full name is required',
            'any.required': 'Full name is required'
        }),
        mobile: Joi.string().pattern(/^[0-9]{10,15}$/).required().messages({
            'string.pattern.base': 'Please provide a valid mobile number',
            'any.required': 'Mobile number is required'
        }),
        email: Joi.string().email().required().messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
        password: Joi.string().min(8).required().messages({
            'string.min': 'Password must be at least 8 characters long',
            'any.required': 'Password is required'
        })
    }),

    loginSchema: Joi.object({
        identifier: Joi.string().required().messages({
            'string.empty': 'Email or mobile number is required',
            'any.required': 'Email or mobile number is required'
        }),
        password: Joi.string().required().messages({
            'string.empty': 'Password is required',
            'any.required': 'Password is required'
        })
    }),

    verifyEmailSchema: Joi.object({
        token: Joi.string().required().messages({
            'string.empty': 'Verification token is required',
            'any.required': 'Verification token is required'
        })
    }),

    forgotPasswordSchema: Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        })
    }),

    resetPasswordSchema: Joi.object({
        token: Joi.string().required().messages({
            'string.empty': 'Reset token is required',
            'any.required': 'Reset token is required'
        }),
        newPassword: Joi.string().min(8).required().messages({
            'string.min': 'New password must be at least 8 characters long',
            'any.required': 'New password is required'
        })
    })
};

module.exports = authValidation;