const cache = new Map();
function setCache(key, data, ttlSeconds) {
    cache.set(key, { data, expiresAt: Date.now() + ttlSeconds * 1000 });
}
function getCache(key) {
    const entry = cache.get(key);
    if (!entry)
        return null;
    if (Date.now() > entry.expiresAt) {
        cache.delete(key);
        return null;
    }
    return entry.data;
}
// Clear cache entries for a specific listing
function clearCache(listingId) {
    const prefix = `${listingId}:`;
    for (const key of cache.keys()) {
        if (key.startsWith(prefix)) {
            cache.delete(key);
        }
    }
}
// Clear specific cache key
function clearCacheByKey(key) {
    cache.delete(key);
}
export { setCache, getCache, clearCache, clearCacheByKey };
//# sourceMappingURL=cache.js.map