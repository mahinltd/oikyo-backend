/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

const seoSchema = new mongoose.Schema({
    metaTitle: { 
        type: String, 
        required: [true, 'Global Meta Title is required'],
        trim: true,
        maxlength: 100
    },
    metaDescription: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: 250
    },
    keywords: { 
        type: String, 
        trim: true 
    },
    ogTitle: { 
        type: String, 
        trim: true,
        maxlength: 100
    },
    ogDescription: { 
        type: String, 
        trim: true,
        maxlength: 250
    },
    ogImage: { 
        type: String, 
        default: null // Cloudinary URL mapped from Media Engine
    },
    twitterHandle: {
        type: String,
        trim: true,
        default: ''
    },
    isGlobal: {
        type: Boolean,
        default: true,
        unique: true // Ensures only one Global SEO document exists
    }
}, { timestamps: true });

module.exports = mongoose.model('SeoSetting', seoSchema);