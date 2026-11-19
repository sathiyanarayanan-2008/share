import { apiCache } from './apiCache';
import axios from 'axios';

export interface GeocodingResult {
  name: string;
  street?: string;
  city?: string;
  state?: string;
  postcode?: string;
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

export interface WeatherCondition {
  temperatureC: number;
  weatherCode: number;
  description: string;
  isHighRiskForFood: boolean;
  rainRisk: boolean;
}

export interface RouteEstimate {
  distanceKm: number;
  durationMinutes: number;
  polylineCoords: [number, number][];
}

export const freeApiService = {
  /**
   * 1. Free Address Autocomplete using Photon by Komoot (OpenStreetMap)
   * Limit: Unlimited / Fair use (Cached for 24 hours per query)
   */
  async searchAddress(query: string): Promise<GeocodingResult[]> {
    if (!query || query.trim().length < 3) return [];
    const cleanQuery = query.trim().toLowerCase();
    const cacheKey = `geo_search_${encodeURIComponent(cleanQuery)}`;

    return apiCache.fetchWithCache<GeocodingResult[]>(
      cacheKey,
      async () => {
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQuery)}&limit=5`;
        const res = await axios.get(url, { timeout: 4000 });

        if (!res.data?.features) return [];

        return res.data.features.map((item: any) => {
          const p = item.properties || {};
          const [lng, lat] = item.geometry?.coordinates || [0, 0];
          const parts = [p.name, p.street, p.city, p.state, p.postcode].filter(Boolean);
          return {
            name: p.name || p.street || 'Location',
            street: p.street,
            city: p.city,
            state: p.state,
            postcode: p.postcode,
            latitude: lat,
            longitude: lng,
            formattedAddress: parts.length > 0 ? parts.join(', ') : `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          };
        });
      },
      1440, // Cache for 24 hours
      [] // Fallback to empty list
    );
  },

  /**
   * 2. Live Weather & Cold-Chain Alert via Open-Meteo
   * Limit: 10,000 calls/day (No key needed). Cached for 30 minutes.
   */
  async getWeatherAlert(lat: number, lng: number): Promise<WeatherCondition> {
    const roundedLat = lat.toFixed(2);
    const roundedLng = lng.toFixed(2);
    const cacheKey = `weather_${roundedLat}_${roundedLng}`;

    const fallback: WeatherCondition = {
      temperatureC: 20.0,
      weatherCode: 0,
      description: 'Standard ambient conditions',
      isHighRiskForFood: false,
      rainRisk: false,
    };

    return apiCache.fetchWithCache<WeatherCondition>(
      cacheKey,
      async () => {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${roundedLat}&longitude=${roundedLng}&current_weather=true`;
        const res = await axios.get(url, { timeout: 3500 });
        const weather = res.data?.current_weather;
        if (!weather) return fallback;

        const temp = weather.temperature;
        const code = weather.weathercode;

        // WMO Weather codes: 51-67 = rain/drizzle, 71-77 = snow, 80-82 = showers, 95-99 = thunderstorm
        const isRaining = (code >= 51 && code <= 67) || (code >= 80 && code <= 99);
        // Extreme heat above 28°C poses rapid bacterial reproduction risk for cooked/refrigerated food
        const highRisk = temp > 28 || temp < -5;

        let description = 'Optimal transport weather';
        if (isRaining) description = 'Precipitation detected: sealed waterproof transport required';
        else if (temp > 28) description = 'Elevated ambient heat: rapid insulated cooling mandatory';

        return {
          temperatureC: temp,
          weatherCode: code,
          description,
          isHighRiskForFood: highRisk,
          rainRisk: isRaining,
        };
      },
      30, // 30-minute TTL
      fallback
    );
  },

  /**
   * 3. Courier Turn-by-Turn Routing & ETA via OSRM (Open Source Routing Machine)
   * Limit: Public demo server (~5,000 calls/day). Cached for 2 hours.
   */
  async getRoute(
    start: [number, number],
    end: [number, number]
  ): Promise<RouteEstimate> {
    const cacheKey = `route_${start[0].toFixed(3)}_${start[1].toFixed(3)}_to_${end[0].toFixed(3)}_${end[1].toFixed(3)}`;

    const fallback: RouteEstimate = {
      distanceKm: 3.5,
      durationMinutes: 12,
      polylineCoords: [start, end],
    };

    return apiCache.fetchWithCache<RouteEstimate>(
      cacheKey,
      async () => {
        const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
        const res = await axios.get(url, { timeout: 4500 });
        const route = res.data?.routes?.[0];
        if (!route) return fallback;

        return {
          distanceKm: Math.round((route.distance / 1000) * 10) / 10,
          durationMinutes: Math.round(route.duration / 60),
          polylineCoords: route.geometry?.coordinates?.map(([lng, lat]: [number, number]) => [lat, lng]) || [start, end],
        };
      },
      120, // 2-hour TTL
      fallback
    );
  },
};
