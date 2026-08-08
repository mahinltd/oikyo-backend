/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

const rawImportHistorySchema = new mongoose.Schema({
    supplierId: { 
        type: String, 
        required: true,
        index: true 
    },
    externalProductId: { 
        type: String, 
        required: true,
        index: true 
    },
    rawPayload: { 
        type: mongoose.Schema.Types.Mixed, // Stores the complete original JSON from Supplier API
        required: true 
    },
    lastSyncTime: { 
        type: Date, 
        default: Date.now 
    },
    syncStatus: { 
        type: String, 
        enum: ['success', 'failed', 'partial'], 
        default: 'success' 
    }
}, { timestamps: true });

// Ensures we can quickly find the raw data of a specific product from a specific supplier
rawImportHistorySchema.index({ supplierId: 1, externalProductId: 1 }, { unique: true });

module.exports = mongoose.model('RawImportHistory', rawImportHistorySchema);