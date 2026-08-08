/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const admin = require('../../config/firebase.config');
const { EmailTemplate } = require('../../models/communication/notificationConfig.model');
const fcmTokenService = require('./fcmToken.service');

class FCMPushAdapter {
    
    // Helper to replace {{variables}} for push notification body
    _replaceVariables(templateStr, dataObj) {
        return templateStr.replace(/{{(.*?)}}/g, (match, key) => dataObj[key.trim()] || '');
    }

    async sendPushNotification(eventName, fcmToken, payloadData) {
        // If Firebase is not initialized, abort gracefully
        if (!admin || !admin.apps.length) return false;

        try {
            // Validate the token before attempting to send
            const isValidToken = await fcmTokenService.validateToken(fcmToken);
            if (!isValidToken) {
                console.log(`[FCM Push Adapter] Token invalidated: ${fcmToken}`);
                return false;
            }

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
                    body: body.substring(0, 200) // Limit body length for push notifications
                },
                data: {
                    eventName: eventName,
                    actionUrl: payloadData.actionUrl || 'https://oikyo.me/dashboard',
                    timestamp: new Date().toISOString(),
                    ...payloadData // Include other payload data as needed
                },
                token: fcmToken
            };

            const response = await admin.messaging().send(message);
            console.log(`[FCM Push Adapter] Notification sent successfully: ${response}`);
            return response ? true : false;
        } catch (error) {
            console.error(`[FCM Push Adapter Error] ${error.message}`);
            
            // Handle specific FCM errors that indicate invalid tokens
            if (error.code === 'messaging/invalid-registration-token' ||
                error.code === 'messaging/registration-token-not-registered' ||
                error.code === 'messaging/mismatched-credential') {
                await fcmTokenService.removeInvalidToken(fcmToken);
                console.log(`[FCM Push Adapter] Removed invalid token: ${fcmToken}`);
            }
            
            return false;
        }
    }
    
    /**
     * Send push notification to multiple tokens (for broadcast notifications)
     */
    async sendPushNotificationToMultiple(tokens, eventName, payloadData) {
        if (!admin || !admin.apps.length) return [];

        if (!Array.isArray(tokens) || tokens.length === 0) {
            return [];
        }

        try {
            // Filter out invalid tokens first
            const validTokens = [];
            for (const token of tokens) {
                const isValid = await fcmTokenService.validateToken(token);
                if (isValid) {
                    validTokens.push(token);
                }
            }

            if (validTokens.length === 0) {
                return [];
            }

            // Reusing the same template logic for Subject/Body from DB to keep messages consistent
            const templateConfig = await EmailTemplate.findOne({ eventName, isActive: true });
            if (!templateConfig) return [];

            const title = this._replaceVariables(templateConfig.subjectTemplate, payloadData);
            const body = this._replaceVariables(templateConfig.bodyTemplate, payloadData).substring(0, 200);

            const messages = validTokens.map(token => ({
                notification: {
                    title: title,
                    body: body
                },
                data: {
                    eventName: eventName,
                    actionUrl: payloadData.actionUrl || 'https://oikyo.me/dashboard',
                    timestamp: new Date().toISOString(),
                    ...payloadData
                },
                token: token
            }));

            // Send notifications in batches (FCM limits batch size)
            const batchSize = 500; // FCM allows up to 500 tokens per batch
            const results = [];

            for (let i = 0; i < messages.length; i += batchSize) {
                const batch = messages.slice(i, i + batchSize);
                const batchResponse = await admin.messaging().sendAll(batch);
                
                // Process the batch response to handle individual failures
                batchResponse.responses.forEach((response, idx) => {
                    if (!response.success) {
                        const failedToken = validTokens[i + idx];
                        console.error(`[FCM Push Adapter] Failed to send to token: ${failedToken}`, response.error);
                        
                        // Remove invalid tokens
                        if (response.error.code === 'messaging/invalid-registration-token' ||
                            response.error.code === 'messaging/registration-token-not-registered' ||
                            response.error.code === 'messaging/mismatched-credential') {
                            fcmTokenService.removeInvalidToken(failedToken);
                        }
                    }
                });
                
                results.push(...batchResponse.responses);
            }

            return results;
        } catch (error) {
            console.error(`[FCM Push Adapter Bulk Error] ${error.message}`);
            return [];
        }
    }
}

module.exports = new FCMPushAdapter();