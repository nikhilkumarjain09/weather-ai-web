interface CacheStore {
  get(key: string): Promise<any | null>;
  set(key: string, val: any, ttlSeconds: number): Promise<void>;
}

class InMemoryCache implements CacheStore {
  private cache = new Map<string, { val: any; expiry: number }>();

  async get(key: string): Promise<any | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    return entry.val;
  }

  async set(key: string, val: any, ttlSeconds: number): Promise<void> {
    this.cache.set(key, {
      val,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }
}

class RedisCache implements CacheStore {
  constructor(private url: string, private token: string) {}

  async get(key: string): Promise<any | null> {
    try {
      const cleanUrl = this.url.endsWith("/") ? this.url.slice(0, -1) : this.url;
      const res = await fetch(`${cleanUrl}/get/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${this.token}` },
        cache: "no-store",
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data || data.result === null || data.result === undefined) return null;
      return JSON.parse(data.result);
    } catch (e) {
      console.error("Redis get cache error:", e);
      return null;
    }
  }

  async set(key: string, val: any, ttlSeconds: number): Promise<void> {
    try {
      const cleanUrl = this.url.endsWith("/") ? this.url.slice(0, -1) : this.url;
      const res = await fetch(`${cleanUrl}/set/${encodeURIComponent(key)}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(val),
        cache: "no-store",
      });
      if (!res.ok) {
        console.error("Redis set status failed:", res.statusText);
        return;
      }
      // EXPIRE command
      await fetch(`${cleanUrl}/expire/${encodeURIComponent(key)}/${ttlSeconds}`, {
        headers: { Authorization: `Bearer ${this.token}` },
        cache: "no-store",
      });
    } catch (e) {
      console.error("Redis set cache error:", e);
    }
  }
}

// Global cached in-memory store to survive dev hot-reloads
const globalCacheKey = Symbol.for("aeris.inMemoryCache");
const globalObj = global as any;

export const getCache = (): CacheStore => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    return new RedisCache(url, token);
  }
  
  if (!globalObj[globalCacheKey]) {
    globalObj[globalCacheKey] = new InMemoryCache();
  }
  return globalObj[globalCacheKey];
};
