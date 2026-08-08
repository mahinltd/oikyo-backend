/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const FeatureToggle = require('../models/featureToggle.model');

class FeatureToggleDal {
    async createToggle(data) {
        return await FeatureToggle.create(data);
    }

    async getActiveToggles() {
        // Frontend only needs to know about features that are accessible in some way
        return await FeatureToggle.find({ 
            status: { $in: ['enabled', 'beta', 'deprecated'] } 
        }).select('slug status type -_id').lean();
    }

    async getAllToggles() {
        return await FeatureToggle.find().sort({ createdAt: -1 });
    }

    async getToggleBySlug(slug) {
        return await FeatureToggle.findOne({ slug });
    }

    async updateToggle(id, data) {
        return await FeatureToggle.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }

    async deleteToggle(id) {
        return await FeatureToggle.findByIdAndDelete(id);
    }
}

module.exports = new FeatureToggleDal();