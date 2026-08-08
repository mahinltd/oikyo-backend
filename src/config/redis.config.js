/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const { Redis } = require('@upstash/redis');

// Initialize Upstash Redis REST Client
// Required ENV Variables: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
let redisClient = null;

try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        redisClient = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
        console.log('✅ Upstash Redis Client Initialized Successfully');
    } else {
        console.warn('⚠️ Upstash Redis credentials missing. Falling back to in-memory/DB operations.');
    }
} catch (error) {
    console.error('Failed to initialize Upstash Redis:', error.message);
}

module.exports = redisClient;