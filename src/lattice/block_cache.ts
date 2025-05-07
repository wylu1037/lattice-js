import { DBlock } from "@/common/types";
import { E } from "@/common/types/index";
import { CacheConfig, CacheService } from "@/lattice/index";

interface BlockCache {
  putBlock(chainId: number, address: string, block: DBlock): Promise<void>;
  getBlock(chainId: number, address: string): Promise<E.Either<DBlock, Error>>;
}

class BlockCacheImpl implements BlockCache {
  private cache: CacheService;

  constructor(config: CacheConfig) {
    this.cache = new CacheService(config);
  }

  async putBlock(
    chainId: number,
    address: string,
    block: DBlock
  ): Promise<void> {
    await this.cache.set(`${chainId}-${address}`, block);
  }

  async getBlock(
    chainId: number,
    address: string
  ): Promise<E.Either<DBlock, Error>> {
    const block = await this.cache.get<DBlock>(`${chainId}-${address}`);
    if (block) {
      return E.left(block);
    }
    return E.right(new Error("Block not found"));
  }
}

export { BlockCacheImpl };