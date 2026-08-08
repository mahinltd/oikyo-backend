/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const Token = require('../models/token.model');

class TokenDal {
    async createToken(tokenData) {
        return await Token.create(tokenData);
    }

    async findValidToken(token, type) {
        return await Token.findOne({
            token,
            type,
            used: false,
            expiresAt: { $gt: Date.now() }
        });
    }

    async markTokenAsUsed(tokenId) {
        return await Token.findByIdAndUpdate(tokenId, { used: true }, { new: true });
    }
}

module.exports = new TokenDal();