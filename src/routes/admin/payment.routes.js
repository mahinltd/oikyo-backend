/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const express = require('express');
const router = express.Router();
const paymentVerificationController = require('../../controllers/payment/paymentVerification.controller');
const { requireAuth } = require('../../middlewares/auth.middleware');
const { restrictToRoles } = require('../../middlewares/role.middleware'); // Fixed import

// Protect all routes for Admins
router.use(requireAuth, restrictToRoles('super_admin', 'admin', 'manager'));

// Verify manual payment
router.patch('/:orderId/verify', paymentVerificationController.verifyManualPayment);

module.exports = router;