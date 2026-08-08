/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const express = require('express');
const seoService = require('../../services/seo.service');
const validate = require('../../middlewares/validate.middleware');
const seoValidation = require('../../validations/seo.validation');
const { isAuthenticated } = require('../../middlewares/auth.middleware');
const { restrictToRoles } = require('../../middlewares/role.middleware');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

const router = express.Router();

// ==========================================
// Public Route (Frontend uses this in <head>)
// ==========================================
router.get('/', asyncHandler(async (req, res) => {
    const seo = await seoService.getSeoSettings();
    res.status(200).json(new ApiResponse(200, seo, "Global SEO settings fetched"));
}));

// ==========================================
// Protected Admin Route
// ==========================================
router.put(
    '/',
    isAuthenticated,
    restrictToRoles('super_admin', 'admin', 'manager'),
    validate(seoValidation.updateSeoSchema, 'body'),
    asyncHandler(async (req, res) => {
        const updatedSeo = await seoService.updateSeoSettings(req.body);
        res.status(200).json(new ApiResponse(200, updatedSeo, "Global SEO settings updated"));
    })
);

module.exports = router;