/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const redisClient = require('../config/redis.config'); // Updated to match your file name

/**
 * Dynamic Cache Middleware for Upstash Redis
 * @param {Number} duration - Cache expiration time in seconds (e.g., 300 for 5 minutes)
 */
const cacheData = (duration = 300) => {
    return async (req, res, next) => {
        // Skip caching for non-GET requests or if Redis client failed to initialize
        if (req.method !== 'GET' || !redisClient) {
            return next();
        }

        const key = `oikyo_cache:${req.originalUrl || req.url}`;

        try {
            // Upstash returns the parsed JSON automatically if stored properly
            const cachedResponse = await redisClient.get(key);

            if (cachedResponse) {
                // Return cached data immediately
                return res.status(200).json(
                    typeof cachedResponse === 'string' ? JSON.parse(cachedResponse) : cachedResponse
                );
            } else {
                // Intercept the res.json method to save the response in Redis before sending
                const originalSend = res.json;
                res.json = function(body) {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        // Upstash syntax for setting expiration: { ex: seconds }
                        redisClient.set(key, JSON.stringify(body), { ex: duration })
                            .catch(err => console.error('Upstash Redis Set Error:', err));
                    }
                    originalSend.call(this, body);
                };
                next();
            }
        } catch (error) {
            console.error('Cache Middleware Error:', error);
            next(); // Proceed to controller if cache fails
        }
    };
};

/**
 * Utility to clear specific cache patterns (Useful when a product is published/updated)
 */
const clearCache = async (pattern = 'oikyo_cache:*') => {
    if (!redisClient) return;
    try {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(...keys); // Upstash accepts multiple keys like this
        }
    } catch (error) {
        console.error('Failed to clear cache:', error);
    }
};

module.exports = { cacheData, clearCache };