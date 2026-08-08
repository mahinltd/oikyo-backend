/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const seoDal = require('../dal/seo.dal');
const ApiError = require('../utils/ApiError');

class SeoService {
    
    async getSeoSettings() {
        let seo = await seoDal.getGlobalSeo();
        
        // Return default SEO if admin hasn't configured it yet
        if (!seo) {
            seo = {
                metaTitle: 'OIKYO - Your Trusted Enterprise Platform',
                metaDescription: 'Shop the best products at OIKYO. Experience seamless enterprise-level e-commerce.',
                keywords: 'e-commerce, shopping, oikyo, enterprise',
                ogTitle: 'OIKYO Platform',
                ogDescription: 'Shop the best products at OIKYO.',
                ogImage: null,
                twitterHandle: '@oikyo'
            };
        }
        return seo;
    }

    async updateSeoSettings(data) {
        try {
            return await seoDal.upsertGlobalSeo(data);
        } catch (error) {
            throw new ApiError(500, 'Failed to update Global SEO settings');
        }
    }
}

module.exports = new SeoService();