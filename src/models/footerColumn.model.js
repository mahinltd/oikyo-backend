/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

const footerColumnSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
    visibility: { type: Boolean, default: true },
    
    // Array of Links under this column
    links: [{
        label: { type: String, required: true },
        url: { type: String, required: true },
        isExternal: { type: Boolean, default: false } // If true, opens in a new tab
    }]
}, { timestamps: true });

footerColumnSchema.index({ order: 1 });

module.exports = mongoose.model('FooterColumn', footerColumnSchema);