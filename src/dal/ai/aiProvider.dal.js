/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const AiProvider = require('../../models/ai/aiProvider.model');
const EncryptionUtil = require('../../utils/encryption.util');

class AiProviderDal {
    
    // Encrypt the credentials map before saving to DB
    _encryptCredentials(credentialsData) {
        const encryptedMap = {};
        for (const [key, value] of Object.entries(credentialsData)) {
            encryptedMap[key] = EncryptionUtil.encrypt(value);
        }
        return encryptedMap;
    }

    // Decrypt credentials for Internal AI Engine execution
    _decryptCredentials(provider) {
        if (!provider || !provider.credentials) return provider;
        const decryptedMap = {};
        const entries = provider.credentials instanceof Map
            ? provider.credentials.entries()
            : Object.entries(provider.credentials);
        for (const [key, value] of entries) {
            decryptedMap[key] = EncryptionUtil.decrypt(value);
        }
        provider.credentials = decryptedMap;
        return provider;
    }

    // Mask credentials for Admin Panel security
    _maskProviderCredentials(provider) {
        if (!provider || !provider.credentials) return provider;
        const maskedMap = {};
        const entries = provider.credentials instanceof Map
            ? provider.credentials.entries()
            : Object.entries(provider.credentials);
        for (const [key, value] of entries) {
            const decryptedValue = EncryptionUtil.decrypt(value);
            maskedMap[key] = EncryptionUtil.maskCredential(decryptedValue);
        }
        provider.credentials = maskedMap;
        return provider;
    }

    // --- Admin Operations ---
    
    async createProvider(data) {
        if (data.credentials) {
            data.credentials = this._encryptCredentials(data.credentials);
        }
        const provider = await AiProvider.create(data);
        return this._maskProviderCredentials(provider.toObject());
    }

    async getProvidersForAdmin() {
        const providers = await AiProvider.find().sort({ priority: 1 }).lean();
        return providers.map(p => this._maskProviderCredentials(p));
    }

    async updateProvider(id, data) {
        if (data.credentials) {
            data.credentials = this._encryptCredentials(data.credentials);
        }
        const provider = await AiProvider.findByIdAndUpdate(id, data, { new: true }).lean();
        return this._maskProviderCredentials(provider);
    }

    // --- Internal Gateway/System Operations (DECRYPTED CREDENTIALS) ---
    
    // Fetches the active provider with decrypted keys for actually making the API call
    async getActiveProviderForInference(providerId) {
        const provider = await AiProvider.findOne({ 
            _id: providerId, 
            isEnabled: true, 
            status: { $in: ['active', 'degraded'] } // Allow degraded but not error/maintenance
        }).populate('fallbackChain').lean();
        
        return this._decryptCredentials(provider);
    }

    // Used by Provider Resolver to find the best provider by Priority
    async getHighestPriorityActiveProvider() {
        const provider = await AiProvider.findOne({ 
            isEnabled: true, 
            status: { $in: ['active', 'degraded'] } 
        }).sort({ priority: 1 }).populate('fallbackChain').lean();
        
        return this._decryptCredentials(provider);
    }
}

module.exports = new AiProviderDal();