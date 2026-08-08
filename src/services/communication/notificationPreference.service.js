/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const NotificationPreference = require('../../models/communication/notificationPreference.model');
const ApiError = require('../../utils/ApiError');

class NotificationPreferenceService {
    
    // Get user preferences (Create default if it doesn't exist)
    async getUserPreferences(userId, userRole) {
        let prefs = await NotificationPreference.findOne({ userId });
        
        if (!prefs) {
            prefs = await NotificationPreference.create({ userId, userRole, events: [] });
        }
        
        return prefs;
    }

    // Update preference for a specific event
    async updateEventPreference(userId, eventName, channels) {
        const prefs = await NotificationPreference.findOne({ userId });
        if (!prefs) throw new ApiError(404, 'Preferences not found for this user.');

        // Find if the event already exists in the user's preference list
        const eventIndex = prefs.events.findIndex(e => e.eventName === eventName);
        
        if (eventIndex > -1) {
            // Update existing event channels
            prefs.events[eventIndex].channels = { ...prefs.events[eventIndex].channels, ...channels };
        } else {
            // Add new event preference
            prefs.events.push({ eventName, channels });
        }

        await prefs.save();
        return prefs;
    }

    /**
     * Helper Method for Event Bus to check delivery permission
     * Returns true if allowed, false if user has explicitly blocked it.
     */
    async isChannelAllowed(userId, eventName, channelString) {
        if (!userId) return true; // If no userId provided, default to true

        const prefs = await NotificationPreference.findOne({ userId });
        if (!prefs) return true; // Default to true if no preference document

        const eventPref = prefs.events.find(e => e.eventName === eventName);
        if (!eventPref) return true; // Default to true if event not explicitly configured

        // Return the specific channel's boolean value
        return eventPref.channels[channelString] !== false;
    }
}

module.exports = new NotificationPreferenceService();