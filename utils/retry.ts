export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
}

/**
 * Retries a function with exponential backoff for handling rate limits (HTTP 429) and other retryable errors
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const {
    maxRetries = 6,
    baseDelay = 1000,
    maxDelay = 32000,
    backoffFactor = 2,
    onRetry
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const data = await fn();
      return {
        success: true,
        data,
        attempts: attempt + 1
      };
    } catch (error) {
      lastError = error as Error;

      // Don't retry on non-retryable errors
      if (attempt === maxRetries || !isRetryableError(lastError)) {
        return {
          success: false,
          error: lastError,
          attempts: attempt + 1
        };
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * Math.pow(backoffFactor, attempt), maxDelay);

      // Notify about retry
      if (onRetry) {
        onRetry(attempt + 1, lastError);
      }

      // Wait before retrying
      await sleep(delay);
    }
  }

  return {
    success: false,
    error: lastError!,
    attempts: maxRetries + 1
  };
}

/**
 * Determines if an error is retryable
 */
function isRetryableError(error: Error): boolean {
  const errorMessage = error.message.toLowerCase();

  // Check for rate limiting errors
  if (
    errorMessage.includes('429') ||
    errorMessage.includes('rate limit') ||
    errorMessage.includes('too many requests') ||
    errorMessage.includes('rate_limit_exceeded')
  ) {
    return true;
  }

  // Check for timeout errors
  if (
    errorMessage.includes('timeout') ||
    errorMessage.includes('network error') ||
    errorMessage.includes('connection')
  ) {
    return true;
  }

  // Check for specific OpenAI errors
  if (
    errorMessage.includes('insufficient_quota') ||
    errorMessage.includes('invalid_api_key') ||
    errorMessage.includes('authentication')
  ) {
    return false; // Don't retry auth/quota errors
  }

  // Check for server errors (5xx)
  if (
    errorMessage.includes('500') ||
    errorMessage.includes('502') ||
    errorMessage.includes('503') ||
    errorMessage.includes('504')
  ) {
    return true;
  }

  return false;
}

/**
 * Sleep helper function
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry wrapper for fetch requests
 */
export async function retryFetch(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  const result = await retryWithBackoff(async () => {
    const response = await fetch(url, options);

    if (!response.ok) {
      // Check if the error is retryable based on status code
      if (response.status === 429 || response.status >= 500) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  }, retryOptions);

  if (!result.success) {
    throw result.error!;
  }

  return result.data as Response;
}

/**
 * Get human-readable retry delay message
 */
export function getRetryMessage(attempt: number, delay: number): string {
  if (attempt === 1) {
    return `Rate limited. Retrying in ${Math.round(delay / 1000)} seconds...`;
  }
  return `Retry ${attempt} of 6. Waiting ${Math.round(delay / 1000)} seconds...`;
}