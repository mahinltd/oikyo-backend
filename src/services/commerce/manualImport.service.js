/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const SupplierConfig = require('../../models/supplier/supplierConfig.model');
const universalAdapter = require('../supplier/universalSupplier.adapter');
const validationEngine = require('../supplier/importValidation.engine');
const supplierDal = require('../../dal/supplier/supplier.dal');
const productEditorService = require('./productEditor.service');
const ApiError = require('../../utils/ApiError');

class ManualImportService {

    /**
     * Processes manually entered product data using the Universal Pipeline.
     * @param {Object} rawInputData - Data from Admin UI Form or CSV row
     * @param {String} supplierId - The ID of the configured Manual Supplier
     * @param {String} adminId - The ID of the admin performing the import
     */
    async importSingleProduct(rawInputData, supplierId, adminId) {
        // 1. Fetch Configuration for the Manual Supplier
        const config = await SupplierConfig.findById(supplierId);
        if (!config || config.importType !== 'manual') {
            throw new ApiError(400, 'Invalid supplier configuration. Must be a manual supplier.');
        }

        // 2. Transform Input using Universal Adapter (Dynamic Mapping)
        const standardProduct = universalAdapter.transformToStandard(rawInputData, config.mappingProfile);

        // 3. Ensure Fulfillment Reference Exists (Business Rule)
        if (!standardProduct.externalId) {
            standardProduct.externalId = `MANUAL-${Date.now()}`; // Auto-generate if missing
        }

        // 4. Validate Data Integrity
        const validation = validationEngine.validate(standardProduct, config.validationRules);
        if (!validation.isValid) {
            throw new ApiError(400, `Validation Failed: ${validation.errors.join(', ')}`);
        }

        // 5. Save to Raw Buffer (For Audit Trail)
        await supplierDal.upsertRawProduct(config._id, standardProduct.externalId, rawInputData, 'drafted_to_unified', config.supplierName);

        // 6. Create Draft in Unified Repository
        const newDraft = await supplierDal.createDraftProduct(standardProduct, config._id, config.supplierName, config.importType);

        // 7. Calculate Initial Quality Score
        const qualityScore = productEditorService.calculateQualityScore(newDraft.toObject());
        newDraft.editorState.qualityScore = qualityScore;
        await newDraft.save();

        // 8. Log Activity
        await productEditorService.logActivity(
            newDraft._id, 
            'imported_raw', 
            adminId, 
            `Manually imported product via Supplier: ${config.supplierName}`
        );

        return newDraft;
    }

    /**
     * Processes bulk imports (e.g., from CSV)
     */
    async importBulkProducts(inputDataArray, supplierId, adminId) {
        const results = { success: 0, failed: 0, errors: [] };

        for (const inputData of inputDataArray) {
            try {
                await this.importSingleProduct(inputData, supplierId, adminId);
                results.success += 1;
            } catch (error) {
                results.failed += 1;
                results.errors.push({ data: inputData.title || 'Unknown', error: error.message });
            }
        }

        return results;
    }
}

module.exports = new ManualImportService();