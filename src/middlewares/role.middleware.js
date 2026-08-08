/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const ApiError = require('../utils/ApiError');

// Using Rest Parameters (...allowedRoles) to make it dynamically accept any number of roles
const restrictToRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // Security Check: Ensure isAuthenticated middleware ran before this
        if (!req.user || !req.user.role) {
            return next(new ApiError(401, 'User role is not defined. Authentication required.'));
        }

        // Validate Role
        if (!allowedRoles.includes(req.user.role)) {
            return next(new ApiError(403, 'Access denied. You do not have permission to perform this action.'));
        }

        next();
    };
};

module.exports = { restrictToRoles };