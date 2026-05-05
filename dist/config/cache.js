import { createClient } from 'redis';
const redis = createClient({ url: 'redis://localhost' });
await redis.connect();
async function setCache(key, data, ttlSeconds) {
    if (!redis)
        throw new Error('Redis client not initialized');
    await redis.setEx(key, ttlSeconds, JSON.stringify(data));
}
async function getCache(key) {
    const data = await redis.get(key);
    if (!data)
        return null;
    return JSON.parse(data);
}
// Clear cache entries for a specific listing
async function clearCache(listingId) {
    const prefix = `${listingId}:*`;
    const keys = await redis.keys(prefix);
    if (keys.length > 0) {
        await redis.del(keys);
    }
}
// Clear specific cache key
async function clearCacheByKey(key) {
    await redis.del(key);
}
export { setCache, getCache, clearCache, clearCacheByKey };
//# sourceMappingURL=cache.js.map