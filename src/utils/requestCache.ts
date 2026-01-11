/**
 * Request caching and deduplication utilities
 */

import { retry, shouldRetryNetworkError } from './retry';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

class RequestCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private pendingRequests: Map<string, PendingRequest<any>> = new Map();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes
  private maxCacheSize = 100;

  /**
   * Get cached data or execute fetcher function
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: { ttl?: number; force?: boolean; retry?: boolean } = {}
  ): Promise<T> {
    const { ttl = this.defaultTTL, force = false, retry: enableRetry = true } = options;

    // Check if there's a pending request for this key
    if (!force && this.pendingRequests.has(key)) {
      const pending = this.pendingRequests.get(key)!;
      // Only reuse if request is less than 30 seconds old
      if (Date.now() - pending.timestamp < 30000) {
        return pending.promise as Promise<T>;
      } else {
        // Clean up stale pending request
        this.pendingRequests.delete(key);
      }
    }

    // Check cache
    if (!force && this.cache.has(key)) {
      const entry = this.cache.get(key)!;
      if (Date.now() < entry.expiresAt) {
        return entry.data as T;
      } else {
        // Remove expired entry
        this.cache.delete(key);
      }
    }

    // Execute fetcher with optional retry
    const promise = enableRetry
      ? retry(fetcher, {
          maxAttempts: 3,
          initialDelay: 1000,
          shouldRetry: shouldRetryNetworkError,
          onRetry: (error, attempt, delay) => {
            console.log(
              `Retrying request (${key}) - Attempt ${attempt} after ${delay}ms. Error: ${error.message}`
            );
          },
        })
      : fetcher();

    // Store as pending request
    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now(),
    });

    try {
      const data = await promise;

      // Store in cache
      this.set(key, data, ttl);

      return data;
    } finally {
      // Clean up pending request
      this.pendingRequests.delete(key);
    }
  }

  /**
   * Set cache entry
   */
  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    // Clean cache if too large
    if (this.cache.size >= this.maxCacheSize) {
      this.cleanCache();
    }

    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    });
  }

  /**
   * Get from cache without fetching
   */
  getCached<T>(key: string): T | null {
    if (this.cache.has(key)) {
      const entry = this.cache.get(key)!;
      if (Date.now() < entry.expiresAt) {
        return entry.data as T;
      } else {
        this.cache.delete(key);
      }
    }
    return null;
  }

  /**
   * Invalidate cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate multiple entries by pattern
   */
  invalidatePattern(pattern: RegExp): void {
    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      if (pattern.test(key)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Clean expired entries and oldest entries
   */
  private cleanCache(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());

    // Remove expired entries
    entries.forEach(([key, entry]) => {
      if (now >= entry.expiresAt) {
        this.cache.delete(key);
      }
    });

    // If still too large, remove oldest entries
    if (this.cache.size >= this.maxCacheSize) {
      const sortedEntries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);

      const toRemove = Math.floor(this.maxCacheSize / 3);
      sortedEntries.slice(0, toRemove).forEach(([key]) => {
        this.cache.delete(key);
      });
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        age: Date.now() - entry.timestamp,
        ttl: entry.expiresAt - Date.now(),
      })),
    };
  }
}

// Export singleton instance
export const requestCache = new RequestCache();

// Helper to create cache keys
export function createCacheKey(base: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  return `${base}?${sortedParams}`;
}
