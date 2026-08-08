/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const express = require('express');
const router = express.Router();
const fulfillmentController = require('../../controllers/admin/fulfillment.controller');
const { requireAuth, requireAdmin } = require('../../middlewares/auth.middleware');

router.use(requireAuth, requireAdmin);

router.get('/tasks', fulfillmentController.getTasks);
router.patch('/tasks/:taskId/status', fulfillmentController.updateTaskStatus);

module.exports = router;