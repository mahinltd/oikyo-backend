/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const toggleDal = require('../dal/featureToggle.dal');
const ApiError = require('../utils/ApiError');
const slugify = require('slugify');

class FeatureToggleService {
    
    async createNewToggle(data) {
        data.slug = slugify(data.slug, { lower: true, strict: true, replacement: '_' });
        
        const existing = await toggleDal.getToggleBySlug(data.slug);
        if (existing) {
            throw new ApiError(400, 'A feature toggle with this slug already exists.');
        }

        return await toggleDal.createToggle(data);
    }

    // Used by Frontend to dynamically show/hide UI components
    async getPublicConfiguration() {
        const activeToggles = await toggleDal.getActiveToggles();
        
        // Transform array into a Key-Value map for O(1) lookup on the frontend
        // Example: { "guest_checkout": "enabled", "blog_module": "beta" }
        const configMap = {};
        activeToggles.forEach(toggle => {
            configMap[toggle.slug] = toggle.status;
        });
        
        return configMap;
    }

    async getAdminList() {
        return await toggleDal.getAllToggles();
    }

    async updateToggle(id, data) {
        if (data.slug) {
            data.slug = slugify(data.slug, { lower: true, strict: true, replacement: '_' });
        }
        const updated = await toggleDal.updateToggle(id, data);
        if (!updated) throw new ApiError(404, 'Toggle not found');
        return updated;
    }

    async deleteToggle(id) {
        const deleted = await toggleDal.deleteToggle(id);
        if (!deleted) throw new ApiError(404, 'Toggle not found');
        return true;
    }

    // Utility for Backend Middlewares to check feature availability
    async isFeatureEnabled(slug) {
        const feature = await toggleDal.getToggleBySlug(slug);
        if (!feature) return false;
        return ['enabled', 'beta'].includes(feature.status);
    }
}

module.exports = new FeatureToggleService();