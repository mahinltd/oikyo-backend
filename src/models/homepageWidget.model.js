/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

const homepageWidgetSchema = new mongoose.Schema({
    title: { type: String, trim: true }, // Optional for some widgets like Navigation
    subtitle: { type: String, trim: true },
    
    // Core Architecture
    widgetType: { 
        type: String, 
        enum: [
            'navigation', 'hero_slider', 'shop_by_category', 'trending_products',
            'featured_products', 'flash_sale', 'new_arrival', 'best_selling', 
            'promotional_banner', 'recommended_products', 'brand_showcase', 
            'customer_review', 'newsletter', 'custom_html'
        ], 
        required: true 
    },
    order: { type: Number, default: 0 },
    visibility: { type: Boolean, default: true },
    
    // Specific Config for Navigation Widget
    navigationConfig: {
        searchEnabled: { type: Boolean, default: true },
        searchPlaceholder: { type: String, default: 'Search for products...' },
        wishlistEnabled: { type: Boolean, default: true },
        cartEnabled: { type: Boolean, default: true },
        accountEnabled: { type: Boolean, default: true },
        notificationEnabled: { type: Boolean, default: true }
    },

    // UI Configuration
    style: { type: String, default: 'default' },
    responsiveConfig: {
        desktopLayout: { type: String, enum: ['grid', 'slider', 'list', 'hidden'], default: 'grid' },
        mobileLayout: { type: String, enum: ['grid', 'slider', 'scroll', 'hidden'], default: 'scroll' }
    },

    // Data Engine Configuration
    dataSource: {
        sourceType: { 
            type: String, 
            enum: ['manual', 'trending', 'best_selling', 'most_viewed', 'new_arrival', 'custom_collection', 'catalog_category', 'none'], 
            default: 'none' 
        },
        // For manual selections or specific categories/collections
        referenceIds: [{ type: mongoose.Schema.Types.ObjectId }] 
    },
    productLimit: { type: Number, default: 10 },

    // Campaign/Scheduling Rules
    schedule: {
        startTime: { type: Date, default: null },
        endTime: { type: Date, default: null }
    }

}, { timestamps: true });

// Indexing for high-performance frontend queries
homepageWidgetSchema.index({ visibility: 1, order: 1 });
homepageWidgetSchema.index({ 'schedule.startTime': 1, 'schedule.endTime': 1 });

module.exports = mongoose.model('HomepageWidget', homepageWidgetSchema);