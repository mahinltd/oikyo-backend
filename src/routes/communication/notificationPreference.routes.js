/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const express = require('express');
const router = express.Router();
const notificationPreferenceController = require('../../controllers/communication/notificationPreference.controller');
const { isAuthenticated } = require('../../middlewares/auth.middleware');
const asyncHandler = require('../../utils/asyncHandler');

// All routes require authentication
router.use(isAuthenticated);

// Get user's notification preferences
router.get('/', asyncHandler(async (req, res) => {
    await notificationPreferenceController.getUserPreferences(req, res, (err) => {
        throw err;
    });
}));

// Update user's notification preferences
router.patch('/', asyncHandler(async (req, res) => {
    await notificationPreferenceController.updateUserPreferences(req, res, (err) => {
        throw err;
    });
}));

module.exports = router;
