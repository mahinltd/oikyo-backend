/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

const themeSchema = new mongoose.Schema({
    themeName: {
        type: String,
        required: [true, 'Theme name is required'],
        trim: true
    },
    version: {
        type: String,
        default: '1.0.0'
    },
    status: {
        type: String,
        enum: ['active', 'draft', 'deprecated'],
        default: 'draft'
    },
    colors: {
        primary: { type: String, default: '#000000' },
        secondary: { type: String, default: '#ffffff' },
        accent: { type: String, default: '#ffcc00' },
        background: { type: String, default: '#f4f6f8' },
        text: { type: String, default: '#333333' },
        border: { type: String, default: '#eaeaea' }
    },
    typography: {
        primaryFont: { type: String, default: 'Helvetica Neue, sans-serif' },
        secondaryFont: { type: String, default: 'Georgia, serif' },
        baseFontSize: { type: String, default: '16px' }
    },
    components: {
        buttonStyle: { type: String, enum: ['rounded', 'sharp', 'pill'], default: 'rounded' },
        inputStyle: { type: String, enum: ['outlined', 'filled', 'underlined'], default: 'outlined' }
    },
    layout: {
        containerMaxWidth: { type: String, default: '1200px' },
        gridStyle: { type: String, enum: ['comfortable', 'compact'], default: 'comfortable' }
    }
}, { timestamps: true });

module.exports = mongoose.model('Theme', themeSchema);