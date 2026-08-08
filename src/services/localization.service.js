/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const localizationDal = require('../dal/localization.dal');
const ApiError = require('../utils/ApiError');

class LocalizationService {
    
    async createLanguage(data) {
        if (data.isDefault) {
            await localizationDal.resetDefaultLanguage(); // Only one default language allowed
        }
        return await localizationDal.createLanguage(data);
    }

    // Returns the list of available languages for the Frontend Dropdown (e.g., English, Bengali)
    async getAvailableLanguages() {
        return await localizationDal.getActiveLanguages();
    }

    // Fetches the specific dictionary based on user selection
    async getTranslations(languageCode) {
        let dictionary = null;

        if (languageCode) {
            dictionary = await localizationDal.getDictionaryByCode(languageCode);
        }

        // Fallback to default if requested language is not found or not provided
        if (!dictionary) {
            dictionary = await localizationDal.getDefaultDictionary();
        }

        if (!dictionary) {
            // Enterprise Fallback: To prevent frontend crash if DB is completely empty
            return {
                languageCode: 'en',
                translations: { "error_loading_lang": "Failed to load language" }
            };
        }

        return {
            languageCode: dictionary.languageCode,
            translations: dictionary.translations
        };
    }

    async updateLanguage(id, data) {
        if (data.isDefault) {
            await localizationDal.resetDefaultLanguage();
        }
        const updated = await localizationDal.updateLanguage(id, data);
        if (!updated) throw new ApiError(404, 'Language not found');
        return updated;
    }
}

module.exports = new LocalizationService();