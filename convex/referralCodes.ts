import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("referrals"),
      _creationTime: v.number(),
      referrerId: v.string(),
      referredUserId: v.string(),
      code: v.string(),
      status: v.string(),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    return await ctx.db.query("referrals").collect();
  },
});

export const create = mutation({
  args: {
    referrerId: v.string(),
    referredUserId: v.string(),
    code: v.string(),
    status: v.string(),
  },
  returns: v.id("referrals"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("referrals", {
      referrerId: args.referrerId,
      referredUserId: args.referredUserId,
      code: args.code,
      status: args.status,
      createdAt: Date.now(),
    });
  },
});

export const getByCode = query({
  args: { code: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("referrals"),
      _creationTime: v.number(),
      referrerId: v.string(),
      referredUserId: v.string(),
      code: v.string(),
      status: v.string(),
      createdAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("referrals")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .unique();
  },
});

export const markUsed = mutation({
  args: {
    referralId: v.id("referrals"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.referralId, {
      status: "used",
    });
    return null;
  },
});
