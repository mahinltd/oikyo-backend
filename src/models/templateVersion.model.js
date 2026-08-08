/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

const templateVersionSchema = new mongoose.Schema({
    templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'NotificationTemplate', required: true },
    subject: { type: String, default: null },
    body: { type: String, required: true },
    versionNote: { type: String, default: 'Auto-saved version before update' },
    savedAt: { type: Date, default: Date.now }
});

templateVersionSchema.index({ templateId: 1, savedAt: -1 });

module.exports = mongoose.model('TemplateVersion', templateVersionSchema);