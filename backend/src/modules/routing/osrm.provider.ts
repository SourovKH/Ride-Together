import { IRoutingProvider, RouteResult } from './routing.types.js';

function getHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
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

export class OsrmRoutingProvider implements IRoutingProvider {
  private baseUrl = 'https://router.project-osrm.org/route/v1/driving';

  async getRoute(
    startLat: number,
    startLng: number,
    destLat: number,
    destLng: number
  ): Promise<RouteResult> {
    try {
      const url = `${this.baseUrl}/${startLng},${startLat};${destLng},${destLat}?overview=full&geometries=geojson`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`OSRM API error: ${response.statusText}`);
      }

      const data: any = await response.json();
      if (!data.routes || data.routes.length === 0) {
        throw new Error('No route found from OSRM');
      }

      const route = data.routes[0];
      const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
      const durationMinutes = Math.round(route.duration / 60);
      const geometry = route.geometry.coordinates; // [lng, lat][]

      console.log(`🗺️ OSRM Route fetched successfully: ${distanceKm} km, ${durationMinutes} mins`);

      return {
        distanceKm,
        durationMinutes,
        geometry,
      };
    } catch (err: any) {
      console.warn('⚠️ OSRM Routing request failed/timed out. Falling back to straight-line geometry:', err.message);

      // Fallback straight-line geometry
      const distanceKm = getHaversineDistanceKm(startLat, startLng, destLat, destLng);
      // Estimate driving speed as ~40 km/h for fallback duration calculation
      const durationMinutes = Math.round((distanceKm / 40) * 60);

      return {
        distanceKm,
        durationMinutes: Math.max(1, durationMinutes),
        geometry: [
          [startLng, startLat],
          [destLng, destLat],
        ],
      };
    }
  }
}
