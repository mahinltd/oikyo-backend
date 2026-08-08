/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

const mediaFolderSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Folder name is required'],
        trim: true,
        unique: true
    },
    slug: { 
        type: String, 
        required: true,
        lowercase: true,
        unique: true
    },
    description: { 
        type: String, 
        trim: true,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('MediaFolder', mediaFolderSchema);