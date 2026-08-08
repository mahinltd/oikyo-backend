/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const express = require('express');
const router = express.Router();
const publicProductController = require('../../controllers/public/product.controller');
const { cacheData } = require('../../middlewares/cache.middleware');

// Cache product listings and search results for 5 minutes (300 seconds)
router.get('/', cacheData(300), publicProductController.getProducts);

// Cache individual product details for 10 minutes (600 seconds)
router.get('/:slug', cacheData(600), publicProductController.getProductDetails);

module.exports = router;