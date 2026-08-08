/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const express = require('express');
const router = express.Router();
const fcmTokenController = require('../../controllers/communication/fcmToken.controller');
const { isAuthenticated } = require('../../middlewares/auth.middleware');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

// All routes require authentication
router.use(isAuthenticated);

// Register FCM token
router.post('/register', asyncHandler(async (req, res) => {
    await fcmTokenController.registerToken(req, res, (err) => {
        throw err;
    });
}));

// Unregister FCM token
router.delete('/unregister', asyncHandler(async (req, res) => {
    await fcmTokenController.unregisterToken(req, res, (err) => {
        throw err;
    });
}));

// Get user's FCM tokens
router.get('/tokens', asyncHandler(async (req, res) => {
    await fcmTokenController.getUserTokens(req, res, (err) => {
        throw err;
    });
}));

module.exports = router;