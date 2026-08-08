/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const manualImportService = require('../../services/commerce/manualImport.service');
const ApiError = require('../../utils/ApiError');

class ManualImportController {

    // Import a single product manually from UI form
    async importSingle(req, res, next) {
        try {
            const { supplierId } = req.body;
            const rawInputData = req.body.productData; // The raw data from the form
            const adminId = req.user.id;

            if (!supplierId || !rawInputData) {
                throw new ApiError(400, 'Supplier ID and product data are required.');
            }

            const draftedProduct = await manualImportService.importSingleProduct(rawInputData, supplierId, adminId);

            res.status(201).json({
                success: true,
                message: 'Product manually imported and drafted successfully.',
                data: draftedProduct
            });
        } catch (error) {
            next(error);
        }
    }

    // Import multiple products (e.g., parsed from a CSV file on the frontend)
    async importBulk(req, res, next) {
        try {
            const { supplierId, productsArray } = req.body;
            const adminId = req.user.id;

            if (!supplierId || !Array.isArray(productsArray)) {
                throw new ApiError(400, 'Supplier ID and a valid products array are required.');
            }

            const results = await manualImportService.importBulkProducts(productsArray, supplierId, adminId);

            res.status(200).json({
                success: true,
                message: 'Bulk manual import process completed.',
                data: results
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ManualImportController();