/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const sanitizeHtml = require('sanitize-html'); // Assuming sanitize-html package is installed

class TransformationRuleEngine {
    
    /**
     * Applies an array of transformation rules to a given value.
     * @param {any} value - The raw value from the supplier API
     * @param {Array} rules - Array of rule objects, e.g., [{ type: 'trim' }, { type: 'uppercase' }]
     * @returns {any} - The transformed value
     */
    applyRules(value, rules = []) {
        if (value === null || value === undefined) return value;
        if (!Array.isArray(rules) || rules.length === 0) return value;

        let transformedValue = value;

        for (const rule of rules) {
            transformedValue = this._applySingleRule(transformedValue, rule);
        }

        return transformedValue;
    }

    _applySingleRule(value, rule) {
        // Prevent breaking on null/undefined during chain
        if (value === null || value === undefined) {
            return rule.type === 'default' ? rule.value : value;
        }

        const stringValue = String(value);

        switch (rule.type) {
            case 'trim':
                return typeof value === 'string' ? value.trim() : value;
            case 'uppercase':
                return typeof value === 'string' ? value.toUpperCase() : value;
            case 'lowercase':
                return typeof value === 'string' ? value.toLowerCase() : value;
            case 'title_case':
                return typeof value === 'string' 
                    ? value.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
                    : value;
            case 'sanitize_html':
                return typeof value === 'string' 
                    ? sanitizeHtml(value, { allowedTags: ['b', 'i', 'em', 'strong', 'ul', 'li', 'p', 'br'] }) 
                    : value;
            case 'replace':
                return typeof value === 'string' 
                    ? value.split(rule.target).join(rule.replacement) 
                    : value;
            case 'regex_replace':
                if (typeof value === 'string') {
                    const regex = new RegExp(rule.pattern, rule.flags || 'g');
                    return value.replace(regex, rule.replacement);
                }
                return value;
            case 'prefix':
                return rule.value + stringValue;
            case 'suffix':
                return stringValue + rule.value;
            case 'number_conversion':
                const num = parseFloat(stringValue.replace(/[^0-9.-]+/g, ""));
                return isNaN(num) ? 0 : num;
            case 'boolean_conversion':
                if (typeof value === 'boolean') return value;
                const truthyValues = ['true', '1', 'yes', 'active', 'in_stock'];
                return truthyValues.includes(stringValue.toLowerCase());
            case 'default':
                // Handled above, but kept for logical completeness
                return value;
            default:
                return value; // Unknown rule, return as is
        }
    }
}

module.exports = new TransformationRuleEngine();