import { describe, it, expect } from 'vitest';

// Frontend mirror of Haversine distance and deterministic score calculation
function calculateHaversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371.0;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function computeDeterministicScore(distanceKm: number, capacityRatio: number, hoursLeft: number): number {
  const distanceScore = distanceKm <= 1.0 ? 100 : Math.max(10, 100 - (distanceKm - 1) * 3.1);
  const capacityScore = capacityRatio >= 1.0 ? Math.max(70, 100 - (capacityRatio - 1) * 10) : capacityRatio * 75;
  const urgencyScore = hoursLeft <= 0 ? 0 : hoursLeft <= 4 ? 92 : 80;
  const total = 0.45 * distanceScore + 0.3 * capacityScore + 0.25 * urgencyScore;
  return Math.round(total * 10) / 10;
}

describe('Frontend Deterministic Logistics Verification', () => {
  it('calculates accurate Haversine distance between Manhattan coordinates', () => {
    // Delancey St (40.7182, -73.9877) to Broadway (40.7145, -74.0064) ~ 1.6 km
    const distance = calculateHaversine(40.7182, -73.9877, 40.7145, -74.0064);
    expect(distance).toBeGreaterThan(1.0);
    expect(distance).toBeLessThan(2.5);
  });

  it('computes expected deterministic fit score between 0 and 100', () => {
    const score = computeDeterministicScore(1.6, 1.2, 3.5);
    expect(score).toBeGreaterThan(70);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('penalizes distant listings appropriately according to formula', () => {
    const nearScore = computeDeterministicScore(1.0, 1.0, 3.0);
    const farScore = computeDeterministicScore(25.0, 1.0, 3.0);
    expect(nearScore).toBeGreaterThan(farScore);
  });
});
