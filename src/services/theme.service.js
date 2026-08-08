/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const themeDal = require('../dal/theme.dal');
const ApiError = require('../utils/ApiError');

class ThemeService {
    async createNewTheme(data) {
        // By default, a new theme is always created as a draft
        data.status = 'draft';
        return await themeDal.createTheme(data);
    }

    async getActiveTheme() {
        const activeTheme = await themeDal.getActiveTheme();
        if (!activeTheme) {
            // Fallback object to prevent frontend crash if no theme is active
            return {
                themeName: 'System Default',
                colors: { primary: '#000000', secondary: '#ffffff', background: '#f4f6f8' },
                typography: { primaryFont: 'sans-serif' }
            };
        }
        return activeTheme;
    }

    async getAllThemes() {
        return await themeDal.getAllThemes();
    }

    async updateThemeData(themeId, data) {
        // Prevent changing status directly via standard update
        if (data.status) {
            delete data.status;
        }
        const updatedTheme = await themeDal.updateTheme(themeId, data);
        if (!updatedTheme) {
            throw new ApiError(404, 'Theme not found');
        }
        return updatedTheme;
    }

    async activateTheme(themeId) {
        const themeToActivate = await themeDal.getThemeById(themeId);
        if (!themeToActivate) {
            throw new ApiError(404, 'Theme not found');
        }

        // 1. Deactivate all currently active themes
        await themeDal.deactivateAllThemes();

        // 2. Activate the requested theme
        const activatedTheme = await themeDal.updateTheme(themeId, { status: 'active' });
        
        return activatedTheme;
    }
}

module.exports = new ThemeService();