import { v } from "convex/values";
import { query } from "./_generated/server";

export const getComparableListings = query({
  args: {
    category: v.string(),
    year: v.number(),
  },
  returns: v.array(
    v.object({
      _id: v.id("vehicles"),
      pricePerDay: v.number(),
      year: v.number(),
      category: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    const vehicles = await ctx.db
      .query("vehicles")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();

    return vehicles
      .filter((v) => {
        const age = 2026 - v.year;
        return age >= 0 && age <= 15;
      })
      .map((v) => ({
        _id: v._id,
        pricePerDay: v.pricePerDay,
        year: v.year,
        category: v.category,
      }));
  },
});
