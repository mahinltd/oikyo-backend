/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const express = require('express');
const navigationService = require('../../services/navigation.service');
const validate = require('../../middlewares/validate.middleware');
const navigationValidation = require('../../validations/navigation.validation');
const { isAuthenticated } = require('../../middlewares/auth.middleware');
const { restrictToRoles } = require('../../middlewares/role.middleware');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

const router = express.Router();

// ==========================================
// Public Routes (Frontend use)
// ==========================================
router.get('/header', asyncHandler(async (req, res) => {
    const tree = await navigationService.getPublicHeaderTree();
    res.status(200).json(new ApiResponse(200, tree, "Public header tree fetched"));
}));

router.get('/footer', asyncHandler(async (req, res) => {
    const footer = await navigationService.getPublicFooterLayout();
    res.status(200).json(new ApiResponse(200, footer, "Public footer layout fetched"));
}));

// ==========================================
// Protected Admin Routes
// ==========================================
router.use(isAuthenticated, restrictToRoles('super_admin', 'admin'));

// Header Admin Management
router.get('/admin/header', asyncHandler(async (req, res) => {
    const data = await navigationService.getAdminHeaderList();
    res.status(200).json(new ApiResponse(200, data, "Admin header list fetched"));
}));

router.post('/header', validate(navigationValidation.headerSchema, 'body'), asyncHandler(async (req, res) => {
    const menu = await navigationService.createHeaderMenu(req.body);
    res.status(201).json(new ApiResponse(201, menu, "Header menu created"));
}));

router.put('/header/:id', validate(navigationValidation.headerSchema, 'body'), asyncHandler(async (req, res) => {
    const menu = await navigationService.updateHeaderMenu(req.params.id, req.body);
    res.status(200).json(new ApiResponse(200, menu, "Header menu updated"));
}));

router.delete('/header/:id', asyncHandler(async (req, res) => {
    await navigationService.deleteHeaderMenu(req.params.id);
    res.status(200).json(new ApiResponse(200, null, "Header menu deleted"));
}));

// Footer Admin Management
// (Similar POST, PUT, DELETE for footer applying navigationValidation.footerSchema)

module.exports = router;