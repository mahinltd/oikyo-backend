/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

const websiteIdentitySchema = new mongoose.Schema({
    websiteName: {
        type: String,
        required: [true, 'Website name is required'],
        trim: true,
        maxlength: 100
    },
    shortName: {
        type: String,
        trim: true,
        maxlength: 50
    },
    tagline: {
        type: String,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    defaultLanguage: {
        type: String,
        default: 'en'
    },
    isGlobal: {
        type: Boolean,
        default: true,
        unique: true // Ensures only one configuration document exists
    }
}, { timestamps: true });

module.exports = mongoose.model('WebsiteIdentity', websiteIdentitySchema);