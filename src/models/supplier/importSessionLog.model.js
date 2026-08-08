/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

const importSessionLogSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, unique: true },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'SupplierConfig', required: true },
    
    // Concurrency & Resume Control
    status: { 
        type: String, 
        enum: ['running', 'completed', 'failed', 'interrupted'], 
        default: 'running' 
    },
    checkpoint: {
        lastProcessedPage: { type: Number, default: 0 },
        totalPagesFound: { type: Number, default: 0 }
    },
    
    // Performance & Execution Time
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date, default: null },
    durationMs: { type: Number, default: 0 },
    
    // Orchestration Metrics
    metrics: {
        totalFetched: { type: Number, default: 0 },
        newDrafts: { type: Number, default: 0 },
        updated: { type: Number, default: 0 },
        duplicatesSkipped: { type: Number, default: 0 },
        sentToReview: { type: Number, default: 0 },
        failedValidation: { type: Number, default: 0 },
        apiErrors: { type: Number, default: 0 }
    },
    
    // Error Logging (Truncated for space)
    errorLog: [{
        externalId: String,
        reason: String,
        time: { type: Date, default: Date.now }
    }]
});

// Index for finding the last incomplete session to resume
importSessionLogSchema.index({ supplierId: 1, status: 1, 'checkpoint.lastProcessedPage': -1 });

module.exports = mongoose.model('ImportSessionLog', importSessionLogSchema);