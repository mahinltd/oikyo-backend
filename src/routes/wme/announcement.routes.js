/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const express = require('express');
const announcementService = require('../../services/announcement.service');
const validate = require('../../middlewares/validate.middleware');
const announcementValidation = require('../../validations/announcement.validation');
const { isAuthenticated } = require('../../middlewares/auth.middleware');
const { restrictToRoles } = require('../../middlewares/role.middleware');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

const router = express.Router();

// ==========================================
// Public Route (Used by Frontend Top Bar)
// ==========================================
router.get('/active', asyncHandler(async (req, res) => {
    const announcement = await announcementService.getActiveAnnouncement();
    res.status(200).json(new ApiResponse(200, announcement, "Active announcement fetched"));
}));

// ==========================================
// Protected Admin Routes
// ==========================================
router.use(isAuthenticated, restrictToRoles('super_admin', 'admin', 'manager'));

router.get('/admin', asyncHandler(async (req, res) => {
    const config = await announcementService.getAdminConfig();
    res.status(200).json(new ApiResponse(200, config, "Announcement configuration fetched"));
}));

router.put('/admin', validate(announcementValidation.updateAnnouncementSchema, 'body'), asyncHandler(async (req, res) => {
    const updatedConfig = await announcementService.updateAnnouncement(req.body);
    res.status(200).json(new ApiResponse(200, updatedConfig, "Announcement updated successfully"));
}));

module.exports = router;