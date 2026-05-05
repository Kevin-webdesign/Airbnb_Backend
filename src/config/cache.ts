const cache = new Map<string, { data: unknown; expiresAt: number }>();

function setCache(key: string, data: unknown, ttlSeconds: number) {
  cache.set(key, { data, expiresAt: Date.now() + ttlSeconds * 1000 });
}

function getCache(key: string): unknown | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

// Clear cache entries for a specific listing
function clearCache(listingId: string | number) {
  const prefix = `${listingId}:`;
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

// Clear specific cache key
function clearCacheByKey(key: string) {
  cache.delete(key);
}

export { setCache, getCache, clearCache, clearCacheByKey };


