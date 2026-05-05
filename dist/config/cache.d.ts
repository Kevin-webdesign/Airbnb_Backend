declare function setCache(key: string, data: unknown, ttlSeconds: number): void;
declare function getCache(key: string): unknown | null;
declare function clearCache(listingId: string | number): void;
declare function clearCacheByKey(key: string): void;
export { setCache, getCache, clearCache, clearCacheByKey };
//# sourceMappingURL=cache.d.ts.map