/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
    isActive: { 
        type: Boolean, 
        default: false // By default, the website is live
    },
    message: { 
        type: String, 
        required: [true, 'Maintenance message is required'],
        trim: true,
        default: 'Our website is currently undergoing scheduled maintenance. We will be back shortly.'
    },
    expectedLiveTime: { 
        type: Date, 
        default: null // Optional: Tells customers exactly when to come back
    },
    bypassToken: {
        type: String,
        default: null // Optional: A secret token in URL that allows admins to view the site while it's in maintenance
    },
    isGlobal: {
        type: Boolean,
        default: true,
        unique: true
    }
}, { timestamps: true });

module.exports = mongoose.model('MaintenanceSetting', maintenanceSchema);