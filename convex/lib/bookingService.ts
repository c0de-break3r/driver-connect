import { ConvexError } from "convex/values";
import type { QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import {
  calculatePrice,
  overlaps,
  validateDates,
  type BookingService,
} from "./bookingRules";

export async function requireUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new ConvexError("Please sign in to continue.");
  const user = await ctx.db
    .query("users")
    .withIndex("by_user_id", (q) => q.eq("clerkUserId", identity.subject))
    .unique();
  if (!user) throw new ConvexError("Please finish setting up your account.");
  return user;
}

export async function requireOwner(ctx: QueryCtx, vehicleId: Id<"vehicles">) {
  const user = await requireUser(ctx);
  const vehicle = await ctx.db.get(vehicleId);
  if (!vehicle || vehicle.ownerId !== user._id)
    throw new ConvexError("Only the vehicle owner can do this.");
  return { user, vehicle };
}

export async function requireBookingMember(
  ctx: QueryCtx,
  bookingId: Id<"bookings">,
) {
  const user = await requireUser(ctx);
  const booking = await ctx.db.get(bookingId);
  if (!booking) throw new ConvexError("Booking not found.");
  const vehicle = await ctx.db.get(booking.vehicleId);
  const role: "renter" | "owner" | "driver" | null =
    booking.renterId === user._id
      ? "renter"
      : vehicle?.ownerId === user._id
        ? "owner"
        : booking.driverId === user._id
          ? "driver"
          : null;
  if (!role) throw new ConvexError("You cannot access this booking.");
  return { user, booking, vehicle, role };
}

export async function isAvailable(
  ctx: QueryCtx,
  vehicleId: Id<"vehicles">,
  start: string,
  end: string,
  excludeId?: Id<"bookings">,
) {
  const blocks = await ctx.db
    .query("availabilityBlocks")
    .withIndex("by_vehicle", (q) => q.eq("vehicleId", vehicleId))
    .collect();
  if (blocks.some((b) => overlaps(start, end, b.startDate, b.endDate)))
    return false;
  const bookings = await ctx.db
    .query("bookings")
    .withIndex("by_vehicle", (q) => q.eq("vehicleId", vehicleId))
    .collect();
  return !bookings.some(
    (b) =>
      (!excludeId || b._id !== excludeId) &&
      ["pending", "accepted", "confirmed", "active"].includes(b.status) &&
      overlaps(start, end, b.startDate, b.endDate),
  );
}

export async function quoteBooking(
  ctx: QueryCtx,
  args: {
    vehicleId: Id<"vehicles">;
    startDate: string;
    endDate: string;
    serviceType: BookingService;
    pickupTime?: string;
    returnTime?: string;
  },
) {
  validateDates(args.startDate, args.endDate);
  const vehicle = await ctx.db.get(args.vehicleId);
  if (!vehicle || vehicle.status !== "active")
    throw new ConvexError("This vehicle is not available for booking.");
  if (
    vehicle.serviceType &&
    !["rental", "chauffeur"].includes(vehicle.serviceType)
  )
    throw new ConvexError("This listing is not offered for rental.");
  const pickup = Date.parse(
    `${args.startDate}T${args.pickupTime ?? "00:00"}:00Z`,
  );
  if (
    !Number.isFinite(pickup) ||
    pickup < Date.now() + (vehicle.advanceNotice ?? 0) * 3_600_000
  )
    throw new ConvexError(
      "Choose a later pickup to meet the owner's advance notice.",
    );
  const end = Date.parse(
    `${args.endDate}T${args.returnTime ?? args.pickupTime ?? "00:00"}:00Z`,
  );
  if (!Number.isFinite(end) || end <= pickup)
    throw new ConvexError("Choose a valid return time after pickup.");
  const days = Math.ceil((end - pickup) / 86_400_000);
  const price = calculatePrice(vehicle, days, args.serviceType);
  if (!(await isAvailable(ctx, args.vehicleId, args.startDate, args.endDate)))
    throw new ConvexError(
      "This vehicle is unavailable on those dates. Choose another vehicle or dates.",
    );
  return { vehicle, price };
}
