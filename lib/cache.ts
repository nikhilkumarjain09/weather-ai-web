interface CacheEntry {
  value: any;
  expiry: number;
}

class InMemoryCache {
  private cache = new Map<string, CacheEntry>();

  async get(key: string): Promise<any | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: any, ttlSeconds: number): Promise<void> {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }
}

const globalCacheKey = Symbol.for("aeris.inMemoryCache");
const globalObj = global as any;

if (!globalObj[globalCacheKey]) {
  globalObj[globalCacheKey] = new InMemoryCache();
}

export const getCache = () => {
  return globalObj[globalCacheKey];
};
