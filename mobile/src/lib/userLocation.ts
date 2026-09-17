import { getRegionFromLocation } from "./location";

let LocationModule: any = null;
try {
  LocationModule = require("expo-location");
} catch {
  LocationModule = null;
}

let cachedUserRegion: string | null = null;

export async function getUserRegion(): Promise<string | null> {
  if (cachedUserRegion) return cachedUserRegion;

  if (!LocationModule) return null;

  try {
    const { status } = await LocationModule.requestForegroundPermissionsAsync();
    if (status !== "granted") return null;

    const position = await LocationModule.getCurrentPositionAsync({
      accuracy: LocationModule.Accuracy.Balanced,
    });

    const reverseGeocode = await LocationModule.reverseGeocodeAsync({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });

    if (reverseGeocode.length > 0) {
      const address = reverseGeocode[0];
      const city = address.city || address.subregion || address.region || "";
      cachedUserRegion = getRegionFromLocation(city);
      return cachedUserRegion;
    }
  } catch {
    return null;
  }

  return null;
}

export function getNearestRegionName(): string {
  return cachedUserRegion ?? "Unknown";
}
