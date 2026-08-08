/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const Theme = require('../models/theme.model');

class ThemeDal {
    async createTheme(themeData) {
        return await Theme.create(themeData);
    }

    async getActiveTheme() {
        return await Theme.findOne({ status: 'active' });
    }

    async getAllThemes() {
        return await Theme.find().sort({ createdAt: -1 });
    }

    async getThemeById(themeId) {
        return await Theme.findById(themeId);
    }

    async updateTheme(themeId, updateData) {
        return await Theme.findByIdAndUpdate(themeId, updateData, { new: true, runValidators: true });
    }

    async deactivateAllThemes() {
        // Sets all active themes to draft (Used during theme switching)
        return await Theme.updateMany({ status: 'active' }, { $set: { status: 'draft' } });
    }
}

module.exports = new ThemeDal();