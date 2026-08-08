/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const taxonomyDal = require('../../dal/wme/taxonomy.dal');
const ApiError = require('../../utils/ApiError');
// Assuming an audit service exists as per your 6th rule
// const auditService = require('../system/audit.service'); 

class TaxonomyService {

    // ==========================================
    // 1. Slug Validation Rule
    // ==========================================
    async _validateSlugUniqueness(slug, currentId = null, type = 'category') {
        const reservedSlugs = ['api', 'admin', 'search', 'checkout', 'cart', 'products'];
        if (reservedSlugs.includes(slug.toLowerCase())) {
            throw new ApiError(400, `Slug '${slug}' is a reserved keyword.`);
        }

        const existing = type === 'category' 
            ? await taxonomyDal.findCategoryBySlug(slug) 
            : await taxonomyDal.findBrandBySlug(slug);

        if (existing && existing._id.toString() !== currentId?.toString()) {
            throw new ApiError(409, `Slug '${slug}' is already in use. Please choose another.`);
            // Note: SEO Redirect Logic would be triggered here in the future if a slug is changed.
        }
    }

    // ==========================================
    // 2. Circular Reference Protection
    // ==========================================
    async _checkCircularReference(categoryId, newParentId) {
        if (!newParentId) return;
        if (categoryId.toString() === newParentId.toString()) {
            throw new ApiError(400, 'A category cannot be its own parent.');
        }

        let currentParentId = newParentId;
        while (currentParentId) {
            const parent = await taxonomyDal.findCategoryById(currentParentId);
            if (!parent) break;
            if (parent._id.toString() === categoryId.toString()) {
                throw new ApiError(400, 'Circular reference detected: Cannot set a descendant as a parent.');
            }
            currentParentId = parent.parentId;
        }
    }

    // ==========================================
    // Category Core Methods
    // ==========================================
    async createCategory(payload, adminId) {
        await this._validateSlugUniqueness(payload.slug, null, 'category');

        let level = 0;
        if (payload.parentId) {
            const parent = await taxonomyDal.findCategoryById(payload.parentId);
            if (!parent) throw new ApiError(404, 'Parent category not found.');
            level = parent.level + 1;
        }

        const category = await taxonomyDal.createCategory({ ...payload, level });

        // Audit Trail (Create)
        // await auditService.log('category_created', adminId, { categoryId: category._id, changes: payload });

        return category;
    }

    async updateCategory(categoryId, payload, adminId) {
        const existingCategory = await taxonomyDal.findCategoryById(categoryId);
        if (!existingCategory) throw new ApiError(404, 'Category not found.');

        if (payload.slug) {
            await this._validateSlugUniqueness(payload.slug, categoryId, 'category');
        }

        if (payload.parentId && payload.parentId !== existingCategory.parentId?.toString()) {
            await this._checkCircularReference(categoryId, payload.parentId);
            const parent = await taxonomyDal.findCategoryById(payload.parentId);
            payload.level = parent ? parent.level + 1 : 0;
        }

        const updatedCategory = await taxonomyDal.updateCategory(categoryId, payload);

        // Audit Trail (Update)
        // await auditService.log('category_updated', adminId, { categoryId, changes: payload });

        return updatedCategory;
    }

    // ==========================================
    // 3. System Impact Check & Soft Disable Rule
    // ==========================================
    async toggleCategoryStatus(categoryId, isActive, adminId) {
        // If trying to disable, check impact
        if (!isActive) {
            const impact = await taxonomyDal.getCategoryImpactSummary(categoryId);
            if (impact.published > 0) {
                throw new ApiError(
                    422, 
                    `Cannot disable category. It is actively used by ${impact.published} published products. Please reassign them first. Impact Summary: ${JSON.stringify(impact)}`
                );
            }
        }

        const updated = await taxonomyDal.updateCategory(categoryId, { isActive });
        
        // Audit Trail (Status Change)
        // await auditService.log('category_status_changed', adminId, { categoryId, isActive });
        
        return updated;
    }

    // ==========================================
    // 4. Drag-and-Drop Display Order Management
    // ==========================================
    async reorderCategories(orderedArray, adminId) {
        // orderedArray expects format: [{ id: "...", displayOrder: 1 }, { id: "...", displayOrder: 2 }]
        const bulkOps = orderedArray.map(item => ({
            updateOne: {
                filter: { _id: item.id },
                update: { displayOrder: item.displayOrder }
            }
        }));

        await taxonomyDal.bulkUpdateCategoryOrder(bulkOps);

        // Audit Trail
        // await auditService.log('category_reordered', adminId, { affectedCount: orderedArray.length });
        
        return { success: true, message: 'Display order updated successfully.' };
    }
}

module.exports = new TaxonomyService();