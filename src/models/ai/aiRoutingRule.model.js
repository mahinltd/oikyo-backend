/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

const aiRoutingRuleSchema = new mongoose.Schema({
    taskType: { 
        type: String, 
        enum: ['chat_assistant', 'product_seo', 'translation', 'image_understanding', 'data_extraction'], 
        required: true,
        unique: true
    },
    preferredProvider: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'AiProvider', 
        required: true 
    },
    preferredModelCode: { 
        type: String, 
        required: true 
    },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('AiRoutingRule', aiRoutingRuleSchema);