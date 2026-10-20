/**
 * In-memory sliding window rate limiter
 * Protects actions (contact forms, catalog queries) against abuse.
 */

interface RateLimitStore {
  [key: string]: {
    tokens: number;
    lastRefill: number;
  };
}

const store: RateLimitStore = {};

export interface RateLimitOptions {
  intervalMs?: number; // window interval, default 60000ms (1 min)
  maxTokens?: number;  // max tokens per interval, default 15
}

export function rateLimit(identifier: string, options: RateLimitOptions = {}) {
  const { intervalMs = 60000, maxTokens = 15 } = options;
  const now = Date.now();

  if (!store[identifier]) {
    store[identifier] = {
      tokens: maxTokens - 1,
      lastRefill: now,
    };
    return { success: true, remaining: maxTokens - 1 };
  }

  const record = store[identifier];
  const elapsed = now - record.lastRefill;

  if (elapsed >= intervalMs) {
    record.tokens = maxTokens - 1;
    record.lastRefill = now;
    return { success: true, remaining: maxTokens - 1 };
  }

  if (record.tokens > 0) {
    record.tokens -= 1;
    return { success: true, remaining: record.tokens };
  }

  return {
    success: false,
    remaining: 0,
    retryAfterMs: intervalMs - elapsed,
  };
}
