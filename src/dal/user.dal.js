/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const User = require('../models/user.model');

class UserDal {
    async createUser(userData) {
        return await User.create(userData);
    }

    async findByEmailOrMobile(identifier) {
        // Will return user with password field included
        return await User.findOne({
            $or: [{ email: identifier.toLowerCase() }, { mobile: identifier }]
        }).select('+password');
    }

    async findById(userId) {
        return await User.findById(userId);
    }

    async updateUser(userId, updateData) {
        return await User.findByIdAndUpdate(userId, updateData, { new: true });
    }
}

module.exports = new UserDal();