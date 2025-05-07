import { log } from "@/logger";

const retry = require("async-retry");

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

  async execute(fn: () => Promise<T>): Promise<T> {
    return retry(
      async (bail: (error: Error) => void, attempt: number) => {
        try {
          return await fn();
        } catch (error) {
          if (error instanceof Error) {
            // Exit early for specific errors
            if (error.message.includes("Bad request")) {
              bail(error);
              return;
            }
          }
          throw error;
        }
      },
      {
        retries: this.retries,
        onRetry: (error: Error, attempt: number) => {
          const nextDelay = this.strategy.getDelay(attempt + 1);
          log.warn(
            `Retry attempt #${attempt}, next delay: ${nextDelay}ms, error: ${error.message}`
          );
          this.onRetry?.(error, attempt);
        }
      }
    );
  }
}

export {
  type RetryStrategy,
  FixedDelayStrategy,
  RandomDelayStrategy,
  ExponentialBackoffStrategy,
  RetryHandler
};