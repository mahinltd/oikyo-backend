/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const admin = require('../../config/firebase.config');
const { EmailTemplate } = require('../../models/communication/notificationConfig.model');

class FCMPushAdapter {
    
    // Helper to replace {{variables}} for push notification body
    _replaceVariables(templateStr, dataObj) {
        return templateStr.replace(/{{(.*?)}}/g, (match, key) => dataObj[key.trim()] || '');
    }

    async sendPushNotification(eventName, fcmToken, payloadData) {
        // If Firebase is not initialized, abort gracefully
        if (!admin || !admin.apps.length) return false;

        try {
            // Reusing the same template logic for Subject/Body from DB to keep messages consistent
            const templateConfig = await EmailTemplate.findOne({ eventName, isActive: true });
            if (!templateConfig) return false;

            const title = this._replaceVariables(templateConfig.subjectTemplate, payloadData);
            // Push body should be short, maybe we strip HTML or use a specific brief template
            // For enterprise, we usually send the title and a short dynamic string
            const body = this._replaceVariables(templateConfig.bodyTemplate, payloadData);

            const message = {
                notification: {
                    title: title,
                    body: body
                },
                data: {
                    eventName: eventName,
                    actionUrl: payloadData.actionUrl || 'https://oikyo.me/dashboard'
                },
                token: fcmToken
            };

            const response = await admin.messaging().send(message);
            return response ? true : false;
        } catch (error) {
            console.error(`[FCM Push Adapter Error] ${error.message}`);
            return false;
        }
    }
}

module.exports = new FCMPushAdapter();