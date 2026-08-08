/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

const aiPromptTemplateSchema = new mongoose.Schema({
    taskType: { 
        type: String, 
        required: true, 
        unique: true,
        enum: [
            'editor_seo_generate', 
            'editor_desc_rewrite', 
            'editor_title_optimize', 
            'editor_translate_bn',
            'editor_keyword_extract'
        ] 
    },
    templateName: { type: String, required: true },
    systemPrompt: { type: String, required: true },
    // Uses variables like {{title}}, {{description}}, {{category}}
    userPromptTemplate: { type: String, required: true }, 
    expectedOutputFormat: { 
        type: String, 
        enum: ['text', 'json', 'html'], 
        default: 'json' 
    },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('AiPromptTemplate', aiPromptTemplateSchema);