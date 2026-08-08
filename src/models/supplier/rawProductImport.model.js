/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

const rawProductImportSchema = new mongoose.Schema({
	supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'SupplierConfig', required: true },
	supplierName: { type: String, required: true, trim: true },
	externalProductId: { type: String, required: true, trim: true },
	rawPayload: { type: mongoose.Schema.Types.Mixed, default: {} },
	importStatus: { type: String, default: 'pending_review' },
	lastSyncTime: { type: Date, default: Date.now }
}, { timestamps: true });

rawProductImportSchema.index({ supplierId: 1, externalProductId: 1 }, { unique: true });

module.exports = mongoose.models.RawProductImport || mongoose.model('RawProductImport', rawProductImportSchema);
