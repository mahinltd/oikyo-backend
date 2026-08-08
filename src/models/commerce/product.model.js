/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    // ==========================================
    // 1. Core Information (Modular Section)
    // ==========================================
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: '' },
    tags: [{ type: String }],

    // ==========================================
    // 2. Taxonomy (Connected to WME)
    // ==========================================
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', default: null },

    // ==========================================
    // 3. Pricing Engine Data
    // ==========================================
    pricing: {
        costPrice: { type: Number, required: true }, // From Supplier/Manual
        markupPercentage: { type: Number, default: 0 }, // Admin defined profit margin
        sellingPrice: { type: Number, required: true }, // Auto-calculated or manually overridden
        comparePrice: { type: Number, default: null } // For strikethrough discounts
    },

    // ==========================================
    // 4. Media Manager Data
    // ==========================================
    media: {
        thumbnail: { type: String, default: null },
        gallery: [{ type: String }] // Cloudinary/S3 optimized URLs
    },

    // ==========================================
    // 5. Inventory & Variants
    // ==========================================
    sku: { type: String, required: true, unique: true },
    stockStatus: { type: String, enum: ['in_stock', 'out_of_stock'], default: 'in_stock' },
    stockQuantity: { type: Number, default: 0 },
    variants: [{
        sku: String,
        attributes: { type: Map, of: String }, // e.g., { "Size": "XL", "Color": "Red" }
        priceModifier: { type: Number, default: 0 },
        stock: { type: Number, default: 0 }
    }],

    // ==========================================
    // 6. Source & Fulfillment (STRICTLY IMMUTABLE)
    // ==========================================
    source: {
        originType: { type: String, enum: ['supplier_api', 'manual'], required: true },
        supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'SupplierConfig', required: true },
        externalProductId: { type: String, default: null }, // Mapped from API
        sourceUrl: { type: String, default: null },
        fulfillmentInstruction: { type: String, default: null } // Admin instruction for order team
    },

    // ==========================================
    // 7. SEO Meta
    // ==========================================
    seo: {
        metaTitle: { type: String, default: '' },
        metaDescription: { type: String, default: '' },
        keywords: [{ type: String }]
    },

    // ==========================================
    // 8. Publishing Workflow & State Machine
    // ==========================================
    status: { 
        type: String, 
        enum: ['draft', 'pending_review', 'published', 'archived'], 
        default: 'draft' 
    },
    publishing: {
        publishAt: { type: Date, default: null }, // For Scheduled Publish
        unpublishAt: { type: Date, default: null } // For Scheduled Unpublish
    },

    // ==========================================
    // 9. Editor Engine Controls (Locks & Quality)
    // ==========================================
    editorState: {
        isDirty: { type: Boolean, default: false }, // Tracks unsaved changes
        lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Pessimistic lock
        lockExpiry: { type: Date, default: null },
        qualityScore: { type: Number, min: 0, max: 100, default: 0 } // Auto-calculated score
    }
}, { 
    timestamps: true,
    optimisticConcurrency: true // Enables Optimistic Locking (__v tracking)
});

// Indexes for fast querying in Admin Panel and Storefront
productSchema.index({ status: 1, 'publishing.publishAt': 1 });
productSchema.index({ 'source.supplierId': 1, 'source.externalProductId': 1 });

module.exports = mongoose.model('Product', productSchema);