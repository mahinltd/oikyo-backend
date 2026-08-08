/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const express = require('express');
const coAssistantController = require('../../controllers/storefront/coAssistant.controller');
const validate = require('../../middlewares/validate.middleware');
const { askAssistantSchema } = require('../../validations/ai.validation');

const router = express.Router();

// Public route for customers (Should be protected by Rate Limiter in production)
router.post('/ask', validate(askAssistantSchema, 'body'), coAssistantController.askQuestion);

module.exports = router;