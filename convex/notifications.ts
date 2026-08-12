import { v } from "convex/values";
import { action, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

const MAX_ATTEMPTS = 5;
const RETRY_DELAY_MS = 60 * 1000;
const ONESIGNAL_APP_ID = "e55df92b-39ad-4a8d-81fd-7f1aa4b76bd6";
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY || "";

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

export const sendUserNotification = action({
  args: {
    userId: v.string(),
    title: v.string(),
    body: v.string(),
    data: v.optional(v.any()),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    await ctx.runMutation(api.notifications.enqueue, {
      userId: args.userId,
      title: args.title,
      body: args.body,
      data: args.data,
    });

    return null;
  },
});

export const sendRoleNotification = action({
  args: {
    role: v.union(v.literal("driver"), v.literal("owner"), v.literal("client"), v.literal("corporate")),
    title: v.string(),
    body: v.string(),
    data: v.optional(v.any()),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    const users = await ctx.runQuery(api.notifications.getUsersByRole, {
      role: args.role as any,
    });

    for (const user of users) {
      if (user.onesignalPlayerId) {
        await ctx.runMutation(api.notifications.enqueue, {
          userId: user.clerkUserId,
          title: args.title,
          body: args.body,
          data: args.data,
        });
      }
    }

    return null;
  },
});

export const sendAppWideNotification = action({
  args: {
    title: v.string(),
    body: v.string(),
    data: v.optional(v.any()),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    const users = await ctx.runQuery(api.notifications.getAllUsersWithPlayerId);

    for (const user of users) {
      if (user.onesignalPlayerId) {
        await ctx.runMutation(api.notifications.enqueue, {
          userId: user.clerkUserId,
          title: args.title,
          body: args.body,
          data: args.data,
        });
      }
    }

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

        const playerId = user?.onesignalPlayerId || user?.expoPushToken;
        if (!playerId) {
          await ctx.db.patch(item._id, {
            status: "failed",
            attempts: item.attempts + 1,
            error: "No push token",
            updatedAt: Date.now(),
          });
          continue;
        }

        const response = await fetch("https://api.onesignal.com/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
          },
          body: JSON.stringify({
            app_id: ONESIGNAL_APP_ID,
            include_player_ids: [playerId],
            headings: { en: item.title },
            contents: { en: item.body },
            data: item.data ?? {},
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`OneSignal API responded with ${response.status}: ${errorText}`);
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

export const getUsersByRole = query({
  args: { role: v.string() },
  returns: v.array(v.object({
    clerkUserId: v.string(),
    onesignalPlayerId: v.optional(v.string()),
  })),
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", args.role as any))
      .collect();

    return users
      .filter((user) => user.onesignalPlayerId)
      .map((user) => ({
        clerkUserId: user.clerkUserId,
        onesignalPlayerId: user.onesignalPlayerId,
      }));
  },
});

export const getAllUsersWithPlayerId = query({
  args: {},
  returns: v.array(v.object({
    clerkUserId: v.string(),
    onesignalPlayerId: v.optional(v.string()),
  })),
  handler: async (ctx) => {
    const users = await ctx.db
      .query("users")
      .collect();

    return users
      .filter((user) => user.onesignalPlayerId)
      .map((user) => ({
        clerkUserId: user.clerkUserId,
        onesignalPlayerId: user.onesignalPlayerId,
      }));
  },
});
