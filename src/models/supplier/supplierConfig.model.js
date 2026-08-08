/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

const supplierConfigSchema = new mongoose.Schema({
	supplierName: { type: String, required: true, trim: true },
	supplierCode: { type: String, required: true, unique: true, lowercase: true, trim: true },
	importType: { type: String, enum: ['api', 'manual'], required: true },
	apiConfig: {
		baseUrl: { type: String, default: '' },
		headers: { type: Map, of: String, default: {} },
		pagination: {
			pageParamName: { type: String, default: 'page' }
		}
	},
	mappingProfile: {
		fields: { type: mongoose.Schema.Types.Mixed, default: {} }
	},
	validationRules: { type: mongoose.Schema.Types.Mixed, default: {} },
	changeDetectionRules: { type: mongoose.Schema.Types.Mixed, default: {} },
	syncConfig: {
		isActive: { type: Boolean, default: false },
		lastSyncAt: { type: Date, default: null },
		lastSyncStatus: { type: String, default: null }
	},
	isActive: { type: Boolean, default: true },
	priority: { type: Number, default: 99 }
}, { timestamps: true });

module.exports = mongoose.models.SupplierConfig || mongoose.model('SupplierConfig', supplierConfigSchema);
