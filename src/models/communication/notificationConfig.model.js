/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

// 1. Template Schema
const emailTemplateSchema = new mongoose.Schema({
    eventName: { type: String, required: true, unique: true }, // e.g., 'order_confirmation', 'security_alert'
    subjectTemplate: { type: String, required: true }, // e.g., 'Order #{{orderNumber}} Confirmed!'
    bodyTemplate: { type: String, required: true }, // Stored HTML with {{variables}}
    isActive: { type: Boolean, default: true }
});

// 2. Routing Schema (No Hardcoded Emails in Codebase)
const eventRoutingSchema = new mongoose.Schema({
    eventName: { type: String, required: true, unique: true },
    senderIdentity: { 
        name: { type: String, default: 'OIKYO' }, // e.g., 'OIKYO Orders'
        email: { type: String, required: true } // e.g., 'orders@oikyo.me'
    },
    replyTo: { type: String, default: 'support@oikyo.me' },
    internalRecipient: { type: String, default: null } // e.g., 'payments_team@oikyo.me'
});

const EmailTemplate = mongoose.model('EmailTemplate', emailTemplateSchema);
const EventRouting = mongoose.model('EventRouting', eventRoutingSchema);

module.exports = { EmailTemplate, EventRouting };