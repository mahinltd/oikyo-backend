/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const express = require('express');
const router = express.Router();
const customerPortalController = require('../../controllers/user/customerPortal.controller');
const { requireAuth } = require('../../middlewares/auth.middleware');

// ALL routes here require the user to be logged in
router.use(requireAuth);

router.get('/profile', customerPortalController.getMyProfile);
router.get('/orders', customerPortalController.getMyOrders);
router.get('/orders/:orderNumber', customerPortalController.getSingleOrderDetails);

module.exports = router;