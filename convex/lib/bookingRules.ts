import { ConvexError } from "convex/values";
export type BookingService =
  "self_drive" | "with_driver" | "airport_pickup" | "airport_dropoff";
export const DAY_MS = 86_400_000;

export function parseDate(value: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
    throw new ConvexError("Use dates in YYYY-MM-DD format.");
  const result = Date.parse(`${value}T00:00:00Z`);
  if (
    !Number.isFinite(result) ||
    new Date(result).toISOString().slice(0, 10) !== value
  ) {
    throw new ConvexError("Enter a valid calendar date.");
  }
  return result;
}

// Date-only reservations block the pickup and return days, matching owner calendars.
export function overlaps(
  start: string,
  end: string,
  otherStart: string,
  otherEnd: string,
) {
  return (
    parseDate(start) <= parseDate(otherEnd) &&
    parseDate(end) >= parseDate(otherStart)
  );
}

export function validateDates(start: string, end: string, now = Date.now()) {
  const from = parseDate(start);
  const to = parseDate(end);
  if (from < Math.floor(now / DAY_MS) * DAY_MS)
    throw new ConvexError("Pickup cannot be in the past.");
  if (to <= from)
    throw new ConvexError("Return date must be after pickup date.");
  return (to - from) / DAY_MS;
}

export function calculatePrice(
  vehicle: {
    pricePerDay: number;
    securityDeposit: number;
    minimumRentDays: number;
    minTripDuration?: number;
    maxTripDuration?: number;
    driverIncluded?: boolean;
    driverRate?: number;
  },
  days: number,
  service: BookingService,
) {
  const minimum = Math.max(
    1,
    vehicle.minimumRentDays,
    vehicle.minTripDuration ?? 1,
  );
  if (days < minimum)
    throw new ConvexError(
      `This vehicle requires at least ${minimum} rental days.`,
    );
  if (vehicle.maxTripDuration && days > vehicle.maxTripDuration)
    throw new ConvexError("Trip exceeds this vehicle's maximum duration.");
  if (service === "self_drive" && vehicle.driverIncluded)
    throw new ConvexError("This vehicle is only offered with a driver.");
  const needsDriver = service !== "self_drive";
  if (
    needsDriver &&
    !vehicle.driverIncluded &&
    !(vehicle.driverRate && vehicle.driverRate > 0)
  ) {
    throw new ConvexError("This vehicle does not offer a driver.");
  }
  const amounts = [
    vehicle.pricePerDay,
    vehicle.securityDeposit,
    vehicle.driverRate ?? 0,
  ];
  if (
    amounts.some((n) => !Number.isFinite(n) || n < 0) ||
    vehicle.pricePerDay <= 0
  ) {
    throw new ConvexError("The owner needs to update this vehicle's pricing.");
  }
  // Integer pesewas internally. Preserve the application's existing 5% rental service fee.
  const subtotalMinor = Math.round(vehicle.pricePerDay * 100) * days;
  const driverMinor =
    needsDriver && !vehicle.driverIncluded
      ? Math.round((vehicle.driverRate ?? 0) * 100) * days
      : 0;
  const feeMinor = Math.round(subtotalMinor * 0.05);
  const depositMinor = Math.round(vehicle.securityDeposit * 100);
  return {
    subtotal: subtotalMinor / 100,
    driverFee: driverMinor / 100,
    serviceFee: feeMinor / 100,
    securityDeposit: depositMinor / 100,
    totalAmount: (subtotalMinor + driverMinor + feeMinor + depositMinor) / 100,
    currency: "GHS",
    days,
  };
}

export function assertTransition(
  current: string,
  next: string,
  role: "renter" | "owner" | "driver",
  paid: boolean,
) {
  const allowed: Record<string, string[]> = {
    pending:
      role === "owner"
        ? ["accepted", "rejected", "cancelled"]
        : role === "renter"
          ? ["cancelled"]
          : [],
    accepted:
      role === "owner"
        ? ["confirmed", "cancelled"]
        : role === "renter"
          ? ["cancelled"]
          : [],
    confirmed: role === "renter" ? ["cancelled"] : ["active", "cancelled"],
    active: role === "renter" ? [] : ["completed"],
  };
  if (next === "cancelled" && paid)
    throw new ConvexError(
      "Contact support to cancel a paid booking and arrange a refund.",
    );
  if (!allowed[current]?.includes(next))
    throw new ConvexError("This booking status change is not allowed.");
  if ((next === "confirmed" || next === "active") && !paid)
    throw new ConvexError("Verified payment is required before confirmation.");
}
