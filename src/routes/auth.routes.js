/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const authValidation = require('../validations/auth.validation');

const router = express.Router();

// Rate Limiter for Authentication Routes to prevent Brute-Force Attacks.
// Keep the default high enough for production-like workflow audits and
// operator-driven sessions that exercise multiple token lifecycle events.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: Number(process.env.AUTH_RATE_LIMIT_MAX || 60),
    message: {
        success: false,
        message: 'Too many authentication attempts from this IP, please try again after 15 minutes'
    }
});

// Apply rate limiter to all auth routes
router.use(authLimiter);

// -----------------------------------------
// Authentication Endpoints
// -----------------------------------------

router.post('/register', validate(authValidation.registerSchema, 'body'), authController.register);

router.post('/login', validate(authValidation.loginSchema, 'body'), authController.login);

router.post('/verify-email', validate(authValidation.verifyEmailSchema, 'body'), authController.verifyEmail);

router.post('/forgot-password', validate(authValidation.forgotPasswordSchema, 'body'), authController.forgotPassword);

router.post('/reset-password', validate(authValidation.resetPasswordSchema, 'body'), authController.resetPassword);

module.exports = router;