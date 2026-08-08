/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const Session = require('../models/session.model');

class SessionDal {
    async createSession(sessionData) {
        return await Session.create(sessionData);
    }

    async updateActivity(sessionId) {
        return await Session.findByIdAndUpdate(sessionId, { lastActivityAt: Date.now() });
    }

    async deactivateSession(sessionId) {
        return await Session.findByIdAndUpdate(sessionId, { isCurrentSession: false });
    }
}

module.exports = new SessionDal();