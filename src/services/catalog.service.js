/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const catalogDal = require('../dal/catalog.dal');
const ApiError = require('../utils/ApiError');
const slugify = require('slugify');

class CatalogService {
    
    // Recursive function to build Multi-Level Category Tree
    _buildCategoryTree(categories, parentId = null) {
        const tree = [];
        for (let cat of categories) {
            if (String(cat.parentId) === String(parentId)) {
                const children = this._buildCategoryTree(categories, cat._id);
                if (children.length > 0) {
                    cat.subCategories = children;
                } else {
                    cat.subCategories = [];
                }
                tree.push(cat);
            }
        }
        return tree;
    }

    // --- Category Services ---
    async createCategory(data) {
        data.slug = slugify(data.slug || data.name, { lower: true, strict: true });
        return await catalogDal.createCategory(data);
    }

    async getPublicCategoryTree() {
        const rawCategories = await catalogDal.getActiveCategories();
        return this._buildCategoryTree(rawCategories, null);
    }

    async getAdminCategoryList() {
        const rawCategories = await catalogDal.getAllCategories();
        return { 
            flatList: rawCategories, 
            tree: this._buildCategoryTree(rawCategories, null) 
        };
    }

    async updateCategory(id, data) {
        if (data.slug) data.slug = slugify(data.slug, { lower: true, strict: true });
        // Prevent category from being its own parent (Infinite Loop Protection)
        if (data.parentId && String(data.parentId) === String(id)) {
            throw new ApiError(400, "A category cannot be its own parent.");
        }
        return await catalogDal.updateCategory(id, data);
    }

    async deleteCategory(id) {
        return await catalogDal.deleteCategory(id);
    }

    // (Similar create/get/update/delete methods for Brand, Tag, and Collection would follow here, using catalogDal)
}

module.exports = new CatalogService();