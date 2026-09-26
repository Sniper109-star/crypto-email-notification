export interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  jitterFactor?: number;
}

export function calculateBackoffDelay(
  attempt: number,
  options: RetryOptions = {}
): number {
  const {
    initialDelayMs = 1000,
    maxDelayMs = 30000,
    backoffMultiplier = 2,
    jitterFactor = 0.1,
  } = options;

  const exponentialDelay = initialDelayMs * Math.pow(backoffMultiplier, attempt - 1);
  const cappedDelay = Math.min(exponentialDelay, maxDelayMs);
  const jitter = cappedDelay * jitterFactor * Math.random();
  return Math.floor(cappedDelay + jitter);
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
  operationName = 'operation'
): Promise<T> {
  const { maxAttempts = 3 } = options;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = attempt === maxAttempts;

      if (isLastAttempt) {
        throw error;
      }

      const delayMs = calculateBackoffDelay(attempt, options);
      console.warn(`${operationName} failed, retrying in ${delayMs}ms`, { attempt, delayMs, error });
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw new Error(`${operationName} failed: max attempts reached`);
}

export function isRetryableError(error: any): boolean {
  if (error?.code === 'ECONNREFUSED' || error?.code === 'ETIMEDOUT') return true;
  if (error?.message?.includes('rate limit')) return true;
  if (error?.statusCode === 429 || error?.statusCode === 503) return true;
  if (error?.statusCode === 400 || error?.statusCode === 422) return false;
  return false;
}
