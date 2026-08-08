/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mappingResolver = require('./dynamicMapping.resolver');

class ImportValidationEngine {
    
    /**
     * Validates a standard product object against dynamic rules defined by Admin.
     * @param {Object} standardProduct - The transformed OIKYO Standard Product Object
     * @param {Object} validationRules - Rules from SupplierConfig (e.g., required fields, minPrice)
     * @returns {Object} { isValid: boolean, errors: Array }
     */
    validate(standardProduct, validationRules = {}) {
        const errors = [];

        // 1. Absolute Mandatory Core Fields (System Level)
        if (!standardProduct.externalId) errors.push('Missing mandatory field: externalId');
        if (!standardProduct.title) errors.push('Missing mandatory field: title');
        if (standardProduct.pricing?.costPrice === undefined || standardProduct.pricing?.costPrice === null) {
            errors.push('Missing mandatory field: pricing.costPrice');
        }

        // 2. Dynamic Required Fields (Admin Configured)
        const requiredFields = validationRules.requiredFields || [];
        requiredFields.forEach(fieldPath => {
            const value = mappingResolver.resolveField(standardProduct, fieldPath);
            if (value === null || value === '' || value === undefined) {
                errors.push(`Missing admin-configured required field: ${fieldPath}`);
            }
        });

        // 3. Pricing & Numeric Constraints
        const costPrice = standardProduct.pricing?.costPrice;
        if (costPrice !== undefined) {
            if (validationRules.minCostPrice && costPrice < validationRules.minCostPrice) {
                errors.push(`Cost price (${costPrice}) is below minimum allowed (${validationRules.minCostPrice})`);
            }
            if (validationRules.maxCostPrice && costPrice > validationRules.maxCostPrice) {
                errors.push(`Cost price (${costPrice}) exceeds maximum allowed (${validationRules.maxCostPrice})`);
            }
        }

        // 4. Media Validations
        if (validationRules.requireThumbnail && !standardProduct.media?.thumbnail) {
            errors.push('Thumbnail image is required but missing.');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

module.exports = new ImportValidationEngine();