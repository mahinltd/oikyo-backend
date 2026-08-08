/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

const productRevisionSchema = new mongoose.Schema({
    productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true,
        index: true 
    },
    versionNumber: { 
        type: Number, 
        required: true 
    },
    // The complete JSON snapshot of the product BEFORE the edit was saved
    snapshot: { 
        type: mongoose.Schema.Types.Mixed, 
        required: true 
    },
    changedFields: [{ 
        type: String 
    }], // e.g., ['pricing.sellingPrice', 'description']
    editedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    commitMessage: { 
        type: String, 
        default: 'Auto-saved revision during product edit' 
    }
}, { timestamps: true });

// Prevent duplicate version numbers for the same product
productRevisionSchema.index({ productId: 1, versionNumber: 1 }, { unique: true });

module.exports = mongoose.model('ProductRevision', productRevisionSchema);