/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const mongoose = require('mongoose');

const aiProviderSchema = new mongoose.Schema({
    // 1. Identity & Versioning
    providerName: { type: String, required: true, trim: true },
    providerCode: { type: String, required: true, unique: true, lowercase: true },
    apiVersion: { type: String, default: 'v1' },
    baseUrl: { type: String, default: '' },
    
    // 2. Encrypted Credentials
    credentials: { type: Map, of: String, default: {} },

    // 3. Provider-Level Capability Detection
    capabilities: {
        supportsStreaming: { type: Boolean, default: false },
        supportsVision: { type: Boolean, default: false },
        supportsFunctionCalling: { type: Boolean, default: false },
        supportsJsonMode: { type: Boolean, default: false },
        supportsEmbedding: { type: Boolean, default: false }
    },

    // 4. Model Capability Mapping
    models: [{
        modelCode: { type: String, required: true },
        displayName: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        contextWindowTokens: { type: Number, required: true },
        maxOutputTokens: { type: Number, required: true },
        supportedInputTypes: [{ type: String, enum: ['text', 'image', 'audio', 'video', 'document'] }],
        costPer1kPromptTokens: { type: Number, default: 0 },
        costPer1kCompletionTokens: { type: Number, default: 0 }
    }],

    // 5. Prompt Logging Policy
    loggingPolicy: {
        level: { type: String, enum: ['full', 'masked', 'none'], default: 'masked' },
        maskPatterns: [{ type: String }] 
    },

    // 6. Dynamic Rate Limiting & Failover
    rateLimitConfig: { requestsPerMinute: { type: Number, default: 60 }, tokensPerMinute: { type: Number, default: 100000 } },
    fallbackChain: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AiProvider' }],

    // 7. Health & Lifecycle
    status: { 
        type: String, 
        enum: ['active', 'inactive', 'maintenance', 'error', 'quota_exceeded'], 
        default: 'inactive' 
    },
    
    // 8. Inference Config
    inferenceConfig: {
        temperature: { type: Number, default: 0.7 },
        maxTokens: { type: Number, default: 2048 },
        systemPrompt: { type: String, default: 'You are OIKYO Platform Assistant.' }
    },
    
    isEnabled: { type: Boolean, default: false },
    priority: { type: Number, default: 1 }

}, { timestamps: true });

module.exports = mongoose.model('AiProvider', aiProviderSchema);