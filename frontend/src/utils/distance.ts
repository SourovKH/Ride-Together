/**
 * Distance Calculation Utilities using Haversine formula
 */

/**
 * Calculates the great-circle distance between two points in kilometers.
 */
export function getHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
    return 0;
  }

  const R = 6371; // Earth radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // 2 decimal places precision for raw km
}

/**
 * Formats a distance in kilometers to an intuitive human-readable string.
 * Requirement:
 *  - < 1 km → meters (e.g. 850 m)
 *  - ≥ 1 km → kilometers with 1 decimal place (e.g. 2.4 km)
 */
export function formatDistance(distanceKm: number): string {
  if (isNaN(distanceKm) || distanceKm < 0) return '0 m';

  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }

  const km = Math.round(distanceKm * 10) / 10;
  return `${km} km`;
}

/**
 * Calculates and formats distance directly between two pairs of coordinates.
 */
export function formatDistanceFromCoordinates(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): string {
  const distKm = getHaversineDistanceKm(lat1, lon1, lat2, lon2);
  return formatDistance(distKm);
}
