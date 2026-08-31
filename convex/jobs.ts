import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertCallerId, findUserByActorId, requireAppUser } from "./model/auth";
import {
  assertCanViewBooking,
  assertRenterRole,
  attachVehicleSummaries,
  bookingDocValidator,
  bookingFieldsValidator,
  bookingVehicleSummaryValidator,
  hasDateConflict,
  isAssignedDriver,
  isRenter,
  isVehicleOwner,
  listDriverBookings,
  listOwnedVehicles,
  listRenterBookings,
  loadBooking,
  loadVehicle,
  toBookingFields,
} from "./model/bookings";

export const listVehicles = query({
  args: {},
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
    hasBluetooth: v.optional(v.boolean()),
    hasBackupCamera: v.optional(v.boolean()),
    hasUsbPort: v.optional(v.boolean()),
    hasSunroof: v.optional(v.boolean()),
    hasHeatedSeats: v.optional(v.boolean()),
    hasLeatherSeats: v.optional(v.boolean()),
    hasChildSeat: v.optional(v.boolean()),
    hasPetFriendly: v.optional(v.boolean()),
    hasSkiRack: v.optional(v.boolean()),
    hasBikeRack: v.optional(v.boolean()),
    hasSnowTires: v.optional(v.boolean()),
    hasRoofBox: v.optional(v.boolean()),
    hasTowHitch: v.optional(v.boolean()),
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
      ownerId: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
      serviceType: v.optional(v.string()),
      mileage: v.optional(v.number()),
      vin: v.optional(v.string()),
      bodyStyle: v.optional(v.string()),
      driveType: v.optional(v.string()),
      condition: v.optional(v.string()),
      negotiable: v.optional(v.boolean()),
      inspectionReport: v.optional(v.string()),
      downPaymentPercent: v.optional(v.number()),
      termMonths: v.optional(v.number()),
      totalPayable: v.optional(v.number()),
      earlyBuyout: v.optional(v.boolean()),
      driverIncluded: v.optional(v.boolean()),
      driverRate: v.optional(v.number()),
      occasionType: v.optional(v.string()),
      packageInclusions: v.optional(v.string()),
      fleetSize: v.optional(v.number()),
      contractTerms: v.optional(v.string()),
      showPreciseLocation: v.optional(v.boolean()),
      deliveryAvailable: v.optional(v.boolean()),
      deliveryFee: v.optional(v.number()),
      instantBook: v.boolean(),
      advanceNotice: v.optional(v.number()),
      minTripDuration: v.optional(v.number()),
      maxTripDuration: v.optional(v.number()),
      distanceLimit: v.optional(v.number()),
      unlimitedDistance: v.boolean(),
      pickupStartHour: v.optional(v.number()),
      pickupEndHour: v.optional(v.number()),
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
      hasBluetooth: v.optional(v.boolean()),
      hasBackupCamera: v.optional(v.boolean()),
      hasUsbPort: v.optional(v.boolean()),
      hasSunroof: v.optional(v.boolean()),
      hasHeatedSeats: v.optional(v.boolean()),
      hasLeatherSeats: v.optional(v.boolean()),
      hasChildSeat: v.optional(v.boolean()),
      hasPetFriendly: v.optional(v.boolean()),
      hasSkiRack: v.optional(v.boolean()),
      hasBikeRack: v.optional(v.boolean()),
      hasSnowTires: v.optional(v.boolean()),
      hasRoofBox: v.optional(v.boolean()),
      hasTowHitch: v.optional(v.boolean()),
      rating: v.number(),
      reviewCount: v.number(),
      ownerId: v.string(),
      city: v.string(),
      region: v.string(),
      status: v.string(),
      serviceType: v.optional(v.string()),
      mileage: v.optional(v.number()),
      vin: v.optional(v.string()),
      bodyStyle: v.optional(v.string()),
      driveType: v.optional(v.string()),
      condition: v.optional(v.string()),
      negotiable: v.optional(v.boolean()),
      inspectionReport: v.optional(v.string()),
      downPaymentPercent: v.optional(v.number()),
      termMonths: v.optional(v.number()),
      totalPayable: v.optional(v.number()),
      earlyBuyout: v.optional(v.boolean()),
      driverIncluded: v.optional(v.boolean()),
      driverRate: v.optional(v.number()),
      occasionType: v.optional(v.string()),
      packageInclusions: v.optional(v.string()),
      fleetSize: v.optional(v.number()),
      contractTerms: v.optional(v.string()),
      showPreciseLocation: v.optional(v.boolean()),
      deliveryAvailable: v.optional(v.boolean()),
      deliveryFee: v.optional(v.number()),
      instantBook: v.boolean(),
      advanceNotice: v.optional(v.number()),
      minTripDuration: v.optional(v.number()),
      maxTripDuration: v.optional(v.number()),
      distanceLimit: v.optional(v.number()),
      unlimitedDistance: v.boolean(),
      pickupStartHour: v.optional(v.number()),
      pickupEndHour: v.optional(v.number()),
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
    instantBook: v.optional(v.boolean()),
  },
  returns: v.id("bookings"),
  handler: async (ctx, args) => {
    const user = await requireAppUser(ctx);
    assertRenterRole(user);

    const vehicle = await loadVehicle(ctx, args.vehicleId);
    if (vehicle.status !== "active") {
      throw new Error("Vehicle is not available for booking");
    }
    if (isVehicleOwner(user, vehicle)) {
      throw new Error("You cannot book your own vehicle");
    }
    if (args.startDate > args.endDate) {
      throw new Error("Return date must be on or after pickup date");
    }
    if (await hasDateConflict(ctx, args.vehicleId, args.startDate, args.endDate)) {
      throw new Error("Vehicle is not available for these dates");
    }

    const now = Date.now();
    return await ctx.db.insert("bookings", {
      vehicleId: args.vehicleId,
      renterId: user.clerkUserId,
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
      instantBook: vehicle.instantBook,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const confirmPayment = mutation({
  args: {
    bookingId: v.id("bookings"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireAppUser(ctx);
    const booking = await loadBooking(ctx, args.bookingId);
    if (!isRenter(user, booking)) {
      throw new Error("Only the renter can record payment for this booking");
    }
    if (booking.status === "cancelled" || booking.status === "completed") {
      throw new Error("This booking can no longer be paid");
    }
    if (booking.status !== "pending") {
      throw new Error("Only pending bookings can be paid");
    }
    if (booking.paymentStatus === "paid") {
      throw new Error("Payment has already been recorded");
    }

    const now = Date.now();
    await ctx.db.patch(args.bookingId, {
      paymentStatus: "paid",
      status: booking.instantBook ? "confirmed" : "pending",
      updatedAt: now,
    });
    return null;
  },
});

export const acceptBooking = mutation({
  args: {
    bookingId: v.id("bookings"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireAppUser(ctx);
    const booking = await loadBooking(ctx, args.bookingId);
    const vehicle = await loadVehicle(ctx, booking.vehicleId);
    if (!isVehicleOwner(user, vehicle)) {
      throw new Error("Only the vehicle owner can accept this booking");
    }
    if (booking.instantBook) {
      throw new Error("Instant-book listings do not require owner acceptance");
    }
    if (booking.status !== "pending") {
      throw new Error("Only pending bookings can be accepted");
    }
    if (booking.paymentStatus !== "paid") {
      throw new Error("Booking cannot be accepted until payment is recorded");
    }

    await ctx.db.patch(args.bookingId, {
      status: "confirmed",
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const declineBooking = mutation({
  args: {
    bookingId: v.id("bookings"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireAppUser(ctx);
    const booking = await loadBooking(ctx, args.bookingId);
    const vehicle = await loadVehicle(ctx, booking.vehicleId);
    if (!isVehicleOwner(user, vehicle)) {
      throw new Error("Only the vehicle owner can decline this booking");
    }
    if (booking.instantBook) {
      throw new Error("Instant-book listings do not require owner decline");
    }
    if (booking.status !== "pending") {
      throw new Error("Only pending bookings can be declined");
    }

    const now = Date.now();
    await ctx.db.patch(args.bookingId, {
      status: "cancelled",
      cancelledBy: user.clerkUserId,
      cancelledAt: now,
      updatedAt: now,
    });
    return null;
  },
});

export const attachDriver = mutation({
  args: {
    bookingId: v.id("bookings"),
    driverUserId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireAppUser(ctx);
    const booking = await loadBooking(ctx, args.bookingId);
    const vehicle = await loadVehicle(ctx, booking.vehicleId);
    if (!isRenter(user, booking) && !isVehicleOwner(user, vehicle)) {
      throw new Error("Only the renter or vehicle owner can attach a driver");
    }
    if (booking.status !== "pending" && booking.status !== "confirmed") {
      throw new Error("A driver can only be attached to an active booking");
    }

    const driver = await findUserByActorId(ctx, args.driverUserId);
    if (!driver || driver.role !== "driver") {
      throw new Error("Driver not found");
    }

    await ctx.db.patch(args.bookingId, {
      driverId: driver.clerkUserId,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const completeBooking = mutation({
  args: {
    bookingId: v.id("bookings"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireAppUser(ctx);
    const booking = await loadBooking(ctx, args.bookingId);
    const vehicle = await loadVehicle(ctx, booking.vehicleId);

    if (isAssignedDriver(user, booking) && !isRenter(user, booking) && !isVehicleOwner(user, vehicle)) {
      throw new Error("Drivers cannot complete someone else's trip");
    }
    if (!isRenter(user, booking) && !isVehicleOwner(user, vehicle)) {
      throw new Error("Only the renter or vehicle owner can complete this booking");
    }
    if (booking.status !== "confirmed") {
      throw new Error("Only confirmed bookings can be completed");
    }

    const now = Date.now();
    await ctx.db.patch(args.bookingId, {
      status: "completed",
      paymentStatus: "paid",
      reviewPrompted: true,
      actualReturnTime: now,
      updatedAt: now,
    });
    return null;
  },
});

export const createReview = mutation({
  args: {
    bookingId: v.id("bookings"),
    reviewerId: v.string(),
    revieweeId: v.string(),
    vehicleId: v.optional(v.id("vehicles")),
    rating: v.number(),
    comment: v.optional(v.string()),
    categories: v.optional(v.any()),
  },
  returns: v.id("reviews"),
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("reviews", {
      bookingId: args.bookingId,
      reviewerId: args.reviewerId,
      revieweeId: args.revieweeId,
      vehicleId: args.vehicleId,
      rating: args.rating,
      comment: args.comment,
      categories: args.categories,
      isPublic: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getVehicleReviews = query({
  args: { vehicleId: v.id("vehicles") },
  returns: v.array(
    v.object({
      _id: v.id("reviews"),
      _creationTime: v.number(),
      bookingId: v.id("bookings"),
      reviewerId: v.string(),
      revieweeId: v.string(),
      vehicleId: v.optional(v.id("vehicles")),
      rating: v.number(),
      comment: v.optional(v.string()),
      categories: v.optional(v.any()),
      isPublic: v.boolean(),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reviews")
      .withIndex("by_vehicle", (q) => q.eq("vehicleId", args.vehicleId))
      .collect();
  },
});

export const getDriverReviews = query({
  args: { driverId: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("reviews"),
      _creationTime: v.number(),
      bookingId: v.id("bookings"),
      reviewerId: v.string(),
      revieweeId: v.string(),
      vehicleId: v.optional(v.id("vehicles")),
      rating: v.number(),
      comment: v.optional(v.string()),
      categories: v.optional(v.any()),
      isPublic: v.boolean(),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reviews")
      .withIndex("by_reviewee", (q) => q.eq("revieweeId", args.driverId))
      .collect();
  },
});

export const getOwnerReviews = query({
  args: { ownerId: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("reviews"),
      _creationTime: v.number(),
      bookingId: v.id("bookings"),
      reviewerId: v.string(),
      revieweeId: v.string(),
      vehicleId: v.optional(v.id("vehicles")),
      rating: v.number(),
      comment: v.optional(v.string()),
      categories: v.optional(v.any()),
      isPublic: v.boolean(),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reviews")
      .withIndex("by_reviewee", (q) => q.eq("revieweeId", args.ownerId))
      .collect();
  },
});

export const markReviewPrompted = mutation({
  args: { bookingId: v.id("bookings") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookingId, {
      reviewPrompted: true,
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
    hasBluetooth: v.optional(v.boolean()),
    hasBackupCamera: v.optional(v.boolean()),
    hasUsbPort: v.optional(v.boolean()),
    hasSunroof: v.optional(v.boolean()),
    hasHeatedSeats: v.optional(v.boolean()),
    hasLeatherSeats: v.optional(v.boolean()),
    hasChildSeat: v.optional(v.boolean()),
    hasPetFriendly: v.optional(v.boolean()),
    hasSkiRack: v.optional(v.boolean()),
    hasBikeRack: v.optional(v.boolean()),
    hasSnowTires: v.optional(v.boolean()),
    hasRoofBox: v.optional(v.boolean()),
    hasTowHitch: v.optional(v.boolean()),
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
    serviceType: v.optional(v.string()),
    mileage: v.optional(v.number()),
    vin: v.optional(v.string()),
    bodyStyle: v.optional(v.string()),
    driveType: v.optional(v.string()),
    condition: v.optional(v.string()),
    negotiable: v.optional(v.boolean()),
    inspectionReport: v.optional(v.string()),
    downPaymentPercent: v.optional(v.number()),
    termMonths: v.optional(v.number()),
    totalPayable: v.optional(v.number()),
    earlyBuyout: v.optional(v.boolean()),
    driverIncluded: v.optional(v.boolean()),
    driverRate: v.optional(v.number()),
    occasionType: v.optional(v.string()),
    packageInclusions: v.optional(v.string()),
    fleetSize: v.optional(v.number()),
    contractTerms: v.optional(v.string()),
    showPreciseLocation: v.optional(v.boolean()),
    deliveryAvailable: v.optional(v.boolean()),
    deliveryFee: v.optional(v.number()),
    instantBook: v.optional(v.boolean()),
    advanceNotice: v.optional(v.number()),
    unlimitedDistance: v.optional(v.boolean()),
    status: v.optional(v.string()),
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
      serviceType: args.serviceType,
      mileage: args.mileage,
      vin: args.vin,
      bodyStyle: args.bodyStyle,
      driveType: args.driveType,
      condition: args.condition,
      negotiable: args.negotiable,
      inspectionReport: args.inspectionReport,
      downPaymentPercent: args.downPaymentPercent,
      termMonths: args.termMonths,
      totalPayable: args.totalPayable,
      earlyBuyout: args.earlyBuyout,
      driverIncluded: args.driverIncluded,
      driverRate: args.driverRate,
      occasionType: args.occasionType,
      packageInclusions: args.packageInclusions,
      fleetSize: args.fleetSize,
      contractTerms: args.contractTerms,
      showPreciseLocation: args.showPreciseLocation,
      deliveryAvailable: args.deliveryAvailable,
      deliveryFee: args.deliveryFee,
      status: args.status ?? "active",
      isFeatured: false,
      rating: 0,
      reviewCount: 0,
      totalBookings: 0,
      instantBook: args.instantBook ?? false,
      advanceNotice: args.advanceNotice ?? 24,
      unlimitedDistance: args.unlimitedDistance ?? false,
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
    hasBluetooth: v.optional(v.boolean()),
    hasBackupCamera: v.optional(v.boolean()),
    hasUsbPort: v.optional(v.boolean()),
    hasSunroof: v.optional(v.boolean()),
    hasHeatedSeats: v.optional(v.boolean()),
    hasLeatherSeats: v.optional(v.boolean()),
    hasChildSeat: v.optional(v.boolean()),
    hasPetFriendly: v.optional(v.boolean()),
    hasSkiRack: v.optional(v.boolean()),
    hasBikeRack: v.optional(v.boolean()),
    hasSnowTires: v.optional(v.boolean()),
    hasRoofBox: v.optional(v.boolean()),
    hasTowHitch: v.optional(v.boolean()),
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
    serviceType: v.optional(v.string()),
    mileage: v.optional(v.number()),
    vin: v.optional(v.string()),
    bodyStyle: v.optional(v.string()),
    driveType: v.optional(v.string()),
    condition: v.optional(v.string()),
    negotiable: v.optional(v.boolean()),
    inspectionReport: v.optional(v.string()),
    downPaymentPercent: v.optional(v.number()),
    termMonths: v.optional(v.number()),
    totalPayable: v.optional(v.number()),
    earlyBuyout: v.optional(v.boolean()),
    driverIncluded: v.optional(v.boolean()),
    driverRate: v.optional(v.number()),
    occasionType: v.optional(v.string()),
    packageInclusions: v.optional(v.string()),
    fleetSize: v.optional(v.number()),
    contractTerms: v.optional(v.string()),
    showPreciseLocation: v.optional(v.boolean()),
    deliveryAvailable: v.optional(v.boolean()),
    deliveryFee: v.optional(v.number()),
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
      ...(updates.hasBluetooth !== undefined && { hasBluetooth: updates.hasBluetooth }),
      ...(updates.hasBackupCamera !== undefined && { hasBackupCamera: updates.hasBackupCamera }),
      ...(updates.hasUsbPort !== undefined && { hasUsbPort: updates.hasUsbPort }),
      ...(updates.hasSunroof !== undefined && { hasSunroof: updates.hasSunroof }),
      ...(updates.hasHeatedSeats !== undefined && { hasHeatedSeats: updates.hasHeatedSeats }),
      ...(updates.hasLeatherSeats !== undefined && { hasLeatherSeats: updates.hasLeatherSeats }),
      ...(updates.hasChildSeat !== undefined && { hasChildSeat: updates.hasChildSeat }),
      ...(updates.hasPetFriendly !== undefined && { hasPetFriendly: updates.hasPetFriendly }),
      ...(updates.hasSkiRack !== undefined && { hasSkiRack: updates.hasSkiRack }),
      ...(updates.hasBikeRack !== undefined && { hasBikeRack: updates.hasBikeRack }),
      ...(updates.hasSnowTires !== undefined && { hasSnowTires: updates.hasSnowTires }),
      ...(updates.hasRoofBox !== undefined && { hasRoofBox: updates.hasRoofBox }),
      ...(updates.hasTowHitch !== undefined && { hasTowHitch: updates.hasTowHitch }),
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
      ...(updates.serviceType !== undefined && { serviceType: updates.serviceType }),
      ...(updates.mileage !== undefined && { mileage: updates.mileage }),
      ...(updates.vin !== undefined && { vin: updates.vin }),
      ...(updates.bodyStyle !== undefined && { bodyStyle: updates.bodyStyle }),
      ...(updates.driveType !== undefined && { driveType: updates.driveType }),
      ...(updates.condition !== undefined && { condition: updates.condition }),
      ...(updates.negotiable !== undefined && { negotiable: updates.negotiable }),
      ...(updates.inspectionReport !== undefined && { inspectionReport: updates.inspectionReport }),
      ...(updates.downPaymentPercent !== undefined && { downPaymentPercent: updates.downPaymentPercent }),
      ...(updates.termMonths !== undefined && { termMonths: updates.termMonths }),
      ...(updates.totalPayable !== undefined && { totalPayable: updates.totalPayable }),
      ...(updates.earlyBuyout !== undefined && { earlyBuyout: updates.earlyBuyout }),
      ...(updates.driverIncluded !== undefined && { driverIncluded: updates.driverIncluded }),
      ...(updates.driverRate !== undefined && { driverRate: updates.driverRate }),
      ...(updates.occasionType !== undefined && { occasionType: updates.occasionType }),
      ...(updates.packageInclusions !== undefined && { packageInclusions: updates.packageInclusions }),
      ...(updates.fleetSize !== undefined && { fleetSize: updates.fleetSize }),
      ...(updates.contractTerms !== undefined && { contractTerms: updates.contractTerms }),
      ...(updates.showPreciseLocation !== undefined && { showPreciseLocation: updates.showPreciseLocation }),
      ...(updates.deliveryAvailable !== undefined && { deliveryAvailable: updates.deliveryAvailable }),
      ...(updates.deliveryFee !== undefined && { deliveryFee: updates.deliveryFee }),
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
      ownerId: v.string(),
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
      hasBluetooth: v.optional(v.boolean()),
      hasBackupCamera: v.optional(v.boolean()),
      hasUsbPort: v.optional(v.boolean()),
      hasSunroof: v.optional(v.boolean()),
      hasHeatedSeats: v.optional(v.boolean()),
      hasLeatherSeats: v.optional(v.boolean()),
      hasChildSeat: v.optional(v.boolean()),
      hasPetFriendly: v.optional(v.boolean()),
      hasSkiRack: v.optional(v.boolean()),
      hasBikeRack: v.optional(v.boolean()),
      hasSnowTires: v.optional(v.boolean()),
      hasRoofBox: v.optional(v.boolean()),
      hasTowHitch: v.optional(v.boolean()),
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
      serviceType: v.optional(v.string()),
      mileage: v.optional(v.number()),
      vin: v.optional(v.string()),
      bodyStyle: v.optional(v.string()),
      driveType: v.optional(v.string()),
      condition: v.optional(v.string()),
      negotiable: v.optional(v.boolean()),
      inspectionReport: v.optional(v.string()),
      downPaymentPercent: v.optional(v.number()),
      termMonths: v.optional(v.number()),
      totalPayable: v.optional(v.number()),
      earlyBuyout: v.optional(v.boolean()),
      driverIncluded: v.optional(v.boolean()),
      driverRate: v.optional(v.number()),
      occasionType: v.optional(v.string()),
      packageInclusions: v.optional(v.string()),
      fleetSize: v.optional(v.number()),
      contractTerms: v.optional(v.string()),
      showPreciseLocation: v.optional(v.boolean()),
      deliveryAvailable: v.optional(v.boolean()),
      deliveryFee: v.optional(v.number()),
      instantBook: v.boolean(),
      advanceNotice: v.optional(v.number()),
      minTripDuration: v.optional(v.number()),
      maxTripDuration: v.optional(v.number()),
      distanceLimit: v.optional(v.number()),
      unlimitedDistance: v.boolean(),
      pickupStartHour: v.optional(v.number()),
      pickupEndHour: v.optional(v.number()),
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
  returns: v.array(bookingDocValidator),
  handler: async (ctx, args) => {
    const user = await requireAppUser(ctx);
    assertCallerId(user, args.ownerId);

    const vehicles = await listOwnedVehicles(ctx, user);
    if (vehicles.length === 0) {
      return [];
    }

    const bookingsByVehicle = await Promise.all(
      vehicles.map((vehicle) =>
        ctx.db
          .query("bookings")
          .withIndex("by_vehicle", (q) => q.eq("vehicleId", vehicle._id))
          .take(100),
      ),
    );

    return bookingsByVehicle.flat().map(toBookingFields);
  },
});

export const getDriverBookings = query({
  args: { driverId: v.string() },
  returns: v.array(
    v.object({
      ...bookingFieldsValidator,
      vehicle: bookingVehicleSummaryValidator,
    }),
  ),
  handler: async (ctx, args) => {
    const user = await requireAppUser(ctx);
    assertCallerId(user, args.driverId);
    const bookings = await listDriverBookings(ctx, user);
    return await attachVehicleSummaries(ctx, bookings);
  },
});

export const updateVehicleSettings = mutation({
  args: {
    vehicleId: v.id("vehicles"),
    instantBook: v.optional(v.boolean()),
    advanceNotice: v.optional(v.number()),
    minTripDuration: v.optional(v.number()),
    maxTripDuration: v.optional(v.number()),
    distanceLimit: v.optional(v.number()),
    unlimitedDistance: v.optional(v.boolean()),
    pickupStartHour: v.optional(v.number()),
    pickupEndHour: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { vehicleId, ...updates } = args;
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (updates.instantBook !== undefined) patch.instantBook = updates.instantBook;
    if (updates.advanceNotice !== undefined) patch.advanceNotice = updates.advanceNotice;
    if (updates.minTripDuration !== undefined) patch.minTripDuration = updates.minTripDuration;
    if (updates.maxTripDuration !== undefined) patch.maxTripDuration = updates.maxTripDuration;
    if (updates.distanceLimit !== undefined) patch.distanceLimit = updates.distanceLimit;
    if (updates.unlimitedDistance !== undefined) patch.unlimitedDistance = updates.unlimitedDistance;
    if (updates.pickupStartHour !== undefined) patch.pickupStartHour = updates.pickupStartHour;
    if (updates.pickupEndHour !== undefined) patch.pickupEndHour = updates.pickupEndHour;
    await ctx.db.patch(vehicleId, patch);
    return null;
  },
});

export const createAvailabilityBlock = mutation({
  args: {
    vehicleId: v.id("vehicles"),
    ownerId: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    reason: v.optional(v.string()),
  },
  returns: v.id("availabilityBlocks"),
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("availabilityBlocks", {
      vehicleId: args.vehicleId,
      ownerId: args.ownerId,
      startDate: args.startDate,
      endDate: args.endDate,
      reason: args.reason,
      createdAt: now,
    });
  },
});

export const deleteAvailabilityBlock = mutation({
  args: { blockId: v.id("availabilityBlocks") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.blockId);
    return null;
  },
});

export const getVehicleAvailabilityBlocks = query({
  args: { vehicleId: v.id("vehicles") },
  returns: v.array(
    v.object({
      _id: v.id("availabilityBlocks"),
      _creationTime: v.number(),
      vehicleId: v.id("vehicles"),
      ownerId: v.string(),
      startDate: v.string(),
      endDate: v.string(),
      reason: v.optional(v.string()),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("availabilityBlocks")
      .withIndex("by_vehicle", (q) => q.eq("vehicleId", args.vehicleId))
      .collect();
  },
});

export const getOwnerAvailabilityBlocks = query({
  args: { ownerId: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("availabilityBlocks"),
      _creationTime: v.number(),
      vehicleId: v.id("vehicles"),
      ownerId: v.string(),
      startDate: v.string(),
      endDate: v.string(),
      reason: v.optional(v.string()),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("availabilityBlocks")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
      .collect();
  },
});

export const checkVehicleAvailability = query({
  args: {
    vehicleId: v.id("vehicles"),
    startDate: v.string(),
    endDate: v.string(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const { vehicleId, startDate, endDate } = args;
    return !(await hasDateConflict(ctx, vehicleId, startDate, endDate));
  },
});

export const getRenterBookings = query({
  args: { renterId: v.string() },
  returns: v.array(
    v.object({
      ...bookingFieldsValidator,
      vehicle: bookingVehicleSummaryValidator,
    }),
  ),
  handler: async (ctx, args) => {
    const user = await requireAppUser(ctx);
    assertCallerId(user, args.renterId);
    const bookings = await listRenterBookings(ctx, user);
    return await attachVehicleSummaries(ctx, bookings);
  },
});

export const getBooking = query({
  args: { bookingId: v.id("bookings") },
  returns: v.union(bookingDocValidator, v.null()),
  handler: async (ctx, args) => {
    const user = await requireAppUser(ctx);
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      return null;
    }
    const vehicle = await ctx.db.get(booking.vehicleId);
    if (!vehicle) {
      return null;
    }
    assertCanViewBooking(user, booking, vehicle);
    return toBookingFields(booking);
  },
});

export const createTripChangeRequest = mutation({
  args: {
    bookingId: v.id("bookings"),
    requesterId: v.string(),
    type: v.union(
      v.literal("extend"),
      v.literal("shorten"),
      v.literal("change_pickup"),
      v.literal("change_dropoff"),
      v.literal("add_driver"),
    ),
    requestedStartDate: v.optional(v.string()),
    requestedEndDate: v.optional(v.string()),
    requestedPickupLocation: v.optional(v.string()),
    requestedDropoffLocation: v.optional(v.string()),
    additionalDriverId: v.optional(v.string()),
  },
  returns: v.id("tripChangeRequests"),
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("tripChangeRequests", {
      bookingId: args.bookingId,
      requesterId: args.requesterId,
      type: args.type,
      requestedStartDate: args.requestedStartDate,
      requestedEndDate: args.requestedEndDate,
      requestedPickupLocation: args.requestedPickupLocation,
      requestedDropoffLocation: args.requestedDropoffLocation,
      additionalDriverId: args.additionalDriverId,
      status: "pending",
      createdAt: now,
    });
  },
});

export const approveTripChangeRequest = mutation({
  args: {
    requestId: v.id("tripChangeRequests"),
    responseReason: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Change request not found");
    }

    const now = Date.now();
    await ctx.db.patch(args.requestId, {
      status: "approved",
      responseReason: args.responseReason,
      respondedAt: now,
    });

    const patch: Record<string, unknown> = { updatedAt: now };
    if (request.requestedStartDate !== undefined) {
      patch.startDate = request.requestedStartDate;
    }
    if (request.requestedEndDate !== undefined) {
      patch.endDate = request.requestedEndDate;
    }
    if (request.requestedPickupLocation !== undefined) {
      patch.pickupLocation = request.requestedPickupLocation;
    }
    if (request.requestedDropoffLocation !== undefined) {
      patch.dropoffLocation = request.requestedDropoffLocation;
    }
    if (request.additionalDriverId !== undefined) {
      patch.driverId = request.additionalDriverId;
    }

    await ctx.db.patch(request.bookingId, patch);
    return null;
  },
});

export const declineTripChangeRequest = mutation({
  args: {
    requestId: v.id("tripChangeRequests"),
    responseReason: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.requestId, {
      status: "declined",
      responseReason: args.responseReason,
      respondedAt: now,
    });
    return null;
  },
});

export const getBookingChangeRequests = query({
  args: { bookingId: v.id("bookings") },
  returns: v.array(
    v.object({
      _id: v.id("tripChangeRequests"),
      _creationTime: v.number(),
      bookingId: v.id("bookings"),
      requesterId: v.string(),
      type: v.union(
        v.literal("extend"),
        v.literal("shorten"),
        v.literal("change_pickup"),
        v.literal("change_dropoff"),
        v.literal("add_driver"),
      ),
      requestedStartDate: v.optional(v.string()),
      requestedEndDate: v.optional(v.string()),
      requestedPickupLocation: v.optional(v.string()),
      requestedDropoffLocation: v.optional(v.string()),
      additionalDriverId: v.optional(v.string()),
      status: v.string(),
      responseReason: v.optional(v.string()),
      createdAt: v.number(),
      respondedAt: v.optional(v.number()),
    })
  ),
  handler: async (ctx, args) => {
    const user = await requireAppUser(ctx);
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      return [];
    }
    const vehicle = await ctx.db.get(booking.vehicleId);
    if (!vehicle) {
      return [];
    }
    assertCanViewBooking(user, booking, vehicle);
    return await ctx.db
      .query("tripChangeRequests")
      .withIndex("by_booking", (q) => q.eq("bookingId", args.bookingId))
      .take(50);
  },
});

export const getAvailableDrivers = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      clerkUserId: v.string(),
      role: v.literal("driver"),
      firstName: v.optional(v.string()),
      email: v.optional(v.string()),
      onboardingComplete: v.boolean(),
      notificationsEnabled: v.optional(v.boolean()),
      profileSetupComplete: v.optional(v.boolean()),
      avatarUri: v.optional(v.string()),
      availableForHire: v.optional(v.boolean()),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    const drivers = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "driver"))
      .collect();

    const driversWithAvailability = await Promise.all(
      drivers.map(async (driver) => {
        const profile = await ctx.db
          .query("driverProfiles")
          .withIndex("by_user", (q) => q.eq("userId", driver._id))
          .unique();
        return {
          _id: driver._id,
          _creationTime: driver._creationTime,
          clerkUserId: driver.clerkUserId,
          role: "driver" as const,
          firstName: driver.firstName,
          email: driver.email,
          onboardingComplete: driver.onboardingComplete,
          notificationsEnabled: driver.notificationsEnabled,
          profileSetupComplete: driver.profileSetupComplete,
          avatarUri: driver.avatarUri,
          availableForHire: profile?.availableForHire ?? false,
          createdAt: driver.createdAt,
          updatedAt: driver.updatedAt,
        };
      })
    );

    return driversWithAvailability.filter((d) => d.availableForHire);
  },
});
