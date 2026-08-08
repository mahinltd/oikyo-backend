/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Session = require('../models/session.model');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const isAuthenticated = asyncHandler(async (req, res, next) => {
    // 1. Extract Token (Bearer <token>)
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new ApiError(401, 'Authentication failed. Please log in to get access.'));
    }

    // 2. JWT Verification (Securely handling errors without exposing stack/secrets)
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return next(new ApiError(401, 'Your session has expired. Please log in again.'));
        }
        return next(new ApiError(401, 'Invalid authentication token. Please log in again.'));
    }

    // 3. User Lookup (Optimized Query - Fetching only required fields)
    const currentUser = await User.findById(decoded.id)
        .select('_id role status emailVerified passwordChangedAt')
        .lean(); // Using lean() for better performance as we don't need mongoose document methods here

    if (!currentUser) {
        return next(new ApiError(401, 'The user belonging to this token no longer exists.'));
    }

    // 4. User Status & Email Verification Validation
    if (currentUser.status !== 'active') {
        return next(new ApiError(403, `Account access denied. Your account is currently ${currentUser.status}.`));
    }
    if (!currentUser.emailVerified) {
        return next(new ApiError(403, 'Email not verified. Please verify your email to continue.'));
    }

    // 5. Password Change Tracking
    if (currentUser.passwordChangedAt) {
        const changedTimestamp = parseInt(currentUser.passwordChangedAt.getTime() / 1000, 10);
        if (decoded.iat < changedTimestamp) {
            return next(new ApiError(401, 'Password was recently changed. Please log in again with your new password.'));
        }
    }

    // 6. Active Session Tracking & Device Comparison Architecture
    const deviceId = req.headers['x-device-id'];
    if (deviceId) {
        // Update lastActivityAt without fetching the whole document
        const currentSession = await Session.findOneAndUpdate(
            { userId: currentUser._id, deviceId: deviceId, isCurrentSession: true },
            { lastActivityAt: Date.now() },
            { new: true, select: '_id deviceId userAgent ipAddress' }
        );

        if (currentSession) {
            // Future Architecture: Compare current req.ip and req.headers['user-agent'] 
            // with currentSession data to detect Session Hijacking.
            req.sessionId = currentSession._id;
        }
    }

    // 7. Attach Minimal User Payload to Request Object
    req.user = {
        id: currentUser._id,
        role: currentUser.role,
        status: currentUser.status
    };

    next();
});

const requireAuth = isAuthenticated;

const requireAdmin = asyncHandler(async (req, res, next) => {
    if (!req.user || !req.user.role) {
        return next(new ApiError(401, 'Authentication required.'));
    }

    if (!['super_admin', 'admin'].includes(req.user.role)) {
        return next(new ApiError(403, 'Admin access required.'));
    }

    next();
});

module.exports = { isAuthenticated, requireAuth, requireAdmin };