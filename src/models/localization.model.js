/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

const localizationSchema = new mongoose.Schema({
    languageCode: { type: String, required: true, unique: true, lowercase: true, trim: true },
    languageName: { type: String, required: true, trim: true },
    
    // Enterprise Regional Configurations
    currency: {
        code: { type: String, default: 'BDT' }, // e.g., USD, BDT
        symbol: { type: String, default: '৳' }, // e.g., $, ৳
        placement: { type: String, enum: ['left', 'right'], default: 'left' }
    },
    timezone: { type: String, default: 'Asia/Dhaka' },
    format: {
        date: { type: String, default: 'DD-MM-YYYY' },
        time: { type: String, enum: ['12h', '24h'], default: '12h' },
        numberLocale: { type: String, default: 'en-US' } // Used for frontend Intl.NumberFormat
    },

    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    translations: { type: Map, of: String, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('Localization', localizationSchema);