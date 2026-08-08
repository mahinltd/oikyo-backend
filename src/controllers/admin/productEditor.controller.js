/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const productEditorService = require('../../services/commerce/productEditor.service');
const Product = require('../../models/commerce/product.model');
const ApiError = require('../../utils/ApiError');

class ProductEditorController {

    // Open product in Editor (Acquires Pessimistic Lock)
    async openForEdit(req, res, next) {
        try {
            const { productId } = req.params;
            const adminId = req.user.id; // From auth middleware

            const product = await productEditorService.acquireLock(productId, adminId);

            res.status(200).json({
                success: true,
                message: 'Product locked for editing',
                data: product
            });
        } catch (error) {
            next(error);
        }
    }

    // Save Draft (Optimistic Locking & Versioning applied in Service)
    async saveDraft(req, res, next) {
        try {
            const { productId } = req.params;
            const adminId = req.user.id;
            const updateData = req.body; // Needs to include __v for optimistic lock check
            const commitMessage = req.body.commitMessage || 'Manual Draft Save';

            const updatedProduct = await productEditorService.saveDraft(productId, adminId, updateData, commitMessage);

            res.status(200).json({
                success: true,
                message: 'Product draft saved successfully',
                data: updatedProduct
            });
        } catch (error) {
            next(error);
        }
    }

    // Submit for Review
    async submitForReview(req, res, next) {
        try {
            const { productId } = req.params;
            const product = await Product.findById(productId);
            
            if (!product) throw new ApiError(404, 'Product not found');
            
            product.status = 'pending_review';
            if (!product.changeDetection) product.changeDetection = {};
            product.changeDetection.needsReview = true;
            product.changeDetection.reviewNote = 'Submitted by Editor for QA';
            
            await product.save();

            res.status(200).json({
                success: true,
                message: 'Product submitted to Review Queue successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ProductEditorController();