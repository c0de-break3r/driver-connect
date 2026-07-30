import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByUserId = query({
  args: { userId: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      userId: v.string(),
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
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) =>
        q.eq("userId", args.userId)
      )
      .unique();
  },
});

export const upsert = mutation({
  args: {
    userId: v.string(),
    role: v.union(
      v.literal("driver"),
      v.literal("owner"),
      v.literal("client"),
      v.literal("corporate")
    ),
    firstName: v.optional(v.string()),
    email: v.optional(v.string()),
    onboardingComplete: v.boolean(),
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) =>
        q.eq("userId", args.userId)
      )
      .unique();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        ...(args.firstName !== undefined && { firstName: args.firstName }),
        ...(args.email !== undefined && { email: args.email }),
        role: args.role,
        onboardingComplete: args.onboardingComplete,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      userId: args.userId,
      role: args.role,
      firstName: args.firstName,
      email: args.email,
      onboardingComplete: args.onboardingComplete,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getRole = query({
  args: { userId: v.string() },
  returns: v.union(
    v.literal("driver"),
    v.literal("owner"),
    v.literal("client"),
    v.literal("corporate"),
    v.null()
  ),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) =>
        q.eq("userId", args.userId)
      )
      .unique();
    return user?.role ?? null;
  },
});
