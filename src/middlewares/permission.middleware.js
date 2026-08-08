/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const ApiError = require('../utils/ApiError');

const requirePermission = (requiredPermission) => {
    return (req, res, next) => {
        // Security Check: Ensure isAuthenticated middleware ran before this
        if (!req.user) {
            return next(new ApiError(401, 'Authentication required for permission verification.'));
        }

        // Future Architecture: 
        // req.user.permissions will be populated in auth.middleware.js dynamically 
        // from the Database based on User's assigned Role or Custom Permissions.
        const userPermissions = req.user.permissions || [];

        // Super Admin Bypass Architecture (Optional based on business rule)
        if (req.user.role === 'super_admin') {
            return next(); 
        }

        // Validate Specific Permission
        if (!userPermissions.includes(requiredPermission)) {
            return next(new ApiError(403, `Action forbidden. Required permission: '${requiredPermission}' is missing.`));
        }

        next();
    };
};

module.exports = { requirePermission };