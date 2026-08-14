import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const trackSearch = mutation({
  args: {
    userId: v.string(),
    query: v.string(),
    location: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  returns: v.id("searchHistory"),
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("searchHistory", {
      userId: args.userId,
      query: args.query,
      location: args.location,
      category: args.category,
      createdAt: now,
    });
  },
});

export const trackVehicleView = mutation({
  args: {
    userId: v.string(),
    vehicleId: v.string(),
    vehicleTitle: v.string(),
    vehicleCategory: v.optional(v.string()),
    vehicleCity: v.optional(v.string()),
    vehicleRegion: v.optional(v.string()),
    vehiclePricePerDay: v.optional(v.number()),
    vehicleImage: v.optional(v.string()),
    vehicleRating: v.optional(v.number()),
  },
  returns: v.id("vehicleViews"),
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("vehicleViews", {
      userId: args.userId,
      vehicleId: args.vehicleId,
      vehicleTitle: args.vehicleTitle,
      vehicleCategory: args.vehicleCategory,
      vehicleCity: args.vehicleCity,
      vehicleRegion: args.vehicleRegion,
      vehiclePricePerDay: args.vehiclePricePerDay,
      vehicleImage: args.vehicleImage,
      vehicleRating: args.vehicleRating,
      viewedAt: now,
    });
  },
});

export const getUserSearchHistory = query({
  args: { userId: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("searchHistory"),
      _creationTime: v.number(),
      query: v.string(),
      location: v.optional(v.string()),
      category: v.optional(v.string()),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("searchHistory")
      .withIndex("by_user_created", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(10);
  },
});

export const getUserRecentlyViewed = query({
  args: { userId: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("vehicleViews"),
      _creationTime: v.number(),
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
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("vehicleViews")
      .withIndex("by_user_viewed", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(20);
  },
});

export const getRecommendationsForUser = query({
  args: { userId: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("recommendations"),
      _creationTime: v.number(),
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
  ),
  handler: async (ctx, args) => {
    const now = Date.now();
    const recs = await ctx.db
      .query("recommendations")
      .withIndex("by_user_type", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(20);

    return recs.filter((r) => !r.expiresAt || r.expiresAt > now);
  },
});

export const generateRecommendations = mutation({
  args: { userId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    const recentSearches = await ctx.db
      .query("searchHistory")
      .withIndex("by_user_created", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(10);

    const recentViews = await ctx.db
      .query("vehicleViews")
      .withIndex("by_user_viewed", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(20);

    const existingRecs = await ctx.db
      .query("recommendations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    for (const rec of existingRecs) {
      await ctx.db.delete(rec._id);
    }

    const existingSectionIds = new Set<string>();

    if (recentSearches.length > 0) {
      const lastSearch = recentSearches[0];
      const location = lastSearch.location || lastSearch.query;
      const sectionId = `recent-search-${lastSearch.query.toLowerCase().replace(/\s+/g, "-")}`;

      if (!existingSectionIds.has(sectionId)) {
        existingSectionIds.add(sectionId);
        await ctx.db.insert("recommendations", {
          userId: args.userId,
          type: "recent_search",
          title: `Continue searching for cars`,
          subtitle: location,
          vehicleIds: [],
          sectionId,
          priority: 1,
          createdAt: now,
        });
      }

      const uniqueLocations = new Set<string>();
      for (const search of recentSearches) {
        if (search.location && !uniqueLocations.has(search.location)) {
          uniqueLocations.add(search.location);
          const locSectionId = `search-${search.location.toLowerCase().replace(/\s+/g, "-")}`;
          if (!existingSectionIds.has(locSectionId)) {
            existingSectionIds.add(locSectionId);
            await ctx.db.insert("recommendations", {
              userId: args.userId,
              type: "recent_search",
              title: `Inspired by recent searches`,
              subtitle: `Based on your search for "${search.query}"`,
              vehicleIds: [],
              sectionId: locSectionId,
              priority: 2,
              createdAt: now,
            });
          }
        }
      }
    }

    if (recentViews.length > 0) {
      const viewedVehicleIds = recentViews.map((v) => v.vehicleId);
      const viewedCategories = new Set<string>();
      const viewedCities = new Set<string>();

      for (const view of recentViews) {
        if (view.vehicleCategory) viewedCategories.add(view.vehicleCategory);
        if (view.vehicleCity) viewedCities.add(view.vehicleCity);
      }

      if (viewedCategories.size > 0) {
        const category = Array.from(viewedCategories)[0];
        const sectionId = `recently-viewed-${category.toLowerCase().replace(/\s+/g, "-")}`;
        if (!existingSectionIds.has(sectionId)) {
          existingSectionIds.add(sectionId);
          await ctx.db.insert("recommendations", {
            userId: args.userId,
            type: "similar_vehicle",
            title: `Recently viewed`,
            subtitle: category,
            vehicleIds: viewedVehicleIds.slice(0, 6),
            sectionId,
            priority: 0,
            createdAt: now,
          });
        }
      }

      if (viewedCities.size > 0) {
        const city = Array.from(viewedCities)[0];
        const sectionId = `recently-viewed-city-${city.toLowerCase().replace(/\s+/g, "-")}`;
        if (!existingSectionIds.has(sectionId)) {
          existingSectionIds.add(sectionId);
          await ctx.db.insert("recommendations", {
            userId: args.userId,
            type: "similar_vehicle",
            title: `Top rated in ${city}`,
            subtitle: `Similar to what you viewed`,
            vehicleIds: [],
            sectionId,
            priority: 3,
            createdAt: now,
          });
        }
      }
    }

    const allVehicles = await ctx.db
      .query("vehicles")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    const trendingIds = allVehicles
      .sort((a, b) => (b.totalBookings || 0) - (a.totalBookings || 0))
      .slice(0, 6)
      .map((v) => v._id);

    const trendingSectionId = "trending-vehicles";
    if (!existingSectionIds.has(trendingSectionId)) {
      existingSectionIds.add(trendingSectionId);
      await ctx.db.insert("recommendations", {
        userId: args.userId,
        type: "trending",
        title: "Trending vehicles",
        subtitle: "Most booked this week",
        vehicleIds: trendingIds,
        sectionId: trendingSectionId,
        priority: 4,
        expiresAt: now + 7 * 24 * 60 * 60 * 1000,
        createdAt: now,
      });
    }

    return null;
  },
});

export const getLastSearch = query({
  args: { userId: v.string() },
  returns: v.union(
    v.object({
      query: v.string(),
      location: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const searches = await ctx.db
      .query("searchHistory")
      .withIndex("by_user_created", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(1);

    if (searches.length === 0) return null;
    const search = searches[0];
    return {
      query: search.query,
      location: search.location,
    };
  },
});
