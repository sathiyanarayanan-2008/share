import { describe, it, expect } from 'vitest';
import {
  calculateHaversineDistance,
  formatDistance,
  isValidCoordinate,
  CHENNAI_FALLBACK,
  NYC_FALLBACK,
} from '../utils/geo';

describe('Geolocation and Haversine Distance Tests', () => {
  it('validates coordinates accurately', () => {
    expect(isValidCoordinate(CHENNAI_FALLBACK[0], CHENNAI_FALLBACK[1])).toBe(true);
    expect(isValidCoordinate(NYC_FALLBACK[0], NYC_FALLBACK[1])).toBe(true);
    expect(isValidCoordinate(91, 0)).toBe(false);
    expect(isValidCoordinate(0, 185)).toBe(false);
    expect(isValidCoordinate(null, 50)).toBe(false);
    expect(isValidCoordinate(undefined, undefined)).toBe(false);
    expect(isValidCoordinate(NaN, 50)).toBe(false);
  });

  it('calculates accurate Haversine distance between Chennai landmarks', () => {
    // Chennai Central [13.0827, 80.2707] to T. Nagar [13.0418, 80.2341] (~5.9 km)
    const distance = calculateHaversineDistance(13.0827, 80.2707, 13.0418, 80.2341);
    expect(distance).toBeGreaterThan(5.0);
    expect(distance).toBeLessThan(7.0);
  });

  it('calculates accurate Haversine distance between Manhattan coordinates', () => {
    // Wall Street [40.7068, -74.0090] to Rockefeller Plaza [40.7587, -73.9787] (~6.3 km)
    const distance = calculateHaversineDistance(40.7068, -74.0090, 40.7587, -73.9787);
    expect(distance).toBeGreaterThan(5.5);
    expect(distance).toBeLessThan(7.0);
  });

  it('handles identical points with 0 km distance', () => {
    const distance = calculateHaversineDistance(13.0827, 80.2707, 13.0827, 80.2707);
    expect(distance).toBe(0);
  });

  it('returns Infinity for invalid inputs without crashing', () => {
    expect(calculateHaversineDistance(NaN, 80, 13, 80)).toBe(Infinity);
    expect(calculateHaversineDistance(13, 200, 13, 80)).toBe(Infinity);
  });

  it('formats distance strings properly', () => {
    expect(formatDistance(0.4)).toBe('400 m');
    expect(formatDistance(4.24)).toBe('4.2 km');
    expect(formatDistance(15.8)).toBe('15.8 km');
    expect(formatDistance(Infinity)).toBe('Unknown distance');
  });
});
