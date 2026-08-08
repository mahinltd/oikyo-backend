/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Page title is required'],
        trim: true
    },
    slug: { 
        type: String, 
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    content: { 
        type: String, // Rich Text / HTML Content
        required: true 
    },
    pageType: {
        type: String,
        enum: ['policy', 'information', 'landing_page', 'custom'],
        default: 'custom'
    },
    status: {
        type: String,
        enum: ['published', 'draft', 'archived'],
        default: 'draft'
    },
    seo: {
        metaTitle: { type: String, default: '' },
        metaDescription: { type: String, default: '' },
        keywords: { type: String, default: '' }
    }
}, { timestamps: true });

pageSchema.index({ slug: 1, status: 1 });

module.exports = mongoose.model('Page', pageSchema);