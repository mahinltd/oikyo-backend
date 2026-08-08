/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

const notificationPreferenceSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        index: true,
        unique: true // One preference document per user
    },
    userRole: { 
        type: String, 
        enum: ['admin', 'super_admin', 'staff', 'customer'], 
        required: true 
    },
    // Array to store specific preferences for specific events
    events: [{
        eventName: { type: String, required: true },
        channels: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            inApp: { type: Boolean, default: true }
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model('NotificationPreference', notificationPreferenceSchema);