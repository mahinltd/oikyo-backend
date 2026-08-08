/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const jwt = require('jsonwebtoken');

class JwtUtil {
    generateAccessToken(user) {
        return jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' } // Token valid for 1 day
        );
    }

    generateVerificationToken() {
        // Generates a random secure string for email verification / password reset
        const crypto = require('crypto');
        return crypto.randomBytes(32).toString('hex');
    }
}

module.exports = new JwtUtil();