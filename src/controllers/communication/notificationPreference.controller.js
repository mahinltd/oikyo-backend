/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const NotificationPreference = require('../../models/communication/notificationPreference.model');
const ApiError = require('../../utils/ApiError');

class NotificationPreferenceController {
    
    /**
     * Get user's notification preferences
     * GET /notifications/preferences
     */
    async getUserPreferences(req, res, next) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            
            // Find or create user preferences
            let userPreferences = await NotificationPreference.findOne({ userId });
            
            if (!userPreferences) {
                // Create default preferences for the user
                userPreferences = new NotificationPreference({
                    userId,
                    userRole,
                    events: [] // Start with empty events array, defaults will apply
                });
                
                await userPreferences.save();
            }
            
            res.status(200).json({
                success: true,
                message: 'User notification preferences retrieved successfully',
                data: userPreferences
            });
        } catch (error) {
            next(error);
        }
    }
    
    /**
     * Update user's notification preferences
     * PATCH /notifications/preferences
     */
    async updateUserPreferences(req, res, next) {
        try {
            const { eventName, channels } = req.body;
            const userId = req.user.id;
            const userRole = req.user.role;
            
            if (!eventName) {
                throw new ApiError(400, 'Event name is required');
            }
            
            if (!channels || typeof channels !== 'object') {
                throw new ApiError(400, 'Channels object is required');
            }
            
            // Find or create user preferences
            let userPreferences = await NotificationPreference.findOne({ userId });
            
            if (!userPreferences) {
                userPreferences = new NotificationPreference({
                    userId,
                    userRole,
                    events: []
                });
            }
            
            // Check if the event already exists in preferences
            const eventIndex = userPreferences.events.findIndex(event => event.eventName === eventName);
            
            if (eventIndex > -1) {
                // Update existing event preferences
                userPreferences.events[eventIndex].channels = {
                    ...userPreferences.events[eventIndex].channels,
                    ...channels
                };
            } else {
                // Add new event preferences
                userPreferences.events.push({
                    eventName,
                    channels
                });
            }
            
            await userPreferences.save();
            
            res.status(200).json({
                success: true,
                message: 'Notification preferences updated successfully',
                data: userPreferences
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new NotificationPreferenceController();