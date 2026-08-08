/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    message: { 
        type: String, 
        required: [true, 'Announcement message is required'],
        trim: true,
        maxlength: 150
    },
    link: { 
        type: String, 
        trim: true,
        default: null // Optional link when someone clicks the announcement
    },
    backgroundColor: { 
        type: String, 
        default: '#000000' // Default Black
    },
    textColor: { 
        type: String, 
        default: '#ffffff' // Default White
    },
    isActive: { 
        type: Boolean, 
        default: false 
    },
    schedule: {
        startTime: { type: Date, default: null },
        endTime: { type: Date, default: null }
    },
    isGlobal: {
        type: Boolean,
        default: true,
        unique: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);