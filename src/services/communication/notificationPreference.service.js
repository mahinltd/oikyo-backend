/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const NotificationPreference = require('../../models/communication/notificationPreference.model');

class NotificationPreferenceService {
    
    /**
     * Check if a specific channel is allowed for a user and event
     * @param {string} userId - User ID
     * @param {string} eventName - Event name
     * @param {string} channel - Channel type ('email', 'push', 'inApp')
     * @returns {Promise<boolean>} Whether the channel is allowed
     */
    async isChannelAllowed(userId, eventName, channel) {
        try {
            // Find user preferences
            const userPreferences = await NotificationPreference.findOne({ userId });
            
            if (!userPreferences) {
                // If no preferences exist, default to allowing all channels
                return true;
            }
            
            // Find the specific event in preferences
            const eventPref = userPreferences.events.find(event => event.eventName === eventName);
            
            if (!eventPref) {
                // If event is not configured, default to allowing all channels
                return true;
            }
            
            // Return the channel setting (default to true if not specified)
            return eventPref.channels[channel] ?? true;
        } catch (error) {
            console.error('[Notification Preference Service Error] Check channel allowed:', error.message);
            // On error, default to allowing the channel
            return true;
        }
    }
    
    /**
     * Get all preferences for a user
     * @param {string} userId - User ID
     * @returns {Promise<Object>} User preferences
     */
    async getUserPreferences(userId) {
        try {
            return await NotificationPreference.findOne({ userId });
        } catch (error) {
            console.error('[Notification Preference Service Error] Get user preferences:', error.message);
            return null;
        }
    }
    
    /**
     * Set preferences for a user
     * @param {string} userId - User ID
     * @param {string} eventName - Event name
     * @param {Object} channels - Channel preferences
     * @returns {Promise<Object>} Updated preferences
     */
    async setUserPreferences(userId, eventName, channels) {
        try {
            let userPreferences = await NotificationPreference.findOne({ userId });
            
            if (!userPreferences) {
                userPreferences = new NotificationPreference({
                    userId,
                    userRole: 'customer', // Default role, will be updated if needed
                    events: []
                });
            }
            
            const eventIndex = userPreferences.events.findIndex(event => event.eventName === eventName);
            
            if (eventIndex > -1) {
                userPreferences.events[eventIndex].channels = {
                    ...userPreferences.events[eventIndex].channels,
                    ...channels
                };
            } else {
                userPreferences.events.push({
                    eventName,
                    channels
                });
            }
            
            return await userPreferences.save();
        } catch (error) {
            console.error('[Notification Preference Service Error] Set user preferences:', error.message);
            throw error;
        }
    }
}

module.exports = new NotificationPreferenceService();