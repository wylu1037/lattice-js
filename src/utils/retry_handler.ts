import { log } from "@/logger";
import { RetryStatus, retryAsync } from "@/utils/index";

/**
 * RetryStrategy
 */
interface RetryStrategy {
  /**
   * Calculate delay based on attempt times
   * @param attempt Attempt times
   * @returns Delay time
   */
  getDelay(attempt: number): number;
  /**
   * Max timeout
   */
  maxTimeout: number;
}

/**
 * FixedDelayStrategy
 */
class FixedDelayStrategy implements RetryStrategy {
  constructor(
    private delay: number, // Fixed delay time (ms)
    public maxTimeout: number = Infinity
  ) {}

  /**
   * Default fixed delay strategy
   */
  static default = new FixedDelayStrategy(500, 1000);

  getDelay(): number {
    return Math.min(this.delay, this.maxTimeout);
  }
}

/**
 * RandomDelayStrategy
 */
class RandomDelayStrategy implements RetryStrategy {
  constructor(
    private minDelay: number, // Minimum delay time (ms)
    private maxDelay: number, // Maximum delay time (ms)
    public maxTimeout: number = Infinity
  ) {
    if (minDelay > maxDelay) {
      throw new Error("minDelay must be less than or equal to maxDelay");
    }
  }

  /**
   * Default random delay strategy
   */
  static default = new RandomDelayStrategy(300, 1000, 2000);

  getDelay(): number {
    // Generate random delay between minDelay and maxDelay
    const delay =
      this.minDelay + Math.random() * (this.maxDelay - this.minDelay);
    return Math.min(delay, this.maxTimeout);
  }
}

/**
 * ExponentialBackoffStrategy
 */
class ExponentialBackoffStrategy implements RetryStrategy {
  constructor(
    private baseDelay: number, // Base delay time (ms)
    private factor: number, // Exponential factor
    public maxTimeout: number = Infinity,
    private randomize = false // Whether to add random jitter
  ) {}

  /**
   * Default exponential backoff strategy
   */
  static default = new ExponentialBackoffStrategy(300, 2, 5000, true);

  getDelay(attempt: number): number {
    let delay = this.baseDelay * this.factor ** (attempt - 1);
    if (this.randomize) {
      // Add random jitter (50%~150%)
      delay *= 0.5 + Math.random();
    }
    return Math.min(delay, this.maxTimeout);
  }
}

/**
 * RetryHandler
 */
class RetryHandler<T> {
  constructor(
    private strategy: RetryStrategy, // Retry strategy
    private retries: number, // Maximum retry times
    private onRetry?: (error: Error, attempt: number) => void // Retry callback
  ) {}

  /**
   * Execute the async function and retry according to the strategy
   * @param fn The async function to execute
   * @returns The result of the async function
   */
  async execute(fn: () => Promise<T>): Promise<T> {
    const delayFn = (status: RetryStatus) => {
      const nextDelay = this.strategy.getDelay(status.index + 1);
      if (status.error) {
        this.onRetry?.(status.error, status.index);
      }

      return nextDelay;
    };

    const retryFn = (status: RetryStatus) => {
      if (status.index >= this.retries) {
        return false;
      }

      if (
        status.error &&
        status.error instanceof Error &&
        status.error.message.includes("Bad request")
      ) {
        return false;
      }

      return true;
    };

    const errorFn = (status: RetryStatus) => {
      if (status.error) {
        log.error(
          `Retry failed after attempt #${status.index}, duration: ${status.duration}ms, error: ${status.error.message}`
        );
      }
    };

    const wrappedFn = (_: RetryStatus) => fn();

    return retryAsync(wrappedFn, {
      retry: retryFn,
      delay: delayFn,
      error: errorFn
    });
  }
}

export {
  type RetryStrategy,
  FixedDelayStrategy,
  RandomDelayStrategy,
  ExponentialBackoffStrategy,
  RetryHandler
};