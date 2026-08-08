/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const websiteIdentityDal = require('../dal/websiteIdentity.dal');
const ApiError = require('../utils/ApiError');

class WebsiteIdentityService {
    
    async getWebsiteIdentity() {
        let identity = await websiteIdentityDal.getIdentity();
        
        // Return a default structure if not set yet by Admin
        if (!identity) {
            identity = {
                websiteName: 'OIKYO',
                shortName: 'OIKYO',
                tagline: 'Your Trusted Enterprise Platform',
                description: 'Default description for OIKYO.',
                defaultLanguage: 'en'
            };
        }
        return identity;
    }

    async updateWebsiteIdentity(data) {
        try {
            const updatedIdentity = await websiteIdentityDal.upsertIdentity(data);
            return updatedIdentity;
        } catch (error) {
            throw new ApiError(500, 'Failed to update website identity');
        }
    }
}

module.exports = new WebsiteIdentityService();