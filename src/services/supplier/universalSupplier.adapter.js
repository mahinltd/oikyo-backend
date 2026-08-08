/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mappingResolver = require('./dynamicMapping.resolver');
const ruleEngine = require('./transformationRule.engine');

class UniversalSupplierAdapter {
    
    /**
     * Transforms a raw supplier product into the OIKYO Standard Product Object.
     * @param {Object} rawProduct - A single product object from the API response
     * @param {Object} mappingProfile - The mapping and transformation rules from SupplierConfig
     * @param {String} baseUrl - The base URL of the supplier (used for relative image paths)
     * @returns {Object} - The OIKYO Standard Product Object
     */
    transformToStandard(rawProduct, mappingProfile, baseUrl = '') {
        
        // 1. Core Extraction & Transformation
        const standardProduct = {
            externalId: this._extractAndTransform(rawProduct, mappingProfile.fields.externalId),
            title: this._extractAndTransform(rawProduct, mappingProfile.fields.title),
            description: this._extractAndTransform(rawProduct, mappingProfile.fields.description),
            
            pricing: {
                costPrice: this._extractAndTransform(rawProduct, mappingProfile.fields.costPrice),
                regularPrice: this._extractAndTransform(rawProduct, mappingProfile.fields.regularPrice),
                salePrice: this._extractAndTransform(rawProduct, mappingProfile.fields.salePrice)
            },
            
            inventory: {
                sku: this._extractAndTransform(rawProduct, mappingProfile.fields.sku),
                stockStatus: this._extractAndTransform(rawProduct, mappingProfile.fields.stockStatus)
            },

            media: this._processMedia(rawProduct, mappingProfile.fields.media, baseUrl),
            attributes: this._processArrayFields(rawProduct, mappingProfile.fields.attributes),
            variants: this._processArrayFields(rawProduct, mappingProfile.fields.variants)
        };

        return standardProduct;
    }

    /**
     * Helper: Extracts value using resolver and applies transformation rules.
     */
    _extractAndTransform(rawProduct, fieldConfig) {
        if (!fieldConfig || !fieldConfig.path) return null;
        
        let value = mappingResolver.resolveField(rawProduct, fieldConfig.path);
        
        if (fieldConfig.rules && fieldConfig.rules.length > 0) {
            value = ruleEngine.applyRules(value, fieldConfig.rules);
        }
        
        return value;
    }

    /**
     * Helper: Processes Media (Images) - Handles Relative URLs and Deduplication
     */
    _processMedia(rawProduct, mediaConfig, baseUrl) {
        const mediaResult = { thumbnail: null, gallery: [] };
        if (!mediaConfig) return mediaResult;

        // Process Thumbnail
        let thumbUrl = this._extractAndTransform(rawProduct, mediaConfig.thumbnail);
        if (thumbUrl) {
            mediaResult.thumbnail = thumbUrl.startsWith('http') ? thumbUrl : `${baseUrl.replace(/\/$/, '')}/${thumbUrl.replace(/^\//, '')}`;
        }

        // Process Gallery Array
        if (mediaConfig.gallery && mediaConfig.gallery.arrayPath) {
            const rawGalleryArray = mappingResolver.resolveArray(rawProduct, mediaConfig.gallery.arrayPath);
            const gallerySet = new Set(); // Using Set to remove duplicate URLs

            rawGalleryArray.forEach(item => {
                let imgUrl = mappingResolver.resolveField(item, mediaConfig.gallery.urlKey);
                if (imgUrl) {
                    imgUrl = imgUrl.startsWith('http') ? imgUrl : `${baseUrl.replace(/\/$/, '')}/${imgUrl.replace(/^\//, '')}`;
                    gallerySet.add(imgUrl);
                }
            });

            mediaResult.gallery = Array.from(gallerySet);
        }

        return mediaResult;
    }

    /**
     * Helper: Processes Array structures like Attributes and Variants dynamically
     */
    _processArrayFields(rawProduct, arrayConfig) {
        if (!arrayConfig || !arrayConfig.arrayPath) return [];
        
        const rawArray = mappingResolver.resolveArray(rawProduct, arrayConfig.arrayPath);
        const processedArray = [];

        rawArray.forEach(item => {
            const processedItem = {};
            // Loop through mapping keys (e.g., 'sku', 'name', 'priceModifier' for variants)
            for (const [standardKey, itemFieldConfig] of Object.entries(arrayConfig.itemMapping)) {
                processedItem[standardKey] = this._extractAndTransform(item, itemFieldConfig);
            }
            processedArray.push(processedItem);
        });

        return processedArray;
    }
}

module.exports = new UniversalSupplierAdapter();