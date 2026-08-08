/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const express = require('express');
const aiProviderController = require('../../controllers/admin/aiProvider.controller');
const validate = require('../../middlewares/validate.middleware');
const { createUpdateProviderSchema } = require('../../validations/ai.validation');
const { isAuthenticated } = require('../../middlewares/auth.middleware');
const { restrictToRoles } = require('../../middlewares/role.middleware');

const router = express.Router();

// Strictly restricted to super_admin due to API Key management
router.use(isAuthenticated, restrictToRoles('super_admin'));

router.post('/', validate(createUpdateProviderSchema, 'body'), aiProviderController.createProvider);
router.get('/', aiProviderController.getAllProviders);
router.put('/:id', validate(createUpdateProviderSchema, 'body'), aiProviderController.updateProvider);

module.exports = router;