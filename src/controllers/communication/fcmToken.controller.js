/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const fcmTokenService = require('../../services/communication/fcmToken.service');
const ApiError = require('../../utils/ApiError');

class FCMTokenController {
    
    /**
     * Register an FCM token for the authenticated user
     * POST /notifications/fcm-token/register
     */
    async registerToken(req, res, next) {
        try {
            const { token, deviceInfo } = req.body;
            const userId = req.user.id;
            const userRole = req.user.role;
            
            if (!token) {
                throw new ApiError(400, 'FCM token is required');
            }
            
            const tokenDoc = await fcmTokenService.registerToken(
                userId,
                userRole,
                token,
                deviceInfo || {}
            );
            
            res.status(200).json({
                success: true,
                message: 'FCM token registered successfully',
                data: {
                    token: tokenDoc.token,
                    isActive: tokenDoc.isActive
                }
            });
        } catch (error) {
            next(error);
        }
    }
    
    /**
     * Unregister an FCM token for the authenticated user
     * DELETE /notifications/fcm-token/unregister
     */
    async unregisterToken(req, res, next) {
        try {
            const { token } = req.body;
            
            if (!token) {
                throw new ApiError(400, 'FCM token is required');
            }
            
            const success = await fcmTokenService.unregisterToken(token);
            
            if (!success) {
                throw new ApiError(404, 'FCM token not found');
            }
            
            res.status(200).json({
                success: true,
                message: 'FCM token unregistered successfully'
            });
        } catch (error) {
            next(error);
        }
    }
    
    /**
     * Get active FCM tokens for the authenticated user
     * GET /notifications/fcm-tokens
     */
    async getUserTokens(req, res, next) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            
            const tokens = await fcmTokenService.getUserTokens(userId, userRole);
            
            res.status(200).json({
                success: true,
                message: 'User tokens retrieved successfully',
                data: tokens
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new FCMTokenController();