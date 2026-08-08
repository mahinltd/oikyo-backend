/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const emailEngineService = require('./emailEngine.service');
const fcmPushAdapter = require('./fcmPushAdapter.service'); // Activated FCM Push Adapter
const InAppNotification = require('../../models/communication/inAppNotification.model'); // Updated path
const NotificationAudit = require('../../models/communication/notificationAudit.model');
const { EventRouting } = require('../../models/communication/notificationConfig.model');
const preferenceService = require('./notificationPreference.service');

class NotificationEventBus {
    /**
     * Fire and Forget Event Publisher (Handles Email, Push, In-App & Routing)
     * @param {String} eventName - e.g., 'order_confirmation', 'security_alert'
     * @param {Object} recipientData - { email: 'user@oikyo.me', fcmToken: '...', userId: '...', userRole: 'customer' }
     * @param {Object} payload - Dynamic data for templates (e.g., { orderNumber: '123', notificationTitle: '...' })
     */
    async publish(eventName, recipientData, payload) {
        // Run asynchronously in the background so it doesn't block the main API response
        setImmediate(async () => {
            try {
                // 1. Fetch Routing Config to validate event
                const routingConfig = await EventRouting.findOne({ eventName });
                if (!routingConfig) {
                    console.warn(`[Event Bus] Warning: No routing configured for event '${eventName}'`);
                    return;
                }

                // 2. Dispatch to Email Channel
                if (recipientData.email) {
                    const isEmailAllowed = recipientData.userId
                        ? await preferenceService.isChannelAllowed(recipientData.userId, eventName, 'email')
                        : true;

                    const auditRecord = await NotificationAudit.create({
                        eventName,
                        recipient: recipientData.email,
                        channel: 'email',
                        status: isEmailAllowed ? 'queued' : 'skipped',
                        payloadSnippet: this._sanitizePayload(payload)
                    });

                    if (!isEmailAllowed) {
                        auditRecord.errorDetails = 'Email channel disabled by user preferences';
                        await auditRecord.save();
                    } else {
                        // Call the Email Engine (Resend API)
                        const emailResult = await emailEngineService.dispatchEmail(eventName, recipientData.email, payload);

                        // Update Audit Trail
                        auditRecord.status = emailResult ? 'sent' : 'failed';
                        if (!emailResult) auditRecord.errorDetails = 'Email Adapter Dispatch Failed';
                        await auditRecord.save();
                    }
                }

                // 3. Dispatch to FCM Push Channel
                if (recipientData.fcmToken) {
                    const isPushAllowed = recipientData.userId
                        ? await preferenceService.isChannelAllowed(recipientData.userId, eventName, 'push')
                        : true;

                    if (!isPushAllowed) {
                        await NotificationAudit.create({
                            eventName,
                            recipient: recipientData.fcmToken,
                            channel: 'push',
                            status: 'skipped',
                            errorDetails: 'Push channel disabled by user preferences',
                            payloadSnippet: this._sanitizePayload(payload)
                        });
                    } else {
                        const pushResult = await fcmPushAdapter.sendPushNotification(eventName, recipientData.fcmToken, payload);

                        // Save Push Audit Trail
                        await NotificationAudit.create({
                            eventName,
                            recipient: recipientData.fcmToken,
                            channel: 'push',
                            status: pushResult ? 'sent' : 'failed',
                            payloadSnippet: this._sanitizePayload(payload)
                        });
                    }
                }

                // 4. Save to In-App Notification Center
                if (recipientData.userId && recipientData.userRole) {
                    await InAppNotification.create({
                        userId: recipientData.userId,
                        userRole: recipientData.userRole,
                        title: payload.notificationTitle || `Update: ${eventName}`,
                        message: payload.notificationMessage || 'You have a new update.',
                        eventName: eventName,
                        actionUrl: payload.actionUrl || null
                    });
                }

                // 5. Internal Department Routing (Admin notifications)
                if (routingConfig.internalRecipient) {
                    await emailEngineService.dispatchEmail(eventName, routingConfig.internalRecipient, payload);
                }

            } catch (error) {
                console.error(`[Event Bus Critical Failure] ${error.message}`);
            }
        });
    }

    // Helper: Remove highly sensitive data from audit logs before saving to DB
    _sanitizePayload(payload) {
        const sanitized = { ...payload };
        delete sanitized.password;
        delete sanitized.token; // Do not save reset/verification tokens in plain text logs
        return sanitized;
    }
}

module.exports = new NotificationEventBus();