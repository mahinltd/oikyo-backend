/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const contactDal = require('../dal/contact.dal');
const ApiError = require('../utils/ApiError');

class ContactService {
    
    async getContactInfo() {
        let contact = await contactDal.getContactSettings();
        
        // E-commerce Fallback: Prevent frontend crash if admin hasn't set data yet
        if (!contact) {
            contact = {
                supportEmail: 'support@oikyo.me',
                supportPhone: '+880 1234 567890',
                corporateAddress: 'Dhaka, Bangladesh',
                workingHours: 'Saturday to Thursday: 9:00 AM - 6:00 PM',
                googleMapLink: null,
                socialLinks: []
            };
        }
        return contact;
    }

    async updateContactInfo(data) {
        try {
            return await contactDal.upsertContactSettings(data);
        } catch (error) {
            throw new ApiError(500, 'Failed to update contact and social settings');
        }
    }
}

module.exports = new ContactService();