/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const Announcement = require('../models/announcement.model');

class AnnouncementDal {
    async getAnnouncementConfig() {
        return await Announcement.findOne({ isGlobal: true }).lean();
    }

    async upsertAnnouncement(data) {
        return await Announcement.findOneAndUpdate(
            { isGlobal: true },
            { $set: data },
            { new: true, upsert: true, runValidators: true }
        );
    }
}

module.exports = new AnnouncementDal();