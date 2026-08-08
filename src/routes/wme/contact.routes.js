/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const express = require('express');
const contactService = require('../../services/contact.service');
const validate = require('../../middlewares/validate.middleware');
const contactValidation = require('../../validations/contact.validation');
const { isAuthenticated } = require('../../middlewares/auth.middleware');
const { restrictToRoles } = require('../../middlewares/role.middleware');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

const router = express.Router();

// ==========================================
// Public Route (Used by Frontend Footer/Contact Page)
// ==========================================
router.get('/', asyncHandler(async (req, res) => {
    const contactInfo = await contactService.getContactInfo();
    res.status(200).json(new ApiResponse(200, contactInfo, "Contact and social settings fetched"));
}));

// ==========================================
// Protected Admin Route
// ==========================================
router.put(
    '/',
    isAuthenticated,
    restrictToRoles('super_admin', 'admin', 'manager'),
    validate(contactValidation.updateContactSchema, 'body'),
    asyncHandler(async (req, res) => {
        const updatedContact = await contactService.updateContactInfo(req.body);
        res.status(200).json(new ApiResponse(200, updatedContact, "Contact and social settings updated"));
    })
);

module.exports = router;