/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/admin/dashboard.controller');
const { requireAuth } = require('../../middlewares/auth.middleware');
const { restrictToRoles } = require('../../middlewares/role.middleware'); // Fixed import

// Protect routes: Only Admin, Super Admin, and Manager can view analytics
router.use(requireAuth, restrictToRoles('super_admin', 'admin', 'manager'));

router.get('/stats', dashboardController.getAnalytics);

module.exports = router;