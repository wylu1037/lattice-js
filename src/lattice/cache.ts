import KeyvRedis from "@keyv/redis";
import { Cacheable } from "cacheable";

type CacheBackend = "memory" | "redis";

type CacheConfig = {
  backend: CacheBackend;
  redisUrl?: string;
  defaultTtl?: number | string; // 1s, 1h
};

class CacheService {
  private cache: Cacheable;

  constructor(config: CacheConfig) {
    const { backend, defaultTtl, redisUrl } = config;

    switch (backend) {
      case "memory":
        this.cache = new Cacheable({ ttl: defaultTtl });
        break;
      case "redis": {
        const primary = new KeyvRedis(redisUrl || "redis://localhost:6379");
        this.cache = new Cacheable({ primary, ttl: defaultTtl });
        break;
      }
      default:
        throw new Error(`Unsupported cache backend: ${backend}`);
    }
  }

  async set<V>(key: string, value: V, ttl?: number | string): Promise<void> {
    if (ttl) {
      await this.cache.set(key, JSON.stringify(value), ttl);
    } else {
      await this.cache.set(key, JSON.stringify(value));
    }
  }

  async get<V>(key: string): Promise<V | null> {
    const value = await this.cache.get<string>(key);
    return value ? JSON.parse(value) : null;
  }

  async delete(key: string): Promise<void> {
    await this.cache.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    return await this.cache.has(key);
  }

  async validate<V>(key: string, value: V): Promise<boolean> {
    const storedValue = await this.cache.get(key);
    return storedValue === JSON.stringify(value);
  }

  async reset(): Promise<void> {
    await this.cache.clear();
  }
}

export { type CacheConfig, CacheService };
