import { log } from "@/logger";
import KeyvRedis, { Keyv } from "@keyv/redis";
import { Cacheable } from "cacheable";

type CacheBackend = "memory" | "redis";

type CacheConfig = {
  backend: CacheBackend;
  redisUrl?: string;
  defaultTtl?: number | string; // 1s, 1h
  namespace?: string; // namespace for redis
};

class CacheService {
  private cache: Cacheable;

  constructor(config: CacheConfig) {
    const { backend, defaultTtl, redisUrl, namespace } = config;

    switch (backend) {
      case "memory":
        this.cache = new Cacheable({ ttl: defaultTtl });
        break;
      case "redis": {
        const primary = new KeyvRedis(
          config.redisUrl || "redis://localhost:6379/0",
          {
            namespace: namespace || "zlattice",
            keyPrefixSeparator: ":"
          }
        );
        primary.on("error", (err) => {
          log.error(`Redis connection error: ${err}`);
        });
        primary.on("connect", () => {
          log.info("Redis connected");
        });
        this.cache = new Cacheable({ primary, ttl: defaultTtl });
        break;
      }
      default:
        throw new Error(`Unsupported cache backend: ${backend}`);
    }
  }

  static memory() {
    return new CacheService({ backend: "memory" });
  }

  static redis(redisUrl: string) {
    return new CacheService({ backend: "redis", redisUrl });
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
