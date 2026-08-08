/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const FCMToken = require('../../models/communication/fcmToken.model');
const admin = require('../../config/firebase.config');

class FCMTokenService {
    
    /**
     * Register a new FCM token for a user
     * @param {string} userId - User ID
     * @param {string} userRole - User role
     * @param {string} token - FCM token
     * @param {object} deviceInfo - Device information
     */
    async registerToken(userId, userRole, token, deviceInfo = {}) {
        try {
            // First, deactivate any existing tokens for this user-role combination
            await FCMToken.updateMany(
                { userId, userRole, isActive: true },
                { isActive: false }
            );
            
            // Check if this token already exists (might be re-registering)
            let tokenDoc = await FCMToken.findOne({ token });
            
            if (tokenDoc) {
                // Update existing token
                tokenDoc.userId = userId;
                tokenDoc.userRole = userRole;
                tokenDoc.deviceInfo = deviceInfo;
                tokenDoc.isActive = true;
                tokenDoc.lastUsedAt = new Date();
                tokenDoc.updatedAt = new Date();
                
                await tokenDoc.save();
            } else {
                // Create new token record
                tokenDoc = new FCMToken({
                    userId,
                    userRole,
                    token,
                    deviceInfo,
                    isActive: true
                });
                
                await tokenDoc.save();
            }
            
            return tokenDoc;
        } catch (error) {
            console.error('[FCM Token Service Error] Register token:', error.message);
            throw error;
        }
    }
    
    /**
     * Unregister an FCM token (when user unsubscribes)
     * @param {string} token - FCM token to unregister
     */
    async unregisterToken(token) {
        try {
            const result = await FCMToken.updateOne(
                { token },
                { isActive: false }
            );
            
            return result.nModified > 0;
        } catch (error) {
            console.error('[FCM Token Service Error] Unregister token:', error.message);
            throw error;
        }
    }
    
    /**
     * Get active tokens for a user
     * @param {string} userId - User ID
     * @param {string} userRole - User role
     */
    async getUserTokens(userId, userRole) {
        try {
            return await FCMToken.find({
                userId,
                userRole,
                isActive: true
            });
        } catch (error) {
            console.error('[FCM Token Service Error] Get user tokens:', error.message);
            throw error;
        }
    }
    
    /**
     * Get tokens for a specific event recipient (e.g., all admin tokens for admin notifications)
     * @param {string} userRole - Target user role
     */
    async getTokensByRole(userRole) {
        try {
            return await FCMToken.find({
                userRole,
                isActive: true
            }).select('token userId userRole');
        } catch (error) {
            console.error('[FCM Token Service Error] Get tokens by role:', error.message);
            throw error;
        }
    }
    
    /**
     * Validate an FCM token by attempting to send a test message
     * @param {string} token - FCM token to validate
     */
    async validateToken(token) {
        if (!admin || !admin.apps.length) {
            return false;
        }
        
        try {
            // Send a test message to validate the token
            const message = {
                data: {
                    purpose: 'validation',
                    timestamp: Date.now().toString()
                },
                token: token
            };
            
            await admin.messaging().send(message);
            return true;
        } catch (error) {
            // If the token is invalid, expired, or revoked, remove it
            if (error.code === 'messaging/invalid-registration-token' ||
                error.code === 'messaging/registration-token-not-registered' ||
                error.code === 'messaging/mismatched-credential') {
                await this.removeInvalidToken(token);
                return false;
            }
            console.error('[FCM Token Service Error] Validate token:', error.message);
            return false;
        }
    }
    
    /**
     * Remove an invalid FCM token from the database
     * @param {string} token - Invalid FCM token to remove
     */
    async removeInvalidToken(token) {
        try {
            await FCMToken.deleteOne({ token });
            console.log(`[FCM Token Service] Removed invalid token: ${token}`);
        } catch (error) {
            console.error('[FCM Token Service Error] Remove invalid token:', error.message);
        }
    }
    
    /**
     * Clean up invalid tokens in bulk (should be run periodically)
     */
    async cleanupInvalidTokens(tokens) {
        const validTokens = [];
        const invalidTokens = [];
        
        for (const token of tokens) {
            const isValid = await this.validateToken(token.token);
            if (isValid) {
                validTokens.push(token);
            } else {
                invalidTokens.push(token);
            }
        }
        
        return { validTokens, invalidTokens };
    }
}

module.exports = new FCMTokenService();