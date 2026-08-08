/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const Joi = require('joi');

const homepageValidation = {
    createUpdateWidgetSchema: Joi.object({
        title: Joi.string().allow('', null),
        subtitle: Joi.string().allow('', null),
        widgetType: Joi.string().valid(
            'navigation', 'hero_slider', 'shop_by_category', 'trending_products',
            'featured_products', 'flash_sale', 'new_arrival', 'best_selling', 
            'promotional_banner', 'recommended_products', 'brand_showcase', 
            'customer_review', 'newsletter', 'custom_html'
        ).required(),
        order: Joi.number().integer().min(0).optional(),
        visibility: Joi.boolean().optional(),
        
        navigationConfig: Joi.object({
            searchEnabled: Joi.boolean(),
            searchPlaceholder: Joi.string(),
            wishlistEnabled: Joi.boolean(),
            cartEnabled: Joi.boolean(),
            accountEnabled: Joi.boolean(),
            notificationEnabled: Joi.boolean()
        }).optional(),

        style: Joi.string().optional(),
        responsiveConfig: Joi.object({
            desktopLayout: Joi.string().valid('grid', 'slider', 'list', 'hidden'),
            mobileLayout: Joi.string().valid('grid', 'slider', 'scroll', 'hidden')
        }).optional(),

        dataSource: Joi.object({
            sourceType: Joi.string().valid('manual', 'trending', 'best_selling', 'most_viewed', 'new_arrival', 'custom_collection', 'catalog_category', 'none').required(),
            referenceIds: Joi.array().items(Joi.string().hex().length(24)).optional()
        }).optional(),
        
        productLimit: Joi.number().integer().min(1).max(50).optional(),
        
        schedule: Joi.object({
            startTime: Joi.date().iso().allow(null),
            endTime: Joi.date().iso().greater(Joi.ref('startTime')).allow(null)
        }).optional()
    }),

    reorderSchema: Joi.object({
        widgets: Joi.array().items(
            Joi.object({
                id: Joi.string().hex().length(24).required(),
                order: Joi.number().integer().min(0).required()
            })
        ).min(1).required()
    })
};

module.exports = homepageValidation;