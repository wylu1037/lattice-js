import { log } from "@/logger";
import { Mutex } from "@/utils/index";
import { ResultAsync } from "neverthrow";

/**
 * Account lock interface
 */
export interface AccountLock {
  /**
   * Obtain account lock
   * @param chainId Chain ID
   * @param address Account address
   */
  obtain(chainId: string | number, address: string): Promise<void>;

  /**
   * Release account lock
   * @param chainId Chain ID
   * @param address Account address
   */
  unlock(chainId: string | number, address: string): void;

  /**
   * Execute function with lock
   * @param chainId Chain ID
   * @param address Account address
   * @param block Function to execute with lock
   * @returns Result of the function
   */
  withLock<T>(
    chainId: string | number,
    address: string,
    block: () => Promise<T>
  ): ResultAsync<T, Error>;
}

/**
 * Account lock implementation
 */
export class AccountLockImpl implements AccountLock {
  private locks = new Map<string, Mutex>();
  private lockReleases = new Map<string, () => void>();

  async obtain(chainId: string | number, address: string): Promise<void> {
    log.debug(`obtain account lock, chainId: ${chainId}, address: ${address}`);
    const key = `${chainId}_${address}`;

    if (!this.locks.has(key)) {
      this.locks.set(key, new Mutex());
    }

    const lock = this.locks.get(key);
    if (lock) {
      await lock.obtain().then((release) => {
        this.lockReleases.set(key, release);
      });
    }
  }

  unlock(chainId: string | number, address: string): void {
    log.debug(`unlock account lock, chainId: ${chainId}, address: ${address}`);
    const key = `${chainId}_${address}`;

    const release = this.lockReleases.get(key);
    if (release) {
      release();
      this.lockReleases.delete(key);
    }
  }

  withLock<T>(
    chainId: string | number,
    address: string,
    block: () => Promise<T>
  ): ResultAsync<T, Error> {
    return ResultAsync.fromSafePromise(
      this.obtain(chainId, address).then(async () => {
        return await block().finally(() => {
          this.unlock(chainId, address);
        });
      })
    );
  }
}

/**
 * Create a new account lock
 * @returns Account lock instance
 */
export function newAccountLock(): AccountLock {
  return new AccountLockImpl();
}
