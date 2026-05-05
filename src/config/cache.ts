import { createClient } from 'redis';

const redis = createClient({ url: 'redis://localhost' });
await redis.connect();

async function setCache(key: string, data: unknown, ttlSeconds: number) {
  if (!redis) throw new Error('Redis client not initialized');
  await redis.setEx(key, ttlSeconds, JSON.stringify(data));
}

async function getCache(key: string): Promise<unknown | null> {
  const data = await redis.get(key);
  if (!data) return null;
  return JSON.parse(data);
}

// Clear cache entries for a specific listing
async function clearCache(listingId: string | number) {
  const prefix = `${listingId}:*`;
  const keys = await redis.keys(prefix);
  if (keys.length > 0) {
    await redis.del(keys);
  }
}

// Clear specific cache key
async function clearCacheByKey(key: string) {
  await redis.del(key);
}

export { setCache, getCache, clearCache, clearCacheByKey };


