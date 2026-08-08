/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const express = require('express');
const templateService = require('../../services/notificationTemplate.service');
const validate = require('../../middlewares/validate.middleware');
const templateValidation = require('../../validations/notificationTemplate.validation');
const { isAuthenticated } = require('../../middlewares/auth.middleware');
const { restrictToRoles } = require('../../middlewares/role.middleware');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

const router = express.Router();

// ==========================================
// Protected Admin Routes (No public routes needed for this engine)
// ==========================================
router.use(isAuthenticated, restrictToRoles('super_admin', 'admin'));

router.get('/admin', asyncHandler(async (req, res) => {
    const templates = await templateService.getAdminList();
    res.status(200).json(new ApiResponse(200, templates, "Notification templates fetched"));
}));

router.post('/admin', validate(templateValidation.createUpdateTemplateSchema, 'body'), asyncHandler(async (req, res) => {
    const template = await templateService.createNewTemplate(req.body);
    res.status(201).json(new ApiResponse(201, template, "Template created successfully"));
}));

router.put('/admin/:id', validate(templateValidation.createUpdateTemplateSchema, 'body'), asyncHandler(async (req, res) => {
    const template = await templateService.updateTemplate(req.params.id, req.body);
    res.status(200).json(new ApiResponse(200, template, "Template updated successfully"));
}));

router.delete('/admin/:id', asyncHandler(async (req, res) => {
    await templateService.deleteTemplate(req.params.id);
    res.status(200).json(new ApiResponse(200, null, "Template deleted successfully"));
}));

module.exports = router;