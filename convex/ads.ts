import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const listFeatured = query({
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
      isFeatured: v.boolean(),
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

export const createFeaturedListing = mutation({
  args: {
    vehicleId: v.id("vehicles"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.vehicleId, {
      isFeatured: true,
      updatedAt: Date.now(),
    });
    return null;
  },
});
