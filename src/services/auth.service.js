/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const userDal = require('../dal/user.dal');
const tokenDal = require('../dal/token.dal');
const sessionDal = require('../dal/session.dal');
const hashUtil = require('../utils/hash.util');
const jwtUtil = require('../utils/jwt.util');
const emailUtil = require('../utils/email.util');
const ApiError = require('../utils/ApiError');

class AuthService {
    
    // ==========================================
    // 1. Register User
    // ==========================================
    async registerUser(data) {
        const existingUser = await userDal.findByEmailOrMobile(data.email);
        if (existingUser) {
            throw new ApiError(400, 'User with this email or mobile already exists');
        }
        
        const existingMobile = await userDal.findByEmailOrMobile(data.mobile);
        if (existingMobile) {
            throw new ApiError(400, 'Mobile number already registered');
        }

        const hashedPassword = await hashUtil.hashPassword(data.password);

        const newUser = await userDal.createUser({
            fullName: data.fullName,
            mobile: data.mobile,
            email: data.email,
            password: hashedPassword
        });

        const tokenString = jwtUtil.generateVerificationToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 Hours

        await tokenDal.createToken({
            userId: newUser._id,
            token: tokenString,
            type: 'email_verification',
            expiresAt: expiresAt
        });

        await emailUtil.sendVerificationEmail(newUser.email, tokenString);

        const userResponse = newUser.toObject();
        delete userResponse.password;

        return userResponse;
    }

    // ==========================================
    // 2. Login User
    // ==========================================
    async loginUser(identifier, password, deviceInfo) {
        const user = await userDal.findByEmailOrMobile(identifier);
        if (!user) {
            throw new ApiError(401, 'Invalid credentials');
        }

        if (user.status !== 'active') {
            throw new ApiError(403, `Account is ${user.status}. Please contact support.`);
        }

        if (!user.emailVerified) {
            throw new ApiError(403, 'Please verify your email before logging in');
        }

        const isPasswordValid = await hashUtil.comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw new ApiError(401, 'Invalid credentials');
        }

        const loginMethod = identifier.includes('@') ? 'email' : 'mobile';

        await sessionDal.createSession({
            userId: user._id,
            loginMethod: loginMethod,
            ...deviceInfo
        });

        await userDal.updateUser(user._id, { lastLogin: new Date() });

        const accessToken = jwtUtil.generateAccessToken(user);

        const userResponse = user.toObject();
        delete userResponse.password;

        return { user: userResponse, accessToken };
    }

    // ==========================================
    // 3. Verify Email
    // ==========================================
    async verifyEmail(token) {
        // Find valid, unused, unexpired token
        const validToken = await tokenDal.findValidToken(token, 'email_verification');
        
        if (!validToken) {
            throw new ApiError(400, 'Invalid or expired verification token');
        }

        // Update user's emailVerified status
        await userDal.updateUser(validToken.userId, { emailVerified: true });

        // Mark token as used to prevent reuse
        await tokenDal.markTokenAsUsed(validToken._id);

        return true;
    }

    // ==========================================
    // 4. Forgot Password
    // ==========================================
    async forgotPassword(email) {
        const user = await userDal.findByEmailOrMobile(email);
        
        if (!user) {
            // For security, we can just return true to prevent email enumeration,
            // but throwing 404 is also fine based on business needs.
            throw new ApiError(404, 'User not found with this email address');
        }

        // Generate new reset token
        const tokenString = jwtUtil.generateVerificationToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 Hours

        await tokenDal.createToken({
            userId: user._id,
            token: tokenString,
            type: 'password_reset',
            expiresAt: expiresAt
        });

        // Send Password Reset Email
        await emailUtil.sendPasswordResetEmail(user.email, tokenString);

        return true;
    }

    // ==========================================
    // 5. Reset Password
    // ==========================================
    async resetPassword(token, newPassword) {
        // Check if token is valid
        const validToken = await tokenDal.findValidToken(token, 'password_reset');
        
        if (!validToken) {
            throw new ApiError(400, 'Invalid or expired reset token');
        }

        // Hash new password
        const hashedPassword = await hashUtil.hashPassword(newPassword);

        // Update password and track when it was changed
        await userDal.updateUser(validToken.userId, { 
            password: hashedPassword,
            passwordChangedAt: new Date()
        });

        // Mark token as used
        await tokenDal.markTokenAsUsed(validToken._id);

        return true;
    }
}

module.exports = new AuthService();