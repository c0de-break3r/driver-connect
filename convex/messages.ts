import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";

export const create = mutation({
  args: {
    bookingId: v.optional(v.id("bookings")),
    senderId: v.string(),
    receiverId: v.string(),
    content: v.string(),
    attachmentUrl: v.optional(v.string()),
  },
  returns: v.id("messages"),
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      bookingId: args.bookingId,
      senderId: args.senderId,
      receiverId: args.receiverId,
      content: args.content,
      attachmentUrl: args.attachmentUrl,
      isRead: false,
      createdAt: Date.now(),
    });

    return messageId;
  },
});

export const getByReceiver = query({
  args: { receiverId: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("messages"),
      _creationTime: v.number(),
      bookingId: v.optional(v.id("bookings")),
      senderId: v.string(),
      receiverId: v.string(),
      content: v.string(),
      attachmentUrl: v.optional(v.string()),
      isRead: v.boolean(),
      readAt: v.optional(v.number()),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_receiver", (q) => q.eq("receiverId", args.receiverId))
      .order("desc")
      .collect();
  },
});

export const markAsRead = mutation({
  args: { messageId: v.id("messages") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      isRead: true,
      readAt: Date.now(),
    });
    return null;
  },
});

export const sendMessageNotification = action({
  args: {
    messageId: v.id("messages"),
    receiverId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const message = await ctx.runQuery(api.messages.getByReceiverInternal, {
      messageId: args.messageId,
    });

    if (!message) {
      return null;
    }

    const receiver = await ctx.runQuery(api.users.getByUserId, {
      userId: args.receiverId,
    });

    if (!receiver?.expoPushToken) {
      return null;
    }

    const pushMessage = {
      to: receiver.expoPushToken,
      sound: "default",
      title: "New Message",
      body: message.content,
      data: {
        messageId: args.messageId,
        senderId: message.senderId,
        type: "message",
      },
    };

    try {
      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pushMessage),
      });
    } catch (error) {
      console.error("Failed to send message notification:", error);
    }

    return null;
  },
});

export const getByReceiverInternal = query({
  args: { messageId: v.id("messages") },
  returns: v.union(
    v.object({
      _id: v.id("messages"),
      _creationTime: v.number(),
      bookingId: v.optional(v.id("bookings")),
      senderId: v.string(),
      receiverId: v.string(),
      content: v.string(),
      attachmentUrl: v.optional(v.string()),
      isRead: v.boolean(),
      readAt: v.optional(v.number()),
      createdAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.messageId);
  },
});

export const getBookingMessages = query({
  args: { bookingId: v.id("bookings") },
  returns: v.array(
    v.object({
      _id: v.id("messages"),
      _creationTime: v.number(),
      bookingId: v.optional(v.id("bookings")),
      senderId: v.string(),
      receiverId: v.string(),
      content: v.string(),
      attachmentUrl: v.optional(v.string()),
      isRead: v.boolean(),
      readAt: v.optional(v.number()),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_booking", (q) => q.eq("bookingId", args.bookingId))
      .collect();
  },
});

export const sendMessage = mutation({
  args: {
    bookingId: v.optional(v.id("bookings")),
    senderId: v.string(),
    receiverId: v.string(),
    content: v.string(),
  },
  returns: v.id("messages"),
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("messages", {
      bookingId: args.bookingId,
      senderId: args.senderId,
      receiverId: args.receiverId,
      content: args.content,
      isRead: false,
      createdAt: now,
    });
  },
});

export const markMessagesAsRead = mutation({
  args: { bookingId: v.id("bookings"), receiverId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_booking", (q) => q.eq("bookingId", args.bookingId))
      .collect();

    const now = Date.now();
    for (const msg of messages) {
      if (msg.receiverId === args.receiverId && !msg.isRead) {
        await ctx.db.patch(msg._id, { isRead: true, readAt: now });
      }
    }
    return null;
  },
});
