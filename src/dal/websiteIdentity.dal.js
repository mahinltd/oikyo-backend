/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const WebsiteIdentity = require('../models/websiteIdentity.model');

class WebsiteIdentityDal {
    async getIdentity() {
        return await WebsiteIdentity.findOne({ isGlobal: true });
    }

    async upsertIdentity(identityData) {
        // Upsert: Find the global config. If it exists, update it. If not, create it.
        return await WebsiteIdentity.findOneAndUpdate(
            { isGlobal: true },
            { $set: identityData },
            { new: true, upsert: true, runValidators: true }
        );
    }
}

module.exports = new WebsiteIdentityDal();