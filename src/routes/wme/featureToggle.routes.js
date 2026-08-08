/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const express = require('express');
const toggleService = require('../../services/featureToggle.service');
const validate = require('../../middlewares/validate.middleware');
const toggleValidation = require('../../validations/featureToggle.validation');
const { isAuthenticated } = require('../../middlewares/auth.middleware');
const { restrictToRoles } = require('../../middlewares/role.middleware');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

const router = express.Router();

// ==========================================
// Public Route (Frontend calls this on app load)
// ==========================================
router.get('/config', asyncHandler(async (req, res) => {
    const config = await toggleService.getPublicConfiguration();
    res.status(200).json(new ApiResponse(200, config, "Public feature configuration fetched"));
}));

// ==========================================
// Protected Admin Routes
// ==========================================
router.use(isAuthenticated, restrictToRoles('super_admin', 'admin'));

router.get('/admin', asyncHandler(async (req, res) => {
    const toggles = await toggleService.getAdminList();
    res.status(200).json(new ApiResponse(200, toggles, "Admin toggle list fetched"));
}));

router.post('/admin', validate(toggleValidation.createUpdateToggleSchema, 'body'), asyncHandler(async (req, res) => {
    const toggle = await toggleService.createNewToggle(req.body);
    res.status(201).json(new ApiResponse(201, toggle, "New feature toggle created"));
}));

router.put('/admin/:id', validate(toggleValidation.createUpdateToggleSchema, 'body'), asyncHandler(async (req, res) => {
    const toggle = await toggleService.updateToggle(req.params.id, req.body);
    res.status(200).json(new ApiResponse(200, toggle, "Feature toggle updated"));
}));

router.delete('/admin/:id', asyncHandler(async (req, res) => {
    await toggleService.deleteToggle(req.params.id);
    res.status(200).json(new ApiResponse(200, null, "Feature toggle deleted"));
}));

module.exports = router;