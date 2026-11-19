/**
 * ShareBite High-Assurance API Client & Caching Engine
 * Features: Time-To-Live (TTL), In-Flight Request Deduplication, Stale-While-Revalidate
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

class ResilientApiCache {
  private inFlightRequests: Map<string, Promise<any>> = new Map();
  private memoryCache: Map<string, CacheEntry<any>> = new Map();

  /**
   * Fetches data with proactive caching, deduplication, and stale fallback
   */
  async fetchWithCache<T>(
    cacheKey: string,
    fetcher: () => Promise<T>,
    ttlMinutes: number = 30,
    fallbackData?: T
  ): Promise<T> {
    const ttlMs = ttlMinutes * 60 * 1000;
    const now = Date.now();

    // 1. Check in-memory / localStorage cache
    const cached = this.getCache<T>(cacheKey);
    if (cached && now - cached.timestamp < cached.ttlMs) {
      return cached.data;
    }

    // 2. Prevent duplicate in-flight requests (Deduplication)
    if (this.inFlightRequests.has(cacheKey)) {
      return this.inFlightRequests.get(cacheKey) as Promise<T>;
    }

    const requestPromise = (async () => {
      try {
        const freshData = await fetcher();
        this.setCache(cacheKey, freshData, ttlMs);
        return freshData;
      } catch (error: any) {
        console.warn(`[ApiCache] Upstream request failed for ${cacheKey}. Serving fallback.`, error);

        // 3. Graceful degradation: return stale cache if available
        if (cached) {
          console.info(`[ApiCache] Serving stale cache for ${cacheKey}`);
          return cached.data;
        }

        // 4. Return designated default mock data if available
        if (fallbackData !== undefined) {
          return fallbackData;
        }

        throw error;
      } finally {
        this.inFlightRequests.delete(cacheKey);
      }
    })();

    this.inFlightRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }

  getCache<T>(key: string): CacheEntry<T> | null {
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key) as CacheEntry<T>;
    }
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(`sb_cache_${key}`);
        if (stored) {
          const entry: CacheEntry<T> = JSON.parse(stored);
          this.memoryCache.set(key, entry);
          return entry;
        }
      }
    } catch {
      // Storage unavailable or quota exceeded
    }
    return null;
  }

  setCache<T>(key: string, data: T, ttlMs: number): void {
    const entry: CacheEntry<T> = { data, timestamp: Date.now(), ttlMs };
    this.memoryCache.set(key, entry);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(`sb_cache_${key}`, JSON.stringify(entry));
      }
    } catch {
      // Handle storage full
    }
  }

  clearKey(key: string): void {
    this.memoryCache.delete(key);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(`sb_cache_${key}`);
      }
    } catch {
      //
    }
  }

  clearAll(): void {
    this.memoryCache.clear();
  }
}

export const apiCache = new ResilientApiCache();

/**
 * Request Debouncer for Autocomplete Inputs
 */
export function debounce<T extends (...args: any[]) => void>(func: T, waitMs: number): T {
  let timeout: any;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), waitMs);
  }) as T;
}
