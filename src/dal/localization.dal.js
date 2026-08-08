/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const Localization = require('../models/localization.model');

class LocalizationDal {
    async createLanguage(data) {
        return await Localization.create(data);
    }

    async getActiveLanguages() {
        return await Localization.find({ isActive: true }).select('languageCode languageName isDefault -_id').lean();
    }

    async getDictionaryByCode(languageCode) {
        return await Localization.findOne({ languageCode, isActive: true }).lean();
    }

    async getDefaultDictionary() {
        return await Localization.findOne({ isDefault: true }).lean();
    }

    async getAllLanguagesAdmin() {
        return await Localization.find().sort({ createdAt: 1 });
    }

    async updateLanguage(id, data) {
        return await Localization.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }

    async resetDefaultLanguage() {
        return await Localization.updateMany({ isDefault: true }, { $set: { isDefault: false } });
    }
}

module.exports = new LocalizationDal();