/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const ContactSetting = require('../models/contact.model');

class ContactDal {
    async getContactSettings() {
        return await ContactSetting.findOne({ isGlobal: true }).lean();
    }

    async upsertContactSettings(contactData) {
        return await ContactSetting.findOneAndUpdate(
            { isGlobal: true },
            { $set: contactData },
            { new: true, upsert: true, runValidators: true }
        );
    }
}

module.exports = new ContactDal();