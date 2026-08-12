import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

export const recordEvent = mutation({
  args: {
    event: v.string(),
    userId: v.optional(v.string()),
    role: v.optional(v.string()),
    properties: v.optional(v.any()),
    createdAt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("analyticsEvents", {
      event: args.event,
      userId: args.userId,
      role: args.role,
      properties: args.properties,
      createdAt: args.createdAt,
    });
    return null;
  },
});

export const logAnalyticsEvent = action({
  args: {
    event: v.string(),
    userId: v.optional(v.string()),
    role: v.optional(v.string()),
    properties: v.optional(v.any()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.runMutation(api.analytics.recordEvent, {
      event: args.event,
      userId: args.userId,
      role: args.role,
      properties: args.properties,
      createdAt: Date.now(),
    });
    return null;
  },
});

export const getAnalyticsSummary = query({
  args: {},
  returns: v.object({
    totalEvents: v.number(),
    eventsByType: v.any(),
    recentEvents: v.array(v.any()),
  }),
  handler: async (ctx) => {
    const events = await ctx.db
      .query("analyticsEvents")
      .order("desc")
      .take(1000);

    const totalEvents = events.length;
    const eventsByType: Record<string, number> = {};
    for (const event of events) {
      eventsByType[event.event] = (eventsByType[event.event] || 0) + 1;
    }

    return {
      totalEvents,
      eventsByType,
      recentEvents: events.slice(0, 50),
    };
  },
});
