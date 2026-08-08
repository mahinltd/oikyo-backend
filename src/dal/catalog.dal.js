/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const { Category, Brand, Tag, Collection } = require('../models/catalog');

class CatalogDal {
    // Other methods remain the same...

    async getActiveCategories() { 
        // Ensure 'deleted' and 'archived' are not fetched for the public frontend
        return await Category.find({ status: 'active' }).lean(); 
    }

    async getAllCategories() { 
        // Admin gets everything except completely 'deleted' ones (unless explicitly requested from trash)
        return await Category.find({ status: { $ne: 'deleted' } }).lean(); 
    }

    async deleteCategory(id) { 
        // Enterprise Rule: Soft Delete Architecture
        // 1. Soft delete the main category
        const deletedCategory = await Category.findByIdAndUpdate(
            id, 
            { $set: { status: 'deleted' } }, 
            { new: true }
        );
        
        // 2. Cascading Soft Delete for sub-categories
        if (deletedCategory) {
            await Category.updateMany(
                { parentId: id, status: { $ne: 'deleted' } }, 
                { $set: { status: 'deleted' } }
            );
        }
        
        return deletedCategory; 
    }
}

module.exports = new CatalogDal();