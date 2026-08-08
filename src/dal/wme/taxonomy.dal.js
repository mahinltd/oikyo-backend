/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const Category = require('../../models/wme/category.model');
const Brand = require('../../models/wme/brand.model');
const Product = require('../../models/commerce/product.model'); // Cross-module reference for Impact Check

class TaxonomyDal {
    async getAllCategories() {
        return await Category.find().sort({ displayOrder: 1, createdAt: -1 }).lean();
    }

    async getAllBrands() {
        return await Brand.find().sort({ displayOrder: 1, createdAt: -1 }).lean();
    }

    // ==========================================
    // Category Operations
    // ==========================================
    async findCategoryBySlug(slug) {
        return await Category.findOne({ slug });
    }

    async findCategoryById(id) {
        return await Category.findById(id);
    }

    async createCategory(data) {
        return await Category.create(data);
    }

    async updateCategory(id, updateData) {
        return await Category.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    }

    async bulkUpdateCategoryOrder(bulkOps) {
        return await Category.bulkWrite(bulkOps);
    }

    // ==========================================
    // Brand Operations
    // ==========================================
    async findBrandBySlug(slug) {
        return await Brand.findOne({ slug });
    }

    // ==========================================
    // Cross-Module Operations (Impact Analysis)
    // ==========================================
    async getCategoryImpactSummary(categoryId) {
        const total = await Product.countDocuments({ 
            $or: [{ primaryCategory: categoryId }, { subCategories: categoryId }] 
        });
        const published = await Product.countDocuments({ 
            $or: [{ primaryCategory: categoryId }, { subCategories: categoryId }], 
            status: 'published' 
        });
        return { total, published, draft: total - published };
    }

    async getBrandImpactSummary(brandId) {
        const total = await Product.countDocuments({ brand: brandId });
        const published = await Product.countDocuments({ brand: brandId, status: 'published' });
        return { total, published, draft: total - published };
    }
}

module.exports = new TaxonomyDal();