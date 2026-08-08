/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const express = require('express');
const maintenanceService = require('../../services/maintenance.service');
const validate = require('../../middlewares/validate.middleware');
const maintenanceValidation = require('../../validations/maintenance.validation');
const { isAuthenticated } = require('../../middlewares/auth.middleware');
const { restrictToRoles } = require('../../middlewares/role.middleware');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

const router = express.Router();

// ==========================================
// Public Route (Frontend checks this on initial load)
// ==========================================
router.get('/status', asyncHandler(async (req, res) => {
    const status = await maintenanceService.getStatus();
    
    // We send 200 OK so the frontend can receive the JSON and render the maintenance page.
    // In a Global API Middleware, this logic would throw a 503 instead.
    res.status(200).json(new ApiResponse(200, status, "Maintenance status fetched"));
}));

// ==========================================
// Protected Admin Route (Only Super Admin should control this)
// ==========================================
router.put(
    '/status',
    isAuthenticated,
    restrictToRoles('super_admin'), // Strictly limited to super admin
    validate(maintenanceValidation.updateMaintenanceSchema, 'body'),
    asyncHandler(async (req, res) => {
        const updatedStatus = await maintenanceService.updateStatus(req.body);
        const action = updatedStatus.isActive ? 'enabled' : 'disabled';
        res.status(200).json(new ApiResponse(200, updatedStatus, `Maintenance mode ${action} successfully`));
    })
);

module.exports = router;