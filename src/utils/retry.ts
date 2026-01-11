/**
 * Retry utilities with exponential backoff
 */

interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  shouldRetry?: (error: Error, attempt: number) => boolean;
  onRetry?: (error: Error, attempt: number, delay: number) => void;
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    shouldRetry = () => true,
    onRetry,
  } = options;

  let lastError: Error;
  let attempt = 0;

  while (attempt < maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      attempt++;

      // Check if we should retry
      if (attempt >= maxAttempts || !shouldRetry(lastError, attempt)) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        initialDelay * Math.pow(backoffFactor, attempt - 1),
        maxDelay
      );

      // Call retry callback if provided
      if (onRetry) {
        onRetry(lastError, attempt, delay);
      }

      // Wait before retrying
      await sleep(delay);
    }
  }

  throw lastError!;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Default retry predicate for network errors
 */
export function shouldRetryNetworkError(error: Error): boolean {
  // Retry on network errors, timeouts, and 5xx errors
  const message = error.message.toLowerCase();
  return (
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('fetch') ||
    message.includes('503') ||
    message.includes('504') ||
    message.includes('500')
  );
}

/**
 * Create a retryable fetch function
 */
export function createRetryableFetch(
  url: string,
  init?: RequestInit,
  retryOptions?: RetryOptions
): Promise<Response> {
  return retry(
    () => fetch(url, init),
    {
      maxAttempts: 3,
      initialDelay: 1000,
      shouldRetry: (error) => shouldRetryNetworkError(error),
      onRetry: (error, attempt, delay) => {
        console.log(
          `Retry attempt ${attempt} after ${delay}ms due to error: ${error.message}`
        );
      },
      ...retryOptions,
    }
  );
}
