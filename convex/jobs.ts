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

export const createVehicle = mutation({
  args: {
    ownerId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    make: v.string(),
    model: v.string(),
    year: v.number(),
    color: v.optional(v.string()),
    licensePlate: v.optional(v.string()),
    transmission: v.optional(v.string()),
    fuelType: v.optional(v.string()),
    seats: v.optional(v.number()),
    doors: v.optional(v.number()),
    hasAc: v.boolean(),
    hasGps: v.boolean(),
    features: v.array(v.string()),
    images: v.array(v.string()),
    pricePerDay: v.number(),
    pricePerWeek: v.optional(v.number()),
    pricePerMonth: v.optional(v.number()),
    securityDeposit: v.number(),
    minimumRentDays: v.number(),
    city: v.string(),
    region: v.string(),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
  },
  returns: v.id("vehicles"),
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("vehicles", {
      ownerId: args.ownerId,
      title: args.title,
      description: args.description,
      category: args.category,
      make: args.make,
      model: args.model,
      year: args.year,
      color: args.color,
      licensePlate: args.licensePlate,
      transmission: args.transmission,
      fuelType: args.fuelType,
      seats: args.seats,
      doors: args.doors,
      hasAc: args.hasAc,
      hasGps: args.hasGps,
      features: args.features,
      images: args.images,
      pricePerDay: args.pricePerDay,
      pricePerWeek: args.pricePerWeek,
      pricePerMonth: args.pricePerMonth,
      securityDeposit: args.securityDeposit,
      minimumRentDays: args.minimumRentDays,
      city: args.city,
      region: args.region,
      latitude: args.latitude,
      longitude: args.longitude,
      status: "active",
      isFeatured: false,
      rating: 0,
      reviewCount: 0,
      totalBookings: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateVehicle = mutation({
  args: {
    vehicleId: v.id("vehicles"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    make: v.optional(v.string()),
    model: v.optional(v.string()),
    year: v.optional(v.number()),
    color: v.optional(v.string()),
    licensePlate: v.optional(v.string()),
    transmission: v.optional(v.string()),
    fuelType: v.optional(v.string()),
    seats: v.optional(v.number()),
    doors: v.optional(v.number()),
    hasAc: v.optional(v.boolean()),
    hasGps: v.optional(v.boolean()),
    features: v.optional(v.array(v.string())),
    images: v.optional(v.array(v.string())),
    pricePerDay: v.optional(v.number()),
    pricePerWeek: v.optional(v.number()),
    pricePerMonth: v.optional(v.number()),
    securityDeposit: v.optional(v.number()),
    minimumRentDays: v.optional(v.number()),
    city: v.optional(v.string()),
    region: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    status: v.optional(v.string()),
    isFeatured: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { vehicleId, ...updates } = args;
    const { vehicleId: _, ...patch } = updates as any;
    await ctx.db.patch(vehicleId, {
      ...(updates.title !== undefined && { title: updates.title }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.category !== undefined && { category: updates.category }),
      ...(updates.make !== undefined && { make: updates.make }),
      ...(updates.model !== undefined && { model: updates.model }),
      ...(updates.year !== undefined && { year: updates.year }),
      ...(updates.color !== undefined && { color: updates.color }),
      ...(updates.licensePlate !== undefined && { licensePlate: updates.licensePlate }),
      ...(updates.transmission !== undefined && { transmission: updates.transmission }),
      ...(updates.fuelType !== undefined && { fuelType: updates.fuelType }),
      ...(updates.seats !== undefined && { seats: updates.seats }),
      ...(updates.doors !== undefined && { doors: updates.doors }),
      ...(updates.hasAc !== undefined && { hasAc: updates.hasAc }),
      ...(updates.hasGps !== undefined && { hasGps: updates.hasGps }),
      ...(updates.features !== undefined && { features: updates.features }),
      ...(updates.images !== undefined && { images: updates.images }),
      ...(updates.pricePerDay !== undefined && { pricePerDay: updates.pricePerDay }),
      ...(updates.pricePerWeek !== undefined && { pricePerWeek: updates.pricePerWeek }),
      ...(updates.pricePerMonth !== undefined && { pricePerMonth: updates.pricePerMonth }),
      ...(updates.securityDeposit !== undefined && { securityDeposit: updates.securityDeposit }),
      ...(updates.minimumRentDays !== undefined && { minimumRentDays: updates.minimumRentDays }),
      ...(updates.city !== undefined && { city: updates.city }),
      ...(updates.region !== undefined && { region: updates.region }),
      ...(updates.latitude !== undefined && { latitude: updates.latitude }),
      ...(updates.longitude !== undefined && { longitude: updates.longitude }),
      ...(updates.status !== undefined && { status: updates.status }),
      ...(updates.isFeatured !== undefined && { isFeatured: updates.isFeatured }),
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const deleteVehicle = mutation({
  args: { vehicleId: v.id("vehicles") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.vehicleId);
    return null;
  },
});

export const toggleVehicleStatus = mutation({
  args: {
    vehicleId: v.id("vehicles"),
    status: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.vehicleId, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const getOwnerVehicles = query({
  args: { ownerId: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("vehicles"),
      _creationTime: v.number(),
      title: v.string(),
      description: v.optional(v.string()),
      category: v.string(),
      make: v.string(),
      model: v.string(),
      year: v.number(),
      color: v.optional(v.string()),
      licensePlate: v.optional(v.string()),
      transmission: v.optional(v.string()),
      fuelType: v.optional(v.string()),
      seats: v.optional(v.number()),
      doors: v.optional(v.number()),
      hasAc: v.boolean(),
      hasGps: v.boolean(),
      features: v.array(v.string()),
      images: v.array(v.string()),
      pricePerDay: v.number(),
      pricePerWeek: v.optional(v.number()),
      pricePerMonth: v.optional(v.number()),
      securityDeposit: v.number(),
      minimumRentDays: v.number(),
      city: v.string(),
      region: v.string(),
      latitude: v.optional(v.number()),
      longitude: v.optional(v.number()),
      status: v.string(),
      isFeatured: v.boolean(),
      rating: v.number(),
      reviewCount: v.number(),
      totalBookings: v.number(),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("vehicles")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
      .collect();
  },
});

export const getOwnerBookings = query({
  args: { ownerId: v.string() },
  returns: v.array(
    v.object({
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
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const vehicles = await ctx.db
      .query("vehicles")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
      .collect();

    const vehicleIds = vehicles.map((v) => v._id);
    if (vehicleIds.length === 0) {
      return [];
    }

    const allBookings = await ctx.db.query("bookings").collect();
    return allBookings.filter((b) => vehicleIds.includes(b.vehicleId));
  },
});
