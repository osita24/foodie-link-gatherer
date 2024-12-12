const EARTH_RADIUS_KM = 6371; // Earth's radius in kilometers
const MAX_DISTANCE_KM = 1; // Maximum allowed distance in kilometers

export function isLocationNearby(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): boolean {
  // Convert coordinates to radians
  const lat1Rad = toRadians(lat1);
  const lon1Rad = toRadians(lon1);
  const lat2Rad = toRadians(lat2);
  const lon2Rad = toRadians(lon2);

  // Calculate differences
  const dLat = lat2Rad - lat1Rad;
  const dLon = lon2Rad - lon1Rad;

  // Haversine formula
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
           Math.cos(lat1Rad) * Math.cos(lat2Rad) *
           Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;

  console.log('📏 Distance between points:', distance.toFixed(2), 'km');
  return distance <= MAX_DISTANCE_KM;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}