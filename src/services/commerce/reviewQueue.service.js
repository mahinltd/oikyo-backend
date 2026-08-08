/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const Product = require('../../models/commerce/product.model');
const productEditorService = require('./productEditor.service');
const ApiError = require('../../utils/ApiError');

class ReviewQueueService {

    /**
     * Approves a product and changes its status to 'published'
     * @param {String} productId - The ID of the product
     * @param {String} adminId - The ID of the admin approving it
     */
    async approveProduct(productId, adminId) {
        const product = await Product.findById(productId);
        if (!product) throw new ApiError(404, 'Product not found in queue.');

        // 1. Strict Gatekeeper Rule: Check Quality Score
        if (product.editorState.qualityScore < 70) {
            throw new ApiError(403, `Approval Blocked: Quality Score is ${product.editorState.qualityScore}. Minimum 70 is required to publish.`);
        }

        // 2. Clear Review Flags & Change Status
        product.status = 'published';
        product.editorState.isDirty = false;
        
        if (product.changeDetection) {
            product.changeDetection.needsReview = false;
            product.changeDetection.reviewNote = null;
        }

        await product.save();

        // 3. Log Activity
        await productEditorService.logActivity(
            product._id, 
            'review_approved', 
            adminId, 
            'Product passed QA and has been published to the storefront.'
        );

        return product;
    }

    /**
     * Ignores supplier API changes (e.g., minor description change) and keeps current live data.
     */
    async ignoreChanges(productId, adminId) {
        const product = await Product.findById(productId);
        if (!product) throw new ApiError(404, 'Product not found.');

        // Simply remove the needsReview flag to pull it out of the queue
        if (product.changeDetection) {
            product.changeDetection.needsReview = false;
            product.changeDetection.reviewNote = null;
        }
        
        // Revert status to published if it was previously published
        if (product.status === 'pending_review') {
            product.status = 'published';
        }

        await product.save();

        await productEditorService.logActivity(
            product._id, 
            'manual_edit_saved', 
            adminId, 
            'Admin ignored API sync changes. Kept existing product data.'
        );

        return product;
    }

    /**
     * Bulk approve multiple products at once (if quality score allows).
     */
    async bulkApproveProducts(productIds, adminId) {
        const results = { success: 0, failed: 0, errors: [] };

        for (const productId of productIds) {
            try {
                await this.approveProduct(productId, adminId);
                results.success += 1;
            } catch (error) {
                results.failed += 1;
                results.errors.push({ id: productId, error: error.message });
            }
        }

        return results;
    }
}

module.exports = new ReviewQueueService();