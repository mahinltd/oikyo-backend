/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    supportEmail: { 
        type: String, 
        trim: true, 
        lowercase: true,
        default: null 
    },
    supportPhone: { 
        type: String, 
        trim: true, 
        default: null 
    },
    corporateAddress: { 
        type: String, 
        trim: true, 
        default: null 
    },
    workingHours: { 
        type: String, 
        trim: true, 
        default: 'Saturday to Thursday: 9:00 AM - 6:00 PM' 
    },
    googleMapLink: { 
        type: String, 
        trim: true, 
        default: null 
    },
    socialLinks: [{
        platform: { type: String, required: true }, // e.g., facebook, instagram, youtube, tiktok
        url: { type: String, required: true },
        isActive: { type: Boolean, default: true }
    }],
    isGlobal: {
        type: Boolean,
        default: true,
        unique: true // Guarantees only one configuration exists
    }
}, { timestamps: true });

module.exports = mongoose.model('ContactSetting', contactSchema);