export const VEHICLE_CATEGORIES = [
  "sedan",
  "suv",
  "van",
  "bus",
  "truck",
  "luxury",
  "sport",
  "hatchback",
  "pickup",
  "motorcycle",
] as const;

export const TRANSMISSION_TYPES = ["automatic", "manual"] as const;

export const FUEL_TYPES = ["petrol", "diesel", "hybrid", "electric", "gas"] as const;

export const OCCASION_TYPES = [
  "airport",
  "wedding",
  "event",
  "corporate",
  "daily_commute",
  "family",
  "long_distance",
  "rental",
  "chauffeur",
] as const;

export const COLORS = {
  primary: "#2C3E5B",
  secondary: "#6B7280",
  success: "#059669",
  warning: "#D97706",
  error: "#DC2626",
  background: "#FFFFFF",
  surface: "#F9FAFB",
  border: "#E5E7EB",
} as const;

export const DEFAULT_CURRENCY = "GHS";

export const DEFAULT_TIMEZONE = "Africa/Accra";
