/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const express = require('express');
const themeController = require('../../controllers/theme.controller');
const validate = require('../../middlewares/validate.middleware');
const themeValidation = require('../../validations/theme.validation');
const { isAuthenticated } = require('../../middlewares/auth.middleware');
const { restrictToRoles } = require('../../middlewares/role.middleware');

const router = express.Router();

// ==========================================
// Public Routes (Frontend use)
// ==========================================
router.get('/active', themeController.getActiveTheme);

// ==========================================
// Protected Admin Routes
// ==========================================
// Apply Auth and Role checks for all routes below this line
router.use(isAuthenticated, restrictToRoles('super_admin', 'admin'));

router.get('/all', themeController.getAllThemes);

router.post(
    '/create',
    validate(themeValidation.createThemeSchema, 'body'),
    themeController.createTheme
);

router.put(
    '/update/:id',
    validate(themeValidation.createThemeSchema, 'body'), // Reuse schema
    themeController.updateTheme
);

// Special endpoint for Theme Switching
router.post(
    '/switch',
    validate(themeValidation.switchThemeSchema, 'body'),
    themeController.activateTheme
);

module.exports = router;