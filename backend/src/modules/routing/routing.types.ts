export interface RouteResult {
  distanceKm: number;
  durationMinutes: number;
  geometry: [number, number][]; // Array of [longitude, latitude] coordinates
}

export interface IRoutingProvider {
  getRoute(
    startLat: number,
    startLng: number,
    destLat: number,
    destLng: number
  ): Promise<RouteResult>;
}
