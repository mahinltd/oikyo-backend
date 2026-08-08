/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const aiProviderDal = require('../../dal/ai/aiProvider.dal');
const redisClient = require('../../config/redis.config');
const EncryptionUtil = require('../../utils/encryption.util');
const AiProvider = require('../../models/ai/aiProvider.model');

const CACHE_KEYS = {
    ACTIVE_PROVIDERS: 'ai:providers:active',
    PROVIDER_BY_ID: (id) => `ai:provider:${id}`
};
const CACHE_TTL = 3600; // Cache for 1 hour

class AiProviderRegistry {
    
    /**
     * Internal utility to decrypt credentials after fetching from DB or Redis Cache
     */
    _decryptProviderCredentials(provider) {
        if (!provider || !provider.credentials) return provider;
        const decryptedMap = {};
        // Handle both Map (Mongoose) and plain Object (Redis JSON)
        const entries = provider.credentials instanceof Map 
            ? provider.credentials.entries() 
            : Object.entries(provider.credentials);
            
        for (const [key, value] of entries) {
            decryptedMap[key] = EncryptionUtil.decrypt(value);
        }
        provider.credentials = decryptedMap;
        return provider;
    }

    /**
     * Gets the prioritized list of active providers. Highly cached using Upstash Redis.
     */
    async getActiveProvidersChain() {
        let providers = null;

        // 1. Try fetching from Upstash Redis
        if (redisClient) {
            providers = await redisClient.get(CACHE_KEYS.ACTIVE_PROVIDERS);
        }

        // 2. If Cache Miss, fetch from DB and store in Upstash
        if (!providers) {
            // Fetch raw encrypted data from DB
            providers = await AiProvider.find({ 
                isEnabled: true, 
                status: { $in: ['active', 'degraded'] } 
            }).sort({ priority: 1 }).populate('fallbackChain').lean();

            if (redisClient && providers.length > 0) {
                await redisClient.set(CACHE_KEYS.ACTIVE_PROVIDERS, JSON.stringify(providers), { ex: CACHE_TTL });
            }
        } else if (typeof providers === 'string') {
            providers = JSON.parse(providers);
        }

        // 3. Decrypt credentials in memory right before returning to the Gateway
        return providers.map(p => this._decryptProviderCredentials(p));
    }

    /**
     * Call this from Admin Controller whenever a Provider is created, updated, or deleted
     */
    async invalidateCache() {
        if (redisClient) {
            await redisClient.del(CACHE_KEYS.ACTIVE_PROVIDERS);
            // In a larger system, you might use SCAN to delete individual provider keys too
            console.log('🔄 AI Provider Cache Invalidated');
        }
    }
}

module.exports = new AiProviderRegistry();