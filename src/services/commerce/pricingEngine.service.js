/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const ApiError = require('../../utils/ApiError');

class PricingEngineService {

    /**
     * Calculates the final selling price based on cost price and markup rules.
     * @param {Number} costPrice - The buying price from the supplier
     * @param {Number} markupPercentage - Admin defined profit margin (e.g., 20 for 20%)
     * @param {Number} manualSellingPrice - Optional: If admin explicitly types a selling price
     */
    calculatePricing(costPrice, markupPercentage = 0, manualSellingPrice = null) {
        if (costPrice === null || costPrice === undefined || costPrice < 0) {
            throw new ApiError(400, 'Invalid Cost Price provided to Pricing Engine.');
        }

        let calculatedSellingPrice = costPrice;

        // 1. Determine Base Selling Price (Auto Calculate vs Manual Override)
        if (manualSellingPrice !== null && manualSellingPrice > 0) {
            calculatedSellingPrice = manualSellingPrice;
        } else if (markupPercentage > 0) {
            calculatedSellingPrice = costPrice + (costPrice * (markupPercentage / 100));
        }

        // 2. Apply Psychological Rounding (e.g., 592 -> 590)
        calculatedSellingPrice = this._applyPsychologicalRounding(calculatedSellingPrice);

        // 3. Negative Profit Guard (Strict Business Rule)
        this._protectMargin(costPrice, calculatedSellingPrice);

        // 4. Calculate final effective markup percentage for database storage
        const effectiveMarkup = ((calculatedSellingPrice - costPrice) / costPrice) * 100;

        return {
            costPrice: costPrice,
            sellingPrice: calculatedSellingPrice,
            markupPercentage: parseFloat(effectiveMarkup.toFixed(2))
        };
    }

    /**
     * Helper: Applies psychological rounding to prices.
     * Rules: Rounds to nearest 10, or ends in 9. (Can be dynamic based on global config)
     */
    _applyPsychologicalRounding(price) {
        if (price < 10) return Math.ceil(price);
        
        // Example logic: Round to nearest 10
        // (592 -> 590, 596 -> 600)
        let rounded = Math.round(price / 10) * 10;
        
        // If you prefer ending in 9 (e.g., 599), you could do: 
        // if (rounded % 10 === 0 && rounded > 100) rounded -= 1; 

        return rounded;
    }

    /**
     * Helper: Hard block to prevent selling below cost price.
     */
    _protectMargin(costPrice, sellingPrice) {
        if (sellingPrice < costPrice) {
            throw new ApiError(
                422, 
                `Margin Error: Selling Price (${sellingPrice}) cannot be lower than Cost Price (${costPrice}).`
            );
        }
    }
}

module.exports = new PricingEngineService();