/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const globalAssetDal = require('../dal/globalAsset.dal');
const ApiError = require('../utils/ApiError');

class GlobalAssetService {
    
    async getGlobalAssets() {
        let assets = await globalAssetDal.getAssets();
        
        // Return default assets if admin hasn't configured them yet
        if (!assets) {
            assets = {
                primaryLogo: null,
                textLogo: 'https://res.cloudinary.com/damfcrt68/image/upload/v1784455592/oikyo_text_uhi9w5.png',
                footerLogo: null,
                favicon: 'https://res.cloudinary.com/damfcrt68/image/upload/v1784311427/oikyo_icon_ceiilh.webp',
                defaultProductImage: null,
                defaultAvatar: null,
                paymentIcons: []
            };
        }
        return assets;
    }

    async updateGlobalAssets(data) {
        try {
            const updatedAssets = await globalAssetDal.upsertAssets(data);
            return updatedAssets;
        } catch (error) {
            throw new ApiError(500, 'Failed to update global assets');
        }
    }
}

module.exports = new GlobalAssetService();