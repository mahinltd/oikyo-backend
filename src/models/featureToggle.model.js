/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

const featureToggleSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Toggle name is required'],
        trim: true 
    },
    slug: { 
        type: String, 
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    type: { 
        type: String, 
        enum: ['feature', 'module'], 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['enabled', 'beta', 'deprecated', 'disabled'], 
        default: 'disabled' 
    },
    description: { 
        type: String, 
        trim: true,
        default: null
    }
}, { timestamps: true });

// Optimize query for frontend configuration fetch
featureToggleSchema.index({ status: 1, type: 1 });

module.exports = mongoose.model('FeatureToggle', featureToggleSchema);