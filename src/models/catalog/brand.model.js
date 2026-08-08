/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

const Brand = mongoose.models.Brand || mongoose.model('Brand', new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        trim: true 
    },
    slug: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true 
    },
    logo: { 
        type: String, 
        default: null 
    },
    status: { 
        type: String, 
        enum: ['active', 'inactive'], 
        default: 'active' 
    },
    seo: { 
        metaTitle: { type: String, default: '' }, 
        metaDescription: { type: String, default: '' } 
    }
}, { timestamps: true }));

module.exports = Brand;