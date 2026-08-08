/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const express = require('express');
const router = express.Router();
const reviewQueueController = require('../../controllers/admin/reviewQueue.controller');
const { requireAuth, requireAdmin } = require('../../middlewares/auth.middleware');

router.use(requireAuth, requireAdmin);

router.post('/:productId/approve', reviewQueueController.approveProduct);
router.post('/:productId/ignore', reviewQueueController.ignoreChanges);
router.post('/bulk-approve', reviewQueueController.bulkApprove);

module.exports = router;