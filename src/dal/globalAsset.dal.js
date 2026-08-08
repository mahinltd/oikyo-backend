/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const GlobalAsset = require('../models/globalAsset.model');

class GlobalAssetDal {
    async getAssets() {
        return await GlobalAsset.findOne({ isGlobal: true });
    }

    async upsertAssets(assetData) {
        return await GlobalAsset.findOneAndUpdate(
            { isGlobal: true },
            { $set: assetData },
            { new: true, upsert: true, runValidators: true }
        );
    }
}

module.exports = new GlobalAssetDal();