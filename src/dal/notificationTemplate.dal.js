/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const NotificationTemplate = require('../models/notificationTemplate.model');

class NotificationTemplateDal {
    async createTemplate(data) {
        return await NotificationTemplate.create(data);
    }

    async getTemplateByEvent(type, event) {
        return await NotificationTemplate.findOne({ type, event, isActive: true }).lean();
    }

    async getAllTemplates() {
        return await NotificationTemplate.find().sort({ createdAt: -1 });
    }

    async getTemplateById(id) {
        return await NotificationTemplate.findById(id);
    }

    async updateTemplate(id, data) {
        return await NotificationTemplate.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }

    async deleteTemplate(id) {
        return await NotificationTemplate.findByIdAndDelete(id);
    }
}

module.exports = new NotificationTemplateDal();