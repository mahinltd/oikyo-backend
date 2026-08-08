/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

const notificationTemplateSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['email', 'push', 'sms'], required: true },
    
    // Enterprise Template Organization
    templateGroup: { 
        type: String, 
        enum: ['authentication', 'orders', 'products', 'marketing', 'system', 'payment', 'custom'], 
        required: true 
    },
    
    eventKey: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, trim: true, default: null },
    body: { type: String, required: true },
    variables: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

notificationTemplateSchema.index({ type: 1, eventKey: 1 }, { unique: true });
notificationTemplateSchema.index({ templateGroup: 1 });

module.exports = mongoose.model('NotificationTemplate', notificationTemplateSchema);