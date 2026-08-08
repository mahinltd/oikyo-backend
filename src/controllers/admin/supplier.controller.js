/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const syncEngineService = require('../../services/supplier/syncEngine.service');
const SupplierConfig = require('../../models/supplier/supplierConfig.model');
const ApiError = require('../../utils/ApiError');

class SupplierController {
    
    // Trigger Sync manually from Admin Panel
    async triggerSync(req, res, next) {
        try {
            const { supplierId } = req.params;
            const supplier = await SupplierConfig.findById(supplierId);
            
            if (!supplier) throw new ApiError(404, 'Supplier configuration not found');
            if (supplier.importType !== 'api') throw new ApiError(400, 'Only API suppliers can be synced');

            // Trigger sync in background (do not await to block response)
            syncEngineService.syncSupplier(supplier).catch(err => console.error(err));

            res.status(200).json({
                success: true,
                message: `Sync process initiated for supplier: ${supplier.supplierName}`
            });
        } catch (error) {
            next(error);
        }
    }

    // Get all configured suppliers
    async getAllSuppliers(req, res, next) {
        try {
            const suppliers = await SupplierConfig.find().select('-apiConfig.headers'); // Hide headers for security
            res.status(200).json({ success: true, data: suppliers });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new SupplierController();