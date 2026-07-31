import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const submitDocumentVerification = mutation({
  args: {
    userId: v.string(),
    verificationStatus: v.string(),
  },
  returns: v.id("driverProfiles"),
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("driverProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        verificationStatus: args.verificationStatus,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("driverProfiles", {
      userId: args.userId,
      verificationStatus: args.verificationStatus,
      availableForHire: false,
      preferredVehicleTypes: [],
      rating: 0,
      totalTrips: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const recordVerification = mutation({
  args: {
    userId: v.id("users"),
    verificationStatus: v.string(),
  },
  returns: v.id("driverProfiles"),
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("driverProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        verificationStatus: args.verificationStatus,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("driverProfiles", {
      userId: args.userId,
      verificationStatus: args.verificationStatus,
      availableForHire: false,
      preferredVehicleTypes: [],
      rating: 0,
      totalTrips: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getVerificationStatus = query({
  args: { userId: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("driverProfiles"),
      _creationTime: v.number(),
      userId: v.string(),
      verificationStatus: v.string(),
      availableForHire: v.boolean(),
      rating: v.number(),
      totalTrips: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("driverProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
  },
});
