/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mappingResolver = require('./dynamicMapping.resolver');

class ChangeDetectionEngine {
    
    /**
     * Compares the existing product in DB with the newly fetched standard product.
     * @param {Object} existingProduct - Product document from Unified Repository
     * @param {Object} newStandardProduct - Freshly parsed Standard Product Object
     * @param {Array} triggerFields - Paths that should trigger a review (e.g., ['pricing.costPrice'])
     * @returns {Object} { hasChanges: boolean, needsReview: boolean, reviewNote: String }
     */
    detect(existingProduct, newStandardProduct, triggerFields = ['pricing.costPrice', 'inventory.stockStatus']) {
        let needsReview = false;
        const changes = [];

        // 1. Compare fields strictly based on Admin configuration
        for (const fieldPath of triggerFields) {
            const oldValue = mappingResolver.resolveField(existingProduct, fieldPath);
            const newValue = mappingResolver.resolveField(newStandardProduct, fieldPath);

            // Type-safe comparison
            if (String(oldValue) !== String(newValue)) {
                needsReview = true;
                changes.push(`${fieldPath} changed from '${oldValue}' to '${newValue}'`);
            }
        }

        return {
            hasChanges: changes.length > 0,
            needsReview,
            reviewNote: needsReview ? `Changes detected: ${changes.join(' | ')}` : null
        };
    }
}

module.exports = new ChangeDetectionEngine();