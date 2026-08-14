import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkUserId: v.string(),
    role: v.union(
      v.literal("driver"),
      v.literal("owner"),
      v.literal("client"),
      v.literal("corporate")
    ),
    firstName: v.optional(v.string()),
    email: v.optional(v.string()),
    onboardingComplete: v.boolean(),
    notificationsEnabled: v.optional(v.boolean()),
    profileSetupComplete: v.optional(v.boolean()),
    avatarUri: v.optional(v.string()),
    expoPushToken: v.optional(v.string()),
    onesignalPlayerId: v.optional(v.string()),
    theme: v.optional(v.string()),
    currency: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["clerkUserId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  driverProfiles: defineTable({
    userId: v.string(),
    licenseNumber: v.optional(v.string()),
    licenseClass: v.optional(v.string()),
    licenseExpiry: v.optional(v.string()),
    yearsOfExperience: v.optional(v.number()),
    preferredVehicleTypes: v.array(v.string()),
    availableForHire: v.boolean(),
    hourlyRate: v.optional(v.number()),
    dailyRate: v.optional(v.number()),
    weeklyRate: v.optional(v.number()),
    monthlyRate: v.optional(v.number()),
    bio: v.optional(v.string()),
    rating: v.number(),
    totalTrips: v.number(),
    verificationStatus: v.string(),
    idDocumentUrl: v.optional(v.string()),
    selfieUrl: v.optional(v.string()),
    policeClearanceUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  ownerProfiles: defineTable({
    userId: v.string(),
    companyName: v.optional(v.string()),
    fleetSize: v.optional(v.number()),
    referralCode: v.optional(v.string()),
  }).index("by_user_id", ["userId"]),

  clientProfiles: defineTable({
    userId: v.string(),
    preferredOccasion: v.optional(v.string()),
    frequentRoutes: v.optional(v.string()),
  }).index("by_user_id", ["userId"]),

  corporateProfiles: defineTable({
    userId: v.string(),
    companyName: v.optional(v.string()),
    orgSize: v.optional(v.string()),
    department: v.optional(v.string()),
  }).index("by_user_id", ["userId"]),

  referrals: defineTable({
    referrerId: v.string(),
    referredUserId: v.string(),
    code: v.string(),
    status: v.string(),
    createdAt: v.number(),
  })
    .index("by_referrer", ["referrerId"])
    .index("by_code", ["code"]),

  ads: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    targetUrl: v.optional(v.string()),
    targetRole: v.optional(v.union(v.literal("driver"), v.literal("owner"), v.literal("client"), v.literal("corporate"), v.literal("all"))),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  vehicles: defineTable({
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
    status: v.string(),
    isFeatured: v.boolean(),
    rating: v.number(),
    reviewCount: v.number(),
    totalBookings: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_category", ["category"])
    .index("by_city", ["city"])
    .index("by_status", ["status"])
    .index("by_price", ["pricePerDay"])
    .index("by_location", ["latitude", "longitude"]),

  bookings: defineTable({
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
    .index("by_vehicle", ["vehicleId"])
    .index("by_renter", ["renterId"])
    .index("by_driver", ["driverId"])
    .index("by_status", ["status"])
    .index("by_dates", ["startDate", "endDate"]),

  reviews: defineTable({
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
    .index("by_reviewee", ["revieweeId"])
    .index("by_vehicle", ["vehicleId"])
    .index("by_rating", ["rating"]),

  messages: defineTable({
    bookingId: v.optional(v.id("bookings")),
    senderId: v.string(),
    receiverId: v.string(),
    content: v.string(),
    attachmentUrl: v.optional(v.string()),
    isRead: v.boolean(),
    readAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_booking", ["bookingId"])
    .index("by_sender", ["senderId"])
    .index("by_receiver", ["receiverId"])
    .index("by_unread", ["receiverId", "isRead"]),

  notificationQueue: defineTable({
    userId: v.string(),
    title: v.string(),
    body: v.string(),
    data: v.optional(v.any()),
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("sent"), v.literal("failed")),
    attempts: v.number(),
    maxAttempts: v.number(),
    nextAttemptAt: v.number(),
    error: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status_next", ["status", "nextAttemptAt"])
    .index("by_user", ["userId"]),

  analyticsEvents: defineTable({
    event: v.string(),
    userId: v.optional(v.string()),
    role: v.optional(v.string()),
    properties: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_event", ["event"])
    .index("by_user", ["userId"])
    .index("by_created_at", ["createdAt"]),

  searchHistory: defineTable({
    userId: v.string(),
    query: v.string(),
    location: v.optional(v.string()),
    category: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_created", ["userId", "createdAt"]),

  vehicleViews: defineTable({
    userId: v.string(),
    vehicleId: v.string(),
    vehicleTitle: v.string(),
    vehicleCategory: v.optional(v.string()),
    vehicleCity: v.optional(v.string()),
    vehicleRegion: v.optional(v.string()),
    vehiclePricePerDay: v.optional(v.number()),
    vehicleImage: v.optional(v.string()),
    vehicleRating: v.optional(v.number()),
    viewedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_viewed", ["userId", "viewedAt"])
    .index("by_vehicle", ["vehicleId"]),

  recommendations: defineTable({
    userId: v.string(),
    type: v.union(v.literal("recent_search"), v.literal("similar_vehicle"), v.literal("trending")),
    title: v.string(),
    subtitle: v.optional(v.string()),
    vehicleIds: v.array(v.string()),
    sectionId: v.string(),
    priority: v.number(),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_type", ["userId", "type"])
    .index("by_section", ["sectionId"]),
});
