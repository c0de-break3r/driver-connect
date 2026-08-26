export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type LocationRegion = {
  city: string;
  region: string;
  coordinates: Coordinates;
};

export const LOCATION_REGIONS: LocationRegion[] = [
  { city: "Accra", region: "Greater Accra", coordinates: { latitude: 5.6037, longitude: -0.187 } },
  { city: "Tema", region: "Greater Accra", coordinates: { latitude: 5.6698, longitude: -0.0166 } },
  { city: "Kumasi", region: "Ashanti", coordinates: { latitude: 6.6885, longitude: -1.6244 } },
  { city: "Cape Coast", region: "Central", coordinates: { latitude: 5.1054, longitude: -1.2463 } },
  { city: "Tamale", region: "Northern", coordinates: { latitude: 9.4034, longitude: -0.8394 } },
  { city: "Koforidua", region: "Eastern", coordinates: { latitude: 6.1508, longitude: -0.2574 } },
  { city: "Sekondi-Takoradi", region: "Western", coordinates: { latitude: 4.9346, longitude: -1.7124 } },
  { city: "Sunyani", region: "Bono", coordinates: { latitude: 7.3393, longitude: -2.3266 } },
  { city: "Bolgatanga", region: "Upper East", coordinates: { latitude: 10.7853, longitude: -0.8518 } },
  { city: "Wa", region: "Upper West", coordinates: { latitude: 10.0604, longitude: -2.5019 } },
];

export function getRegionFromLocation(locationText: string): string {
  const normalized = locationText.toLowerCase();
  const match = LOCATION_REGIONS.find((region) => normalized.includes(region.city.toLowerCase()) || normalized.includes(region.region.toLowerCase()));
  return match?.region ?? "Unknown";
}

export function getCoordinatesForRegion(region: string): Coordinates {
  const match = LOCATION_REGIONS.find((item) => item.region.toLowerCase() === region.toLowerCase());
  return match?.coordinates ?? { latitude: 0, longitude: 0 };
}

export function calculateDistanceKm(from: Coordinates, to: Coordinates): number {
  const R = 6371;
  const dLat = ((to.latitude - from.latitude) * Math.PI) / 180;
  const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;
  const lat1 = (from.latitude * Math.PI) / 180;
  const lat2 = (to.latitude * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function sortByProximity<T extends { location: string }>(items: T[], userRegion: string): T[] {
  if (!userRegion || userRegion === "Unknown") return items;
  const userCoords = getCoordinatesForRegion(userRegion);
  return [...items].sort((a, b) => {
    const regionA = getRegionFromLocation(a.location);
    const regionB = getRegionFromLocation(b.location);
    const distanceA = calculateDistanceKm(userCoords, getCoordinatesForRegion(regionA));
    const distanceB = calculateDistanceKm(userCoords, getCoordinatesForRegion(regionB));
    return distanceA - distanceB;
  });
}
