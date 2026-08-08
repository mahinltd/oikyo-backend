/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const express = require('express');
const globalAssetController = require('../../controllers/globalAsset.controller');
const validate = require('../../middlewares/validate.middleware');
const globalAssetValidation = require('../../validations/globalAsset.validation');
const { isAuthenticated } = require('../../middlewares/auth.middleware');
const { restrictToRoles } = require('../../middlewares/role.middleware');

const router = express.Router();

// Public Route: Frontend requests to get logos and shared assets
router.get('/', globalAssetController.getAssets);

// Protected Admin Route: Only admins can configure global assets
router.put(
    '/',
    isAuthenticated,
    restrictToRoles('super_admin', 'admin'),
    validate(globalAssetValidation.updateAssetSchema, 'body'),
    globalAssetController.updateAssets
);

module.exports = router;