/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

const globalAssetSchema = new mongoose.Schema({
    primaryLogo: { type: String, default: null }, // Cloudinary URL
    textLogo: { type: String, default: null },
    footerLogo: { type: String, default: null },
    favicon: { type: String, default: null },
    defaultProductImage: { type: String, default: null }, // Fallback for products without image
    defaultAvatar: { type: String, default: null }, // Fallback for user profiles
    
    // Array of Payment Icons (e.g., bKash, SSLCommerz, Visa)
    paymentIcons: [{
        name: { type: String, required: true },
        url: { type: String, required: true },
        isActive: { type: Boolean, default: true }
    }],

    isGlobal: {
        type: Boolean,
        default: true,
        unique: true
    }
}, { timestamps: true });

module.exports = mongoose.model('GlobalAsset', globalAssetSchema);