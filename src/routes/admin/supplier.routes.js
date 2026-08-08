/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const express = require('express');
const router = express.Router();
const supplierController = require('../../controllers/admin/supplier.controller');
const { requireAuth, requireAdmin } = require('../../middlewares/auth.middleware'); // Assuming auth middlewares exist

// All routes require Admin privileges
router.use(requireAuth, requireAdmin);

router.get('/', supplierController.getAllSuppliers);
router.post('/:supplierId/sync', supplierController.triggerSync);

module.exports = router;