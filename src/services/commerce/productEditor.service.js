/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const Product = require('../../models/commerce/product.model');
const ProductRevision = require('../../models/commerce/productRevision.model');
const ProductActivityLog = require('../../models/commerce/productActivityLog.model');
const ApiError = require('../../utils/ApiError');

class ProductEditorService {

    // ==========================================
    // 1. Locking Mechanism (Concurrency Control)
    // ==========================================
    async acquireLock(productId, adminId) {
        const product = await Product.findById(productId);
        if (!product) throw new ApiError(404, 'Product not found');

        // Check if locked by someone else and lock is not expired (assume 15 mins expiry)
        const now = new Date();
        if (product.editorState.lockedBy && String(product.editorState.lockedBy) !== String(adminId)) {
            if (product.editorState.lockExpiry && product.editorState.lockExpiry > now) {
                throw new ApiError(423, 'Product is currently being edited by another user');
            }
        }

        // Apply lock
        product.editorState.lockedBy = adminId;
        product.editorState.lockExpiry = new Date(now.getTime() + 15 * 60000); // 15 mins
        await product.save();
        
        return product;
    }

    // ==========================================
    // 2. Quality Score Calculation Engine
    // ==========================================
    calculateQualityScore(productData) {
        let score = 0;
        
        // Basic Info (30 points)
        if (productData.title && productData.title.length > 10) score += 15;
        if (productData.description && productData.description.length > 50) score += 15;
        
        // Taxonomy (20 points)
        if (productData.category) score += 10;
        if (productData.tags && productData.tags.length > 0) score += 10;
        
        // Media (20 points)
        if (productData.media?.thumbnail) score += 10;
        if (productData.media?.gallery && productData.media.gallery.length > 0) score += 10;
        
        // Pricing (15 points)
        if (productData.pricing?.sellingPrice > productData.pricing?.costPrice) score += 15;
        
        // SEO (15 points)
        if (productData.seo?.metaTitle && productData.seo?.metaDescription) score += 15;

        return score;
    }

    // ==========================================
    // 3. Save Draft & Create Revision
    // ==========================================
    async saveDraft(productId, adminId, updateData, commitMessage = 'Manual Draft Save') {
        const product = await Product.findById(productId);
        if (!product) throw new ApiError(404, 'Product not found');

        // Enforce Optimistic Locking (Version check)
        if (updateData.__v && updateData.__v !== product.__v) {
            throw new ApiError(409, 'Conflict: Product was updated by another process. Please refresh.');
        }

        // Calculate new Quality Score
        const qualityScore = this.calculateQualityScore({ ...product.toObject(), ...updateData });
        
        // Merge updates (Preventing source modification)
        delete updateData.source; // Strict Business Rule: Source is immutable
        Object.assign(product, updateData);
        product.editorState.qualityScore = qualityScore;
        product.editorState.isDirty = true; // Mark as having unsaved published changes

        // Save the Product
        const savedProduct = await product.save();

        // Create Revision Snapshot
        const latestRevision = await ProductRevision.findOne({ productId }).sort({ versionNumber: -1 });
        const nextVersion = latestRevision ? latestRevision.versionNumber + 1 : 1;

        await ProductRevision.create({
            productId: savedProduct._id,
            versionNumber: nextVersion,
            snapshot: savedProduct.toObject(),
            changedFields: Object.keys(updateData),
            editedBy: adminId,
            commitMessage
        });

        // Log Activity
        await this.logActivity(savedProduct._id, 'manual_edit_saved', adminId, commitMessage);

        return savedProduct;
    }

    // ==========================================
    // 4. Activity Logger
    // ==========================================
    async logActivity(productId, actionType, adminId, details, metadata = {}) {
        return await ProductActivityLog.create({
            productId,
            actionType,
            performedBy: adminId,
            details,
            metadata
        });
    }
}

module.exports = new ProductEditorService();