/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const express = require('express');
const router = express.Router();
const notificationPreferenceController = require('../../controllers/communication/notificationPreference.controller');
const { isAuthenticated } = require('../../middlewares/auth.middleware');

router.use(isAuthenticated);
router.get('/', notificationPreferenceController.getMyPreferences);
router.patch('/', notificationPreferenceController.updateMyPreferences);

module.exports = router;
