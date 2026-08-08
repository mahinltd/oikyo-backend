/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const templateDal = require('../dal/notificationTemplate.dal');
const TemplateVersion = require('../models/templateVersion.model');
const ApiError = require('../utils/ApiError');

class NotificationTemplateService {

    async getAdminList() {
        return await templateDal.getAllTemplates();
    }

    async createNewTemplate(data) {
        return await templateDal.createTemplate(data);
    }
    
    // --- Versioning Logic ---
    async _saveVersion(templateData, note = 'Auto-saved before update') {
        await TemplateVersion.create({
            templateId: templateData._id,
            subject: templateData.subject,
            body: templateData.body,
            versionNote: note
        });
    }

    async updateTemplate(id, data) {
        const currentTemplate = await templateDal.getTemplateById(id);
        if (!currentTemplate) throw new ApiError(404, 'Template not found');

        // Save current state to Version History before updating
        await this._saveVersion(currentTemplate);

        return await templateDal.updateTemplate(id, data);
    }

    async deleteTemplate(id) {
        const deletedTemplate = await templateDal.deleteTemplate(id);
        if (!deletedTemplate) throw new ApiError(404, 'Template not found');
        return true;
    }

    // --- Preview & Test Send Capability ---
    
    /**
     * Compiles the template with Dummy/Provided Data to preview how it looks
     */
    async previewTemplate(templateId, testDataValues = {}) {
        const template = await templateDal.getTemplateById(templateId);
        if (!template) throw new ApiError(404, 'Template not found');

        let compiledBody = template.body;
        let compiledSubject = template.subject || '';

        // Replace variables with test data (or fallback to variable name for preview)
        if (template.variables && template.variables.length > 0) {
            template.variables.forEach(variable => {
                const regex = new RegExp(`{{${variable}}}`, 'g');
                const value = testDataValues[variable] || `[${variable}]`;
                compiledBody = compiledBody.replace(regex, value);
                compiledSubject = compiledSubject.replace(regex, value);
            });
        }

        return { subject: compiledSubject, body: compiledBody };
    }

    /**
     * Compiles the template and pushes it to the actual Mail/SMS provider
     */
    async sendTestNotification(templateId, targetAddress, testDataValues = {}) {
        const compiled = await this.previewTemplate(templateId, testDataValues);
        const template = await templateDal.getTemplateById(templateId);

        // Architecture Base: Here you would integrate actual providers
        if (template.type === 'email') {
            // await EmailProvider.send(targetAddress, compiled.subject, compiled.body);
            return { success: true, message: `Test email sent to ${targetAddress}` };
        } else if (template.type === 'sms') {
            // await SmsProvider.send(targetAddress, compiled.body);
            return { success: true, message: `Test SMS sent to ${targetAddress}` };
        }
        
        return { success: false, message: 'Unsupported template type for test send' };
    }
}

module.exports = new NotificationTemplateService();