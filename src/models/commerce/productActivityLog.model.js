/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

const productActivityLogSchema = new mongoose.Schema({
    productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true,
        index: true 
    },
    actionType: { 
        type: String, 
        enum: [
            'imported_raw', 
            'ai_suggestion_applied', 
            'manual_edit_saved', 
            'submitted_for_review', 
            'review_approved', 
            'review_rejected', 
            'published', 
            'scheduled_publish_triggered'
        ], 
        required: true 
    },
    performedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        default: null // Null indicates system/cron job performed the action
    },
    details: { 
        type: String, 
        required: true 
    }, // e.g., "AI SEO generation applied to meta tags."
    metadata: { 
        type: mongoose.Schema.Types.Mixed, 
        default: {} 
    } // Optional extra data (e.g., AI taskType)
}, { timestamps: true });

module.exports = mongoose.model('ProductActivityLog', productActivityLogSchema);