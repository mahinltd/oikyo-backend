/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

const headerMenuSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    
    // Parent-Child Relationship for Nested / Dropdown Menus
    parentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'HeaderMenu', 
        default: null // null means it's a Root Level Menu
    },
    
    // Link Configuration
    linkType: { 
        type: String, 
        enum: ['custom_url', 'cms_page', 'catalog_category'], 
        default: 'custom_url' 
    },
    url: { type: String, default: '#' }, // Used if linkType is custom_url
    referenceId: { 
        type: mongoose.Schema.Types.ObjectId, 
        default: null // Will store Category ID or CMS Page ID
    },

    // UI & Display Rules
    order: { type: Number, default: 0 },
    visibility: { type: Boolean, default: true },
    isMegaMenu: { type: Boolean, default: false } // If true, Frontend will render a wide Mega Menu

}, { timestamps: true });

// Indexing for faster Tree generation
headerMenuSchema.index({ parentId: 1, order: 1 });

module.exports = mongoose.model('HeaderMenu', headerMenuSchema);