/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const express = require('express');
const widgetController = require('../../controllers/homepageWidget.controller');
const validate = require('../../middlewares/validate.middleware');
const homepageValidation = require('../../validations/homepage.validation');
const { isAuthenticated } = require('../../middlewares/auth.middleware');
const { restrictToRoles } = require('../../middlewares/role.middleware');

const router = express.Router();

// ==========================================
// Public Routes (Frontend use)
// ==========================================
router.get('/layout', widgetController.getPublicLayout);

// ==========================================
// Protected Admin Routes
// ==========================================
router.use(isAuthenticated, restrictToRoles('super_admin', 'admin'));

router.get('/admin/layout', widgetController.getAdminLayout);
router.post('/widget', validate(homepageValidation.createUpdateWidgetSchema, 'body'), widgetController.createWidget);
router.put('/widget/:id', validate(homepageValidation.createUpdateWidgetSchema, 'body'), widgetController.updateWidget);
router.delete('/widget/:id', widgetController.deleteWidget);

// Drag and drop reorder endpoint
router.post('/reorder', validate(homepageValidation.reorderSchema, 'body'), widgetController.reorderWidgets);

module.exports = router;