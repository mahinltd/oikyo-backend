/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const preferenceService = require('../../services/communication/notificationPreference.service');

class NotificationPreferenceController {

    // GET: /api/v1/users/preferences
    async getMyPreferences(req, res, next) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            
            const preferences = await preferenceService.getUserPreferences(userId, userRole);
            
            res.status(200).json({ 
                success: true, 
                data: preferences 
            });
        } catch (error) {
            next(error);
        }
    }

    // PATCH: /api/v1/users/preferences
    // Body: { "eventName": "promotions", "channels": { "email": false, "push": true } }
    async updateMyPreferences(req, res, next) {
        try {
            const userId = req.user.id;
            const { eventName, channels } = req.body;
            
            const updatedPreferences = await preferenceService.updateEventPreference(userId, eventName, channels);
            
            res.status(200).json({ 
                success: true, 
                message: 'Notification preferences updated successfully.',
                data: updatedPreferences 
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new NotificationPreferenceController();