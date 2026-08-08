/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const express = require('express');
const localizationService = require('../../services/localization.service');
const validate = require('../../middlewares/validate.middleware');
const localizationValidation = require('../../validations/localization.validation');
const { isAuthenticated } = require('../../middlewares/auth.middleware');
const { restrictToRoles } = require('../../middlewares/role.middleware');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

const router = express.Router();

// ==========================================
// Public Routes (Frontend use)
// ==========================================
router.get('/active', asyncHandler(async (req, res) => {
    const languages = await localizationService.getAvailableLanguages();
    res.status(200).json(new ApiResponse(200, languages, "Available languages fetched"));
}));

router.get('/dictionary/:code', asyncHandler(async (req, res) => {
    // If no code is provided, service returns the default language
    const data = await localizationService.getTranslations(req.params.code);
    res.status(200).json(new ApiResponse(200, data, "Translations fetched successfully"));
}));

// ==========================================
// Protected Admin Routes
// ==========================================
router.use(isAuthenticated, restrictToRoles('super_admin', 'admin', 'manager'));

router.post('/admin', validate(localizationValidation.createUpdateLanguageSchema, 'body'), asyncHandler(async (req, res) => {
    const language = await localizationService.createLanguage(req.body);
    res.status(201).json(new ApiResponse(201, language, "Language created successfully"));
}));

router.put('/admin/:id', validate(localizationValidation.createUpdateLanguageSchema, 'body'), asyncHandler(async (req, res) => {
    const language = await localizationService.updateLanguage(req.params.id, req.body);
    res.status(200).json(new ApiResponse(200, language, "Language updated successfully"));
}));

module.exports = router;