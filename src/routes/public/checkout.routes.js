/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const express = require('express');
const router = express.Router();
const checkoutController = require('../../controllers/order/checkout.controller');
const { requireAuth } = require('../../middlewares/auth.middleware');

// Checkout requires the user to be logged in
router.post('/', requireAuth, checkoutController.placeOrder);

module.exports = router;