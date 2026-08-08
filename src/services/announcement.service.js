/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const announcementDal = require('../dal/announcement.dal');
const ApiError = require('../utils/ApiError');

class AnnouncementService {
    
    // For Frontend/Public API: Applies Scheduling Rules
    async getActiveAnnouncement() {
        const config = await announcementDal.getAnnouncementConfig();
        
        if (!config || !config.isActive) {
            return { isVisible: false };
        }

        const now = new Date();
        const { startTime, endTime } = config.schedule || {};

        // Scheduling logic
        if (startTime && new Date(startTime) > now) {
            return { isVisible: false }; // Campaign hasn't started yet
        }
        if (endTime && new Date(endTime) < now) {
            return { isVisible: false }; // Campaign has ended
        }

        return {
            isVisible: true,
            message: config.message,
            link: config.link,
            backgroundColor: config.backgroundColor,
            textColor: config.textColor
        };
    }

    // For Admin Panel: Returns full raw configuration
    async getAdminConfig() {
        const config = await announcementDal.getAnnouncementConfig();
        if (!config) {
            return {
                message: 'Welcome to OIKYO! Enjoy free shipping on your first order.',
                isActive: false
            };
        }
        return config;
    }

    async updateAnnouncement(data) {
        try {
            return await announcementDal.upsertAnnouncement(data);
        } catch (error) {
            throw new ApiError(500, 'Failed to update announcement settings');
        }
    }
}

module.exports = new AnnouncementService();