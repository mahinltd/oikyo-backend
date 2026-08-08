/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const ApiError = require('../utils/ApiError');

const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        const { error } = schema.validate(req[source], { abortEarly: false });
        
        if (error) {
            // Extract all error messages and join them
            const errorMessage = error.details.map((details) => details.message).join(', ');
            return next(new ApiError(400, errorMessage, error.details));
        }
        
        next();
    };
};

module.exports = validate;