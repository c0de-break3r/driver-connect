import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listVehicles = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("vehicles"),
      _creationTime: v.number(),
      title: v.string(),
      category: v.string(),
      make: v.string(),
      model: v.string(),
      year: v.number(),
      pricePerDay: v.number(),
      city: v.string(),
      rating: v.number(),
      reviewCount: v.number(),
      images: v.array(v.string()),
      status: v.string(),
    })
  ),
  handler: async (ctx) => {
    return await ctx.db
      .query("vehicles")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
  },
});

export const getVehicle = query({
  args: { id: v.id("vehicles") },
  returns: v.union(
    v.object({
      _id: v.id("vehicles"),
      _creationTime: v.number(),
      title: v.string(),
      description: v.optional(v.string()),
      category: v.string(),
      make: v.string(),
      model: v.string(),
      year: v.number(),
      pricePerDay: v.number(),
      pricePerWeek: v.optional(v.number()),
      pricePerMonth: v.optional(v.number()),
      images: v.array(v.string()),
      features: v.array(v.string()),
      seats: v.optional(v.number()),
      transmission: v.optional(v.string()),
      fuelType: v.optional(v.string()),
      hasAc: v.boolean(),
      hasGps: v.boolean(),
      rating: v.number(),
      reviewCount: v.number(),
      ownerId: v.string(),
      city: v.string(),
      region: v.string(),
      status: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createBooking = mutation({
  args: {
    vehicleId: v.id("vehicles"),
    renterId: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    pickupLocation: v.string(),
    dropoffLocation: v.string(),
    subtotal: v.number(),
    driverFee: v.number(),
    serviceFee: v.number(),
    securityDeposit: v.number(),
    totalAmount: v.number(),
    currency: v.string(),
  },
  returns: v.id("bookings"),
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("bookings", {
      vehicleId: args.vehicleId,
      renterId: args.renterId,
      startDate: args.startDate,
      endDate: args.endDate,
      pickupLocation: args.pickupLocation,
      dropoffLocation: args.dropoffLocation,
      status: "pending",
      paymentStatus: "pending",
      subtotal: args.subtotal,
      driverFee: args.driverFee,
      serviceFee: args.serviceFee,
      securityDeposit: args.securityDeposit,
      totalAmount: args.totalAmount,
      currency: args.currency,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateBookingStatus = mutation({
  args: {
    bookingId: v.id("bookings"),
    status: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookingId, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return null;
  },
});
