/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

const pageVersionSchema = new mongoose.Schema({
    pageId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Page', 
        required: true 
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    versionNote: { type: String, default: 'System auto-saved version before update' },
    savedAt: { type: Date, default: Date.now }
});

pageVersionSchema.index({ pageId: 1, savedAt: -1 });

module.exports = mongoose.model('PageVersion', pageVersionSchema);