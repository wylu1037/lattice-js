import { LatestBlock } from "@/common/types";
import { E } from "@/common/types/index";
import { log } from "@/logger";
import { CacheConfig, CacheService } from "@/utils/index";

/**
 * block cache interface
 */
export type BlockCache = {
  putBlock(chainId: number, address: string, block: LatestBlock): Promise<void>;
  getBlock(
    chainId: number,
    address: string,
    fallback: (chainId: number, address: string) => Promise<LatestBlock>
  ): Promise<E.Either<LatestBlock, Error>>;
};

/**
 * block cache implementation
 */
class BlockCacheImpl implements BlockCache {
  private cache: CacheService;
  private readonly daemonHashExpirationMs: number;
  private daemonHashExpireAtMap = new Map<string, Date>();

  /**
   * constructor
   * @param config cache config
   * @param httpClient http client
   * @param daemonHashExpirationSeconds daemon hash expiration seconds, default is 10 seconds
   */
  constructor(config: CacheConfig, daemonHashExpirationSeconds = 10) {
    this.cache = new CacheService(config);
    this.daemonHashExpirationMs = daemonHashExpirationSeconds * 1000;
  }

  async putBlock(
    chainId: number,
    address: string,
    block: LatestBlock
  ): Promise<void> {
    const key = `${chainId}-${address}`;
    await this.cache.set<LatestBlock>(key, block);

    if (!this.daemonHashExpireAtMap.has(chainId.toString())) {
      this.daemonHashExpireAtMap.set(
        chainId.toString(),
        new Date(Date.now() + this.daemonHashExpirationMs)
      );
    }
  }

  async getBlock(
    chainId: number,
    address: string,
    fallback: (chainId: number, address: string) => Promise<LatestBlock>
  ): Promise<E.Either<LatestBlock, Error>> {
    const key = `${chainId}-${address}`;
    const block = await this.cache.get<LatestBlock>(key);

    if (!block) {
      try {
        const newBlock = await fallback(chainId, address);
        await this.putBlock(chainId, address, newBlock);
        return E.left(newBlock);
      } catch (error) {
        return E.right(
          error instanceof Error ? error : new Error(String(error))
        );
      }
    }

    const expireAt = this.daemonHashExpireAtMap.get(chainId.toString());
    if (expireAt && expireAt < new Date()) {
      log.warn(`daemon hash expired, chainId: ${chainId}`);
      try {
        const latestBlock = await fallback(chainId, address);
        this.daemonHashExpireAtMap.set(
          chainId.toString(),
          new Date(Date.now() + this.daemonHashExpirationMs)
        );
        block.currentDBlockHash = latestBlock.currentDBlockHash;
        await this.cache.set<LatestBlock>(key, block);
      } catch (error) {
        log.error(`Failed to update block hash: ${error}`);
      }
    }

    return E.left(block);
  }
}

export { BlockCacheImpl };