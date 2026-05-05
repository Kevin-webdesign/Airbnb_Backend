declare function setCache(key: string, data: unknown, ttlSeconds: number): Promise<void>;
declare function getCache(key: string): Promise<unknown | null>;
declare function clearCache(listingId: string | number): Promise<void>;
declare function clearCacheByKey(key: string): Promise<void>;
export { setCache, getCache, clearCache, clearCacheByKey };
//# sourceMappingURL=cache.d.ts.map