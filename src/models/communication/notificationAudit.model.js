/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

const notificationAuditSchema = new mongoose.Schema({
    eventName: { 
        type: String, 
        required: true,
        index: true 
    },
    recipient: { 
        type: String, 
        required: true // Email address or Device Token
    }, 
    channel: { 
        type: String, 
        enum: ['email', 'push', 'in_app', 'sms'], 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['queued', 'sent', 'delivered', 'failed', 'read'], 
        default: 'queued',
        index: true
    },
    payloadSnippet: { 
        type: mongoose.Schema.Types.Mixed // Safe/redacted payload for debugging
    }, 
    errorDetails: { 
        type: String, 
        default: null 
    }
}, { timestamps: true });

module.exports = mongoose.model('NotificationAudit', notificationAuditSchema);