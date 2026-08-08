/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    description: { type: String, trim: true, default: null },
    image: { type: String, default: null },
    icon: { type: String, default: null },
    
    // Enterprise Soft Delete Architecture
    status: { 
        type: String, 
        enum: ['active', 'inactive', 'archived', 'deleted'], 
        default: 'active' 
    },
    
    seo: { metaTitle: { type: String, default: '' }, metaDescription: { type: String, default: '' } }
}, { timestamps: true }));

// Exclude deleted items from standard queries for performance
Category.schema.index({ parentId: 1, status: 1 });

module.exports = Category;