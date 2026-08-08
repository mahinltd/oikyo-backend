/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const express = require('express');
const websiteIdentityController = require('../../controllers/websiteIdentity.controller');
const validate = require('../../middlewares/validate.middleware');
const identityValidation = require('../../validations/websiteIdentity.validation');
const { isAuthenticated } = require('../../middlewares/auth.middleware');
const { restrictToRoles } = require('../../middlewares/role.middleware');

const router = express.Router();

// Public Route: Frontend will hit this to render website name and metadata
router.get('/', websiteIdentityController.getIdentity);

// Protected Admin Route: Only admins can update the identity
router.put(
    '/',
    isAuthenticated,
    restrictToRoles('super_admin', 'admin'), // Only specific roles allowed
    validate(identityValidation.updateIdentitySchema, 'body'),
    websiteIdentityController.updateIdentity
);

module.exports = router;