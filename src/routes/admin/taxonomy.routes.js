/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const express = require('express');
const router = express.Router();
const taxonomyController = require('../../controllers/admin/taxonomy.controller');
const { requireAuth, requireAdmin } = require('../../middlewares/auth.middleware');

router.use(requireAuth, requireAdmin);

// Category Routes
router.post('/categories', taxonomyController.createCategory);
router.get('/categories', taxonomyController.getAllCategories);
router.put('/categories/:id', taxonomyController.updateCategory);

// Brand Routes
router.post('/brands', taxonomyController.createBrand);
router.get('/brands', taxonomyController.getAllBrands);
router.put('/brands/:id', taxonomyController.updateBrand);

module.exports = router;