/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

const aiErrorLogSchema = new mongoose.Schema({
    providerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'AiProvider', 
        required: true,
        index: true 
    },
    providerCode: { 
        type: String, 
        required: true,
        lowercase: true 
    },
    modelCode: { 
        type: String, 
        default: null 
    },
    errorCode: { 
        type: String, 
        default: 'UNKNOWN_ERROR' 
    },
    errorMessage: { 
        type: String, 
        required: true 
    },
    httpStatus: { 
        type: Number, 
        default: 500 
    },
    requestSummary: { 
        type: String, 
        default: null // Short sanitized summary of prompt/event for debugging
    },
    timestamp: { 
        type: Date, 
        default: Date.now
    }
}, { timestamps: false });

// Auto-expire logs after 30 days to keep database lean (TTL Index)
aiErrorLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('AiErrorLog', aiErrorLogSchema);