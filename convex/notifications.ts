import { v } from "convex/values";
import { action, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

const MAX_ATTEMPTS = 5;
const RETRY_DELAY_MS = 60 * 1000;

type PushMessage = {
  to: string;
  sound?: string;
  title: string;
  body: string;
  data?: Record<string, any>;
};

export const sendPushNotification = action({
  args: {
    title: v.string(),
    body: v.string(),
    data: v.optional(v.any()),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    await ctx.runMutation(api.notifications.enqueue, {
      userId: identity.subject,
      title: args.title,
      body: args.body,
      data: args.data,
    });

    return null;
  },
});

export const sendTestNotification = action({
  args: {},
  returns: v.null(),
  handler: async (ctx): Promise<null> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    await ctx.runMutation(api.notifications.enqueue, {
      userId: identity.subject,
      title: "Test Notification",
      body: "If you see this, remote push notifications are working!",
      data: { type: "test" },
    });

    return null;
  },
});

export const enqueue = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    body: v.string(),
    data: v.optional(v.any()),
  },
  returns: v.id("notificationQueue"),
  handler: async (ctx, args) => {
    const now = Date.now();
    const queueId = await ctx.db.insert("notificationQueue", {
      userId: args.userId,
      title: args.title,
      body: args.body,
      data: args.data,
      status: "pending",
      attempts: 0,
      maxAttempts: MAX_ATTEMPTS,
      nextAttemptAt: now,
      createdAt: now,
      updatedAt: now,
    });

    return queueId;
  },
});

export const processQueue = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const now = Date.now();
    const pending = await ctx.db
      .query("notificationQueue")
      .withIndex("by_status_next", (q) => q.eq("status", "pending").lt("nextAttemptAt", now))
      .collect();

    for (const item of pending) {
      try {
        await ctx.db.patch(item._id, {
          status: "processing",
          updatedAt: Date.now(),
        });

        const user = await ctx.runQuery(api.users.getByUserId, {
          userId: item.userId,
        });

        if (!user?.expoPushToken) {
          await ctx.db.patch(item._id, {
            status: "failed",
            attempts: item.attempts + 1,
            error: "No push token",
            updatedAt: Date.now(),
          });
          continue;
        }

        const message: PushMessage = {
          to: user.expoPushToken,
          sound: "default",
          title: item.title,
          body: item.body,
          data: item.data ?? {},
        };

        const response = await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(message),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Push API responded with ${response.status}: ${errorText}`);
        }

        await ctx.db.patch(item._id, {
          status: "sent",
          attempts: item.attempts + 1,
          updatedAt: Date.now(),
        });
      } catch (error) {
        const attempts = item.attempts + 1;
        const shouldRetry = attempts < item.maxAttempts;
        const nextAttemptAt = shouldRetry ? Date.now() + RETRY_DELAY_MS : 0;

        await ctx.db.patch(item._id, {
          status: shouldRetry ? "pending" : "failed",
          attempts,
          nextAttemptAt,
          error: error instanceof Error ? error.message : "Unknown error",
          updatedAt: Date.now(),
        });
      }
    }

    return null;
  },
});

export const getQueueStatus = query({
  args: {},
  returns: v.union(
    v.object({
      pending: v.number(),
      processing: v.number(),
      sent: v.number(),
      failed: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!user) {
      return null;
    }

    const all = await ctx.db
      .query("notificationQueue")
      .withIndex("by_user", (q) => q.eq("userId", user.clerkUserId))
      .collect();

    return {
      pending: all.filter((item) => item.status === "pending").length,
      processing: all.filter((item) => item.status === "processing").length,
      sent: all.filter((item) => item.status === "sent").length,
      failed: all.filter((item) => item.status === "failed").length,
    };
  },
});
