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
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_user_id", ["clerkUserId"]),

  driverProfiles: defineTable({
    userId: v.id("users"),
    fullLegalName: v.optional(v.string()),
    licenseClass: v.optional(v.string()),
    licenseNumber: v.optional(v.string()),
    selfieUri: v.optional(v.string()),
    preferredJobType: v.optional(v.string()),
    selectedVehicleType: v.optional(v.string()),
    verificationStatus: v.optional(v.string()),
  }).index("by_user_id", ["userId"]),

  ownerProfiles: defineTable({
    userId: v.id("users"),
    companyName: v.optional(v.string()),
    fleetSize: v.optional(v.number()),
    referralCode: v.optional(v.string()),
  }).index("by_user_id", ["userId"]),

  clientProfiles: defineTable({
    userId: v.id("users"),
    preferredOccasion: v.optional(v.string()),
    frequentRoutes: v.optional(v.string()),
  }).index("by_user_id", ["userId"]),

  corporateProfiles: defineTable({
    userId: v.id("users"),
    companyName: v.optional(v.string()),
    orgSize: v.optional(v.string()),
    department: v.optional(v.string()),
  }).index("by_user_id", ["userId"]),

  verifications: defineTable({
    userId: v.id("users"),
    documentType: v.optional(v.string()),
    status: v.string(),
    livenessPassed: v.optional(v.boolean()),
    confidence: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user_id", ["userId"]),

  referralCodes: defineTable({
    code: v.string(),
    description: v.optional(v.string()),
    discountPercent: v.optional(v.number()),
    isActive: v.boolean(),
    createdAt: v.number(),
    expiresAt: v.optional(v.number()),
  }).index("by_code", ["code"]),

  ads: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    targetRole: v.union(
      v.literal("driver"),
      v.literal("owner"),
      v.literal("client"),
      v.literal("corporate"),
      v.literal("all")
    ),
    isActive: v.boolean(),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_target_role", ["targetRole"]),
});
