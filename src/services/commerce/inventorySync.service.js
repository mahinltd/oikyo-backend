/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const Product = require('../../models/commerce/product.model');
const productEditorService = require('./productEditor.service');
const ApiError = require('../../utils/ApiError');

class InventorySyncService {

    /**
     * Rapidly processes stock and price changes detected from the Supplier API.
     * @param {String} productId - The ID of the OIKYO Unified Product
     * @param {Object} updatedSupplierData - { newCostPrice, newStockStatus }
     */
    async processInventoryChange(productId, updatedSupplierData) {
        const product = await Product.findById(productId);
        if (!product) throw new ApiError(404, 'Product not found');

        let requiresAdminReview = false;
        const changes = [];

        // 1. Cost Price Monitoring (CRITICAL: Profit Protection)
        if (updatedSupplierData.newCostPrice && updatedSupplierData.newCostPrice !== product.pricing.costPrice) {
            const oldPrice = product.pricing.costPrice;
            const newPrice = updatedSupplierData.newCostPrice;
            
            product.pricing.costPrice = newPrice;
            
            // If buying price increased, it might eat our profit. Force a review!
            if (newPrice > oldPrice) {
                requiresAdminReview = true;
                changes.push(`Cost Price Increased: ${oldPrice} -> ${newPrice}`);
            } else {
                changes.push(`Cost Price Dropped: ${oldPrice} -> ${newPrice}`);
            }
        }

        // 2. Stock Status Monitoring
        if (updatedSupplierData.newStockStatus && updatedSupplierData.newStockStatus !== product.stockStatus) {
            product.stockStatus = updatedSupplierData.newStockStatus;
            changes.push(`Stock Status Changed: -> ${updatedSupplierData.newStockStatus}`);
            
            // If product goes out of stock, we update the website immediately (No review needed for Out of Stock)
            // But if it comes back in stock, we might want admin to review pricing.
            if (updatedSupplierData.newStockStatus === 'in_stock') {
                requiresAdminReview = true;
            }
        }

        // 3. Apply Review Queue Flags if necessary
        if (requiresAdminReview) {
            product.status = 'pending_review';
            if (!product.changeDetection) product.changeDetection = {};
            product.changeDetection.needsReview = true;
            product.changeDetection.reviewNote = changes.join(' | ');
        }

        await product.save();

        if (changes.length > 0) {
            await productEditorService.logActivity(
                product._id, 
                requiresAdminReview ? 'submitted_for_review' : 'manual_edit_saved', 
                null, 
                `Inventory Sync: ${changes.join(' | ')}`
            );
        }

        return product;
    }
}

module.exports = new InventorySyncService();