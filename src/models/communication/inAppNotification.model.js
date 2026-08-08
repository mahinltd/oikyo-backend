/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

const inAppNotificationSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true,
        index: true
    },
    userRole: { 
        type: String, 
        enum: ['admin', 'super_admin', 'staff', 'customer'], 
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
        default: false
    },
    readAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

// Index for efficient retrieval by user and role
inAppNotificationSchema.index({ userId: 1, userRole: 1 });
inAppNotificationSchema.index({ userId: 1, isRead: 1 }); // For unread notifications query

module.exports = mongoose.model('InAppNotification', inAppNotificationSchema);