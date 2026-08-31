import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { findUserByActorId, isSameActor } from "./auth";

type DbCtx = QueryCtx | MutationCtx;

export const bookingFieldsValidator = {
  _id: v.id("bookings"),
  _creationTime: v.number(),
  vehicleId: v.id("vehicles"),
  renterId: v.string(),
  driverId: v.optional(v.string()),
  startDate: v.string(),
  endDate: v.string(),
  pickupLocation: v.string(),
  dropoffLocation: v.string(),
  status: v.string(),
  paymentStatus: v.string(),
  subtotal: v.number(),
  driverFee: v.number(),
  serviceFee: v.number(),
  securityDeposit: v.number(),
  totalAmount: v.number(),
  currency: v.string(),
  specialRequests: v.optional(v.string()),
  cancellationReason: v.optional(v.string()),
  cancelledBy: v.optional(v.string()),
  cancelledAt: v.optional(v.number()),
  pickupTime: v.optional(v.string()),
  returnTime: v.optional(v.string()),
  actualPickupTime: v.optional(v.number()),
  actualReturnTime: v.optional(v.number()),
  instantBook: v.boolean(),
  reviewPrompted: v.optional(v.boolean()),
  createdAt: v.number(),
  updatedAt: v.number(),
};

export const bookingDocValidator = v.object(bookingFieldsValidator);

export const bookingVehicleSummaryValidator = v.object({
  _id: v.id("vehicles"),
  title: v.string(),
  images: v.array(v.string()),
  category: v.string(),
  city: v.string(),
  region: v.string(),
  pricePerDay: v.number(),
  rating: v.number(),
  reviewCount: v.number(),
  ownerId: v.string(),
});

export type BookingListItem = {
  _id: Id<"bookings">;
  _creationTime: number;
  vehicleId: Id<"vehicles">;
  renterId: string;
  driverId?: string;
  startDate: string;
  endDate: string;
  pickupLocation: string;
  dropoffLocation: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  driverFee: number;
  serviceFee: number;
  securityDeposit: number;
  totalAmount: number;
  currency: string;
  specialRequests?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: number;
  pickupTime?: string;
  returnTime?: string;
  actualPickupTime?: number;
  actualReturnTime?: number;
  instantBook: boolean;
  reviewPrompted?: boolean;
  createdAt: number;
  updatedAt: number;
};

export type BookingWithVehicle = BookingListItem & {
  vehicle: {
    _id: Id<"vehicles">;
    title: string;
    images: string[];
    category: string;
    city: string;
    region: string;
    pricePerDay: number;
    rating: number;
    reviewCount: number;
    ownerId: string;
  };
};

export function toBookingFields(booking: Doc<"bookings">): BookingListItem {
  return {
    _id: booking._id,
    _creationTime: booking._creationTime,
    vehicleId: booking.vehicleId,
    renterId: booking.renterId,
    driverId: booking.driverId,
    startDate: booking.startDate,
    endDate: booking.endDate,
    pickupLocation: booking.pickupLocation,
    dropoffLocation: booking.dropoffLocation,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    subtotal: booking.subtotal,
    driverFee: booking.driverFee,
    serviceFee: booking.serviceFee,
    securityDeposit: booking.securityDeposit,
    totalAmount: booking.totalAmount,
    currency: booking.currency,
    specialRequests: booking.specialRequests,
    cancellationReason: booking.cancellationReason,
    cancelledBy: booking.cancelledBy,
    cancelledAt: booking.cancelledAt,
    pickupTime: booking.pickupTime,
    returnTime: booking.returnTime,
    actualPickupTime: booking.actualPickupTime,
    actualReturnTime: booking.actualReturnTime,
    instantBook: booking.instantBook,
    reviewPrompted: booking.reviewPrompted,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
  };
}

export async function loadVehicle(
  ctx: DbCtx,
  vehicleId: Id<"vehicles">,
): Promise<Doc<"vehicles">> {
  const vehicle = await ctx.db.get(vehicleId);
  if (!vehicle) {
    throw new Error("Vehicle not found");
  }
  return vehicle;
}

export async function loadBooking(
  ctx: DbCtx,
  bookingId: Id<"bookings">,
): Promise<Doc<"bookings">> {
  const booking = await ctx.db.get(bookingId);
  if (!booking) {
    throw new Error("Booking not found");
  }
  return booking;
}

export function isRenter(user: Doc<"users">, booking: Doc<"bookings">): boolean {
  return isSameActor(user, booking.renterId);
}

export function isAssignedDriver(
  user: Doc<"users">,
  booking: Doc<"bookings">,
): boolean {
  return isSameActor(user, booking.driverId);
}

export function isVehicleOwner(
  user: Doc<"users">,
  vehicle: Doc<"vehicles">,
): boolean {
  return isSameActor(user, vehicle.ownerId);
}

export function canViewBooking(
  user: Doc<"users">,
  booking: Doc<"bookings">,
  vehicle: Doc<"vehicles">,
): boolean {
  return (
    isRenter(user, booking) ||
    isVehicleOwner(user, vehicle) ||
    isAssignedDriver(user, booking)
  );
}

export function assertCanViewBooking(
  user: Doc<"users">,
  booking: Doc<"bookings">,
  vehicle: Doc<"vehicles">,
) {
  if (!canViewBooking(user, booking, vehicle)) {
    throw new Error("Booking not found");
  }
}

export async function listOwnedVehicles(
  ctx: DbCtx,
  user: Doc<"users">,
): Promise<Doc<"vehicles">[]> {
  const byClerk = await ctx.db
    .query("vehicles")
    .withIndex("by_owner", (q) => q.eq("ownerId", user.clerkUserId))
    .take(100);
  const byDocId =
    user._id === user.clerkUserId
      ? []
      : await ctx.db
          .query("vehicles")
          .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
          .take(100);

  const seen = new Set<string>();
  const vehicles: Doc<"vehicles">[] = [];
  for (const vehicle of [...byClerk, ...byDocId]) {
    if (seen.has(vehicle._id)) {
      continue;
    }
    seen.add(vehicle._id);
    vehicles.push(vehicle);
  }
  return vehicles;
}

export async function listRenterBookings(
  ctx: DbCtx,
  user: Doc<"users">,
): Promise<Doc<"bookings">[]> {
  const byClerk = await ctx.db
    .query("bookings")
    .withIndex("by_renter", (q) => q.eq("renterId", user.clerkUserId))
    .take(100);
  const byDocId =
    user._id === user.clerkUserId
      ? []
      : await ctx.db
          .query("bookings")
          .withIndex("by_renter", (q) => q.eq("renterId", user._id))
          .take(100);
  return dedupeBookings([...byClerk, ...byDocId]);
}

export async function listDriverBookings(
  ctx: DbCtx,
  user: Doc<"users">,
): Promise<Doc<"bookings">[]> {
  const byClerk = await ctx.db
    .query("bookings")
    .withIndex("by_driver", (q) => q.eq("driverId", user.clerkUserId))
    .take(100);
  const byDocId =
    user._id === user.clerkUserId
      ? []
      : await ctx.db
          .query("bookings")
          .withIndex("by_driver", (q) => q.eq("driverId", user._id))
          .take(100);
  return dedupeBookings([...byClerk, ...byDocId]);
}

function dedupeBookings(bookings: Doc<"bookings">[]): Doc<"bookings">[] {
  const seen = new Set<string>();
  const unique: Doc<"bookings">[] = [];
  for (const booking of bookings) {
    if (seen.has(booking._id)) {
      continue;
    }
    seen.add(booking._id);
    unique.push(booking);
  }
  return unique;
}

export async function attachVehicleSummaries(
  ctx: DbCtx,
  bookings: Doc<"bookings">[],
): Promise<BookingWithVehicle[]> {
  const withVehicles = await Promise.all(
    bookings.map(async (booking) => {
      const vehicle = await ctx.db.get(booking.vehicleId);
      if (!vehicle) {
        return null;
      }
      return {
        ...toBookingFields(booking),
        vehicle: {
          _id: vehicle._id,
          title: vehicle.title,
          images: vehicle.images,
          category: vehicle.category,
          city: vehicle.city,
          region: vehicle.region,
          pricePerDay: vehicle.pricePerDay,
          rating: vehicle.rating,
          reviewCount: vehicle.reviewCount,
          ownerId: vehicle.ownerId,
        },
      };
    }),
  );

  return withVehicles.filter((row): row is BookingWithVehicle => row !== null);
}

export async function hasDateConflict(
  ctx: DbCtx,
  vehicleId: Id<"vehicles">,
  startDate: string,
  endDate: string,
  excludeBookingId?: Id<"bookings">,
): Promise<boolean> {
  const blocks = await ctx.db
    .query("availabilityBlocks")
    .withIndex("by_vehicle", (q) => q.eq("vehicleId", vehicleId))
    .take(200);

  const blocked = blocks.some(
    (block) => block.startDate <= endDate && block.endDate >= startDate,
  );
  if (blocked) {
    return true;
  }

  const bookings = await ctx.db
    .query("bookings")
    .withIndex("by_vehicle", (q) => q.eq("vehicleId", vehicleId))
    .take(200);

  return bookings.some(
    (booking) =>
      booking._id !== excludeBookingId &&
      (booking.status === "confirmed" || booking.status === "pending") &&
      booking.startDate <= endDate &&
      booking.endDate >= startDate,
  );
}

export function assertRenterRole(user: Doc<"users">) {
  switch (user.role) {
    case "client":
    case "corporate":
      return;
    case "driver":
    case "owner":
      throw new Error("Only clients and corporate accounts can create bookings");
    default: {
      const exhaustive: never = user.role;
      throw new Error(`Unhandled role: ${exhaustive}`);
    }
  }
}

export function bookingIncludesDriver(
  args: { driverId?: string; driverFee: number; includeDriver?: boolean },
  vehicle: Doc<"vehicles">,
): boolean {
  return (
    Boolean(args.driverId) ||
    args.includeDriver === true ||
    args.driverFee > 0 ||
    vehicle.driverIncluded === true
  );
}

export async function resolveBookingDriverId(
  ctx: DbCtx,
  args: { driverId?: string; driverFee: number; includeDriver?: boolean },
  vehicle: Doc<"vehicles">,
  renterClerkUserId: string,
): Promise<string | undefined> {
  if (!bookingIncludesDriver(args, vehicle)) {
    return undefined;
  }

  if (args.driverId) {
    const driver = await findUserByActorId(ctx, args.driverId);
    if (!driver || driver.role !== "driver") {
      throw new Error("Driver not found");
    }
    if (driver.clerkUserId === renterClerkUserId) {
      throw new Error("You cannot assign yourself as the driver");
    }
    return driver.clerkUserId;
  }

  const assigned = await pickAvailableDriver(ctx, renterClerkUserId);
  if (!assigned) {
    throw new Error("No driver available for this booking");
  }
  return assigned;
}

async function pickAvailableDriver(
  ctx: DbCtx,
  excludeClerkUserId: string,
): Promise<string | undefined> {
  const drivers = await ctx.db
    .query("users")
    .withIndex("by_role", (q) => q.eq("role", "driver"))
    .take(50);

  const candidates = drivers.filter(
    (driver) => driver.clerkUserId !== excludeClerkUserId,
  );
  if (candidates.length === 0) {
    return undefined;
  }

  let fallback: string | undefined;
  for (const driver of candidates) {
    if (!fallback) {
      fallback = driver.clerkUserId;
    }
    const byDoc = await ctx.db
      .query("driverProfiles")
      .withIndex("by_user", (q) => q.eq("userId", driver._id))
      .unique();
    const byClerk =
      byDoc ??
      (await ctx.db
        .query("driverProfiles")
        .withIndex("by_user", (q) => q.eq("userId", driver.clerkUserId))
        .unique());
    if (byClerk?.availableForHire) {
      return driver.clerkUserId;
    }
  }

  return fallback;
}
