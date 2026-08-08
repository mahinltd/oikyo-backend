/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

const mediaItemSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    altText: { type: String, trim: true, default: '' },
    url: { type: String, required: true }, // Secure Cloudinary URL
    publicId: { type: String, required: true }, // Needed to delete image from Cloudinary
    resourceType: { type: String, enum: ['image', 'video', 'document'], default: 'image' },
    format: { type: String }, // e.g., jpg, webp, png
    bytes: { type: Number }, // File size
    folderId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'MediaFolder', 
        default: null // null means it's in the root directory
    }
}, { timestamps: true });

// Indexing for faster media search and folder filtering
mediaItemSchema.index({ folderId: 1, createdAt: -1 });

module.exports = mongoose.model('MediaItem', mediaItemSchema);