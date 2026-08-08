/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

class AuthController {
    
    register = asyncHandler(async (req, res) => {
        const user = await authService.registerUser(req.body);
        return res.status(201).json(
            new ApiResponse(201, user, "Registration successful. Please check your email to verify your account.")
        );
    });

    login = asyncHandler(async (req, res) => {
        const { identifier, password } = req.body;
        
        // Extract Device & Session Info for Security Audit
        const deviceInfo = {
            deviceId: req.headers['x-device-id'] || 'unknown_device',
            userAgent: req.headers['user-agent'] || 'unknown',
            ipAddress: req.ip || req.connection.remoteAddress,
            // In a real scenario, you can parse user-agent to get browser, OS, etc.
        };

        const { user, accessToken } = await authService.loginUser(identifier, password, deviceInfo);
        
        return res.status(200).json(
            new ApiResponse(200, { user, accessToken }, "Login successful.")
        );
    });

    verifyEmail = asyncHandler(async (req, res) => {
        const { token } = req.body;
        await authService.verifyEmail(token);
        return res.status(200).json(
            new ApiResponse(200, null, "Email verified successfully. You can now login.")
        );
    });

    forgotPassword = asyncHandler(async (req, res) => {
        const { email } = req.body;
        await authService.forgotPassword(email);
        return res.status(200).json(
            new ApiResponse(200, null, "If that email is registered, we have sent a password reset link.")
        );
    });

    resetPassword = asyncHandler(async (req, res) => {
        const { token, newPassword } = req.body;
        await authService.resetPassword(token, newPassword);
        return res.status(200).json(
            new ApiResponse(200, null, "Password has been reset successfully. You can now login.")
        );
    });
}

module.exports = new AuthController();