/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    
    // Hierarchical Structure
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    level: { type: Number, default: 0 }, // 0 = Root, 1 = Sub, 2 = Sub-Sub
    
    // Media
    icon: { type: String, default: null },
    bannerImage: { type: String, default: null },
    
    // SEO & Visibility
    seo: {
        metaTitle: { type: String, default: '' },
        metaDescription: { type: String, default: '' }
    },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 } // For custom sorting on frontend
}, { timestamps: true }));

// Index for fast tree traversal and frontend querying
Category.schema.index({ parentId: 1, isActive: 1 });

module.exports = Category;