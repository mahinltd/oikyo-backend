/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const SeoSetting = require('../models/seo.model');

class SeoDal {
    async getGlobalSeo() {
        return await SeoSetting.findOne({ isGlobal: true }).lean();
    }

    async upsertGlobalSeo(seoData) {
        return await SeoSetting.findOneAndUpdate(
            { isGlobal: true },
            { $set: seoData },
            { new: true, upsert: true, runValidators: true }
        );
    }
}

module.exports = new SeoDal();