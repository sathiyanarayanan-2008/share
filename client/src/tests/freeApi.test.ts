import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiCache } from '../services/apiCache';
import { freeApiService } from '../services/freeApiService';

describe('Resilient API Cache & Free API Client Tests', () => {
  beforeEach(() => {
    apiCache.clearAll();
  });

  it('proactively caches responses and avoids duplicate network calls', async () => {
    let callCount = 0;
    const mockFetcher = async () => {
      callCount++;
      return { temp: 22.5 };
    };

    // First call: cache miss
    const result1 = await apiCache.fetchWithCache('test_key', mockFetcher, 10);
    expect(result1.temp).toBe(22.5);
    expect(callCount).toBe(1);

    // Second call within TTL: cache hit
    const result2 = await apiCache.fetchWithCache('test_key', mockFetcher, 10);
    expect(result2.temp).toBe(22.5);
    expect(callCount).toBe(1); // network fetcher not called again
  });

  it('deduplicates simultaneous in-flight requests', async () => {
    let callCount = 0;
    const delayedFetcher = async () => {
      callCount++;
      await new Promise((r) => setTimeout(r, 50));
      return { status: 'OK' };
    };

    // Dispatch 3 concurrent requests simultaneously
    const [p1, p2, p3] = await Promise.all([
      apiCache.fetchWithCache('concurrent_key', delayedFetcher, 10),
      apiCache.fetchWithCache('concurrent_key', delayedFetcher, 10),
      apiCache.fetchWithCache('concurrent_key', delayedFetcher, 10),
    ]);

    expect(p1.status).toBe('OK');
    expect(p2.status).toBe('OK');
    expect(p3.status).toBe('OK');
    expect(callCount).toBe(1); // only 1 upstream request made
  });

  it('serves graceful fallback data when upstream API fails', async () => {
    const failingFetcher = async () => {
      throw new Error('500 Internal Server Error');
    };

    const fallbackData = { temperatureC: 20.0, isHighRiskForFood: false };
    const result = await apiCache.fetchWithCache(
      'failing_key',
      failingFetcher,
      10,
      fallbackData
    );

    expect(result.temperatureC).toBe(20.0);
    expect(result.isHighRiskForFood).toBe(false);
  });
});
