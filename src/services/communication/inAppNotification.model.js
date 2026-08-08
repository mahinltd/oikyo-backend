/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

const inAppNotificationSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        index: true 
    },
    userRole: {
        type: String,
        enum: ['admin', 'staff', 'customer'],
        required: true
    },
    title: { 
        type: String, 
        required: true 
    },
    message: { 
        type: String, 
        required: true 
    },
    eventName: { 
        type: String, 
        required: true 
    },
    actionUrl: { 
        type: String, 
        default: null 
    },
    isRead: { 
        type: Boolean, 
        default: false,
        index: true
    }
}, { timestamps: true });

// Optimize query for fetching user's latest unread notifications
inAppNotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('InAppNotification', inAppNotificationSchema);