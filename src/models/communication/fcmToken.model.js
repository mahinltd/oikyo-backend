/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

const fcmTokenSchema = new mongoose.Schema({
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
    token: {
        type: String,
        required: true,
        unique: true // FCM tokens should be unique
    },
    deviceInfo: {
        browser: { type: String },
        os: { type: String },
        deviceModel: { type: String },
        userAgent: { type: String }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastUsedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Index for finding tokens by user and role
fcmTokenSchema.index({ userId: 1, userRole: 1 });

module.exports = mongoose.model('FCMToken', fcmTokenSchema);