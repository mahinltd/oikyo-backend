/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: '' },
    bannerImage: { type: String, default: null },

    // Collection Strategy
    collectionType: { 
        type: String, 
        enum: ['manual', 'automated'], 
        default: 'manual' 
    },
    
    // For Manual Collections
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    
    // For Automated Collections (Dynamic Rules)
    automatedRules: [{
        field: { type: String, enum: ['category', 'brand', 'tags', 'pricing.sellingPrice', 'createdAt'] },
        operator: { type: String, enum: ['equals', 'contains', 'greaterThan', 'lessThan'] },
        value: { type: mongoose.Schema.Types.Mixed }
    }],

    // Visibility & Scheduling
    isActive: { type: Boolean, default: true },
    schedule: {
        startAt: { type: Date, default: null },
        endAt: { type: Date, default: null }
    },
    
    // SEO
    seo: {
        metaTitle: { type: String, default: '' },
        metaDescription: { type: String, default: '' }
    }
}, { timestamps: true });

collectionSchema.index({ slug: 1 });
collectionSchema.index({ isActive: 1, 'schedule.startAt': 1, 'schedule.endAt': 1 });

module.exports = mongoose.model('Collection', collectionSchema);