/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const express = require('express');
const cmsService = require('../../services/cms.service');
const validate = require('../../middlewares/validate.middleware');
const cmsValidation = require('../../validations/cms.validation');
const { isAuthenticated } = require('../../middlewares/auth.middleware');
const { restrictToRoles } = require('../../middlewares/role.middleware');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

const router = express.Router();

// ==========================================
// Public Routes (Frontend use)
// ==========================================
// Matches routes like /api/v1/wme/cms/page/privacy-policy
router.get('/page/:slug', asyncHandler(async (req, res) => {
    const page = await cmsService.getPageBySlug(req.params.slug);
    res.status(200).json(new ApiResponse(200, page, "Page content fetched successfully"));
}));

// ==========================================
// Protected Admin Routes
// ==========================================
router.use(isAuthenticated, restrictToRoles('super_admin', 'admin', 'manager'));

router.get('/admin/pages', asyncHandler(async (req, res) => {
    const pages = await cmsService.getAllPages();
    res.status(200).json(new ApiResponse(200, pages, "All pages fetched for admin"));
}));

router.post('/admin/page', validate(cmsValidation.createUpdatePageSchema, 'body'), asyncHandler(async (req, res) => {
    const page = await cmsService.createNewPage(req.body);
    res.status(201).json(new ApiResponse(201, page, "New page created successfully"));
}));

router.put('/admin/page/:id', validate(cmsValidation.createUpdatePageSchema, 'body'), asyncHandler(async (req, res) => {
    const page = await cmsService.updatePage(req.params.id, req.body);
    res.status(200).json(new ApiResponse(200, page, "Page updated and previous version saved"));
}));

router.delete('/admin/page/:id', asyncHandler(async (req, res) => {
    await cmsService.deletePage(req.params.id);
    res.status(200).json(new ApiResponse(200, null, "Page deleted successfully"));
}));

// --- Content Versioning Routes ---
router.get('/admin/page/:id/versions', asyncHandler(async (req, res) => {
    const versions = await cmsService.getVersions(req.params.id);
    res.status(200).json(new ApiResponse(200, versions, "Page version history fetched"));
}));

router.post('/admin/page/:pageId/restore/:versionId', asyncHandler(async (req, res) => {
    const restoredPage = await cmsService.restoreVersion(req.params.pageId, req.params.versionId);
    res.status(200).json(new ApiResponse(200, restoredPage, "Page successfully restored to previous version"));
}));

module.exports = router;