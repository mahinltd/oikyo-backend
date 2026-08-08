/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    deviceId: { type: String, required: true }, // Unique identifier for the device/browser
    deviceName: { type: String }, 
    browser: { type: String },
    browserVersion: { type: String },
    operatingSystem: { type: String },
    operatingSystemVersion: { type: String },
    deviceType: { type: String, enum: ['desktop', 'mobile', 'tablet', 'unknown'], default: 'unknown' },
    ipAddress: { type: String },
    country: { type: String },
    region: { type: String },
    city: { type: String },
    timezone: { type: String },
    language: { type: String },
    userAgent: { type: String },
    lastLoginAt: { type: Date, default: Date.now },
    lastActivityAt: { type: Date, default: Date.now },
    isCurrentSession: { type: Boolean, default: true },
    loginMethod: { type: String, enum: ['email', 'mobile'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);