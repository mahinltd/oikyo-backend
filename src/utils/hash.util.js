/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const bcrypt = require('bcryptjs');

class HashUtil {
    async hashPassword(password) {
        const salt = await bcrypt.genSalt(12);
        return await bcrypt.hash(password, salt);
    }

    async comparePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
}

module.exports = new HashUtil();