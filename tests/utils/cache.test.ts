import { CacheService } from "@/utils/cache";

describe("cache service", () => {
  describe("memory", () => {
    it("should be able to set and get a value", async () => {
      const cache = CacheService.memory();
      const key = "test";
      const data = "test";
      await cache.set(key, data);
      const actual = await cache.get(key);
      expect(actual).toBe(data);
    });

    it("should be able to delete a value", async () => {
      const cache = CacheService.memory();
      const key = "test";
      await cache.set(key, "test1");
      await cache.delete(key);
      const actual = await cache.get(key);
      expect(actual).toBeNull();
    });

    it("should be able to set a value with a ttl", async () => {
      const cache = CacheService.memory();
      const key = "test";
      await cache.set(key, "test1", 2000);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const actual = await cache.get(key);
      expect(actual).toBeNull();
    });
  });

  describe.skip("redis", () => {
    const cache = CacheService.redis("redis://:root1234@172.22.0.23:6379/2");

    it("should be able to set and get a value", async () => {
      const key = "test";
      const data = "test1";
      await cache.set(key, data);
      const actual = await cache.get(key);
      expect(actual).toBe(data);
    });

    it("should be unable to get a value that doesn't exist", async () => {
      const key = "test:does-not-exist";
      const actual = await cache.get(key);
      expect(actual).toBeNull();
    });

    it("should be able to delete a value", async () => {
      const key = "test";
      await cache.set(key, "test1");
      await cache.delete(key);
      const actual = await cache.get(key);
      expect(actual).toBeNull();
    });

    it("should be able to set a value with a ttl", async () => {
      const key = "test";
      await cache.set(key, "test1", 2000);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const actual = await cache.get(key);
      expect(actual).toBeNull();
    });
  });
});
