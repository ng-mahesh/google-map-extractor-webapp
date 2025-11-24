import { Logger } from '@nestjs/common';

const logger = new Logger('RetryHelper');

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableErrors?: string[];
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Retry a function with exponential backoff
 *
 * @param fn - The async function to retry
 * @param options - Retry configuration options
 * @returns The result of the function
 * @throws The last error if all retries fail
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    retryableErrors = ['timeout', 'network', 'ECONNRESET', 'ETIMEDOUT', 'navigation'],
    onRetry,
  } = options;

  let lastError: Error;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if error is retryable
      const isRetryable = retryableErrors.some((retryableError) =>
        error.message?.toLowerCase().includes(retryableError.toLowerCase()),
      );

      // Don't retry if it's the last attempt or error is not retryable
      if (attempt === maxAttempts || !isRetryable) {
        logger.warn(`Operation failed after ${attempt} attempt(s): ${error.message}`);
        throw error;
      }

      // Log retry attempt
      logger.debug(
        `Attempt ${attempt}/${maxAttempts} failed: ${error.message}. Retrying in ${delay}ms...`,
      );

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(attempt, error as Error);
      }

      // Wait before retrying
      await sleep(delay);

      // Calculate next delay with exponential backoff
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  throw lastError!;
}

/**
 * Retry a function with linear backoff
 */
export async function retryWithLinearBackoff<T>(
  fn: () => Promise<T>,
  options: Omit<RetryOptions, 'backoffMultiplier'> = {},
): Promise<T> {
  return retryWithBackoff(fn, {
    ...options,
    backoffMultiplier: 1, // Linear backoff
  });
}

/**
 * Retry a function with a fixed delay
 */
export async function retryWithFixedDelay<T>(
  fn: () => Promise<T>,
  options: Omit<RetryOptions, 'backoffMultiplier' | 'maxDelay'> = {},
): Promise<T> {
  return retryWithBackoff(fn, {
    ...options,
    backoffMultiplier: 1,
    maxDelay: options.initialDelay || 1000,
  });
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(
  error: Error,
  retryableErrors: string[] = ['timeout', 'network', 'ECONNRESET', 'ETIMEDOUT'],
): boolean {
  return retryableErrors.some((retryableError) =>
    error.message?.toLowerCase().includes(retryableError.toLowerCase()),
  );
}

/**
 * Retry with custom retry condition
 */
export async function retryWithCondition<T>(
  fn: () => Promise<T>,
  shouldRetry: (error: Error, attempt: number) => boolean,
  options: Omit<RetryOptions, 'retryableErrors'> = {},
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    onRetry,
  } = options;

  let lastError: Error;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check custom retry condition
      if (attempt === maxAttempts || !shouldRetry(error as Error, attempt)) {
        throw error;
      }

      logger.debug(
        `Attempt ${attempt}/${maxAttempts} failed: ${error.message}. Retrying in ${delay}ms...`,
      );

      if (onRetry) {
        onRetry(attempt, error as Error);
      }

      await sleep(delay);
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  throw lastError!;
}
