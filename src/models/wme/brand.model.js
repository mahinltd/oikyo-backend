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
    isActive: { 
        type: Boolean, 
        default: true 
    },
    isFeatured: { 
        type: Boolean, 
        default: false 
    }, // Useful for displaying brand logos in a simple homepage slider
    displayOrder: { 
        type: Number, 
        default: 0 
    } // Custom sorting for the filter sidebar
}, { timestamps: true }));

// Highly optimized indexes for filtering
Brand.schema.index({ isActive: 1, isFeatured: 1, displayOrder: 1 });

module.exports = Brand;