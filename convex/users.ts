import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByUserId = query({
  args: { userId: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      clerkUserId: v.string(),
      role: v.union(
        v.literal("driver"),
        v.literal("owner"),
        v.literal("client"),
        v.literal("corporate")
      ),
      firstName: v.optional(v.string()),
      email: v.optional(v.string()),
      onboardingComplete: v.boolean(),
      notificationsEnabled: v.optional(v.boolean()),
      profileSetupComplete: v.optional(v.boolean()),
      avatarUri: v.optional(v.string()),
      expoPushToken: v.optional(v.string()),
      onesignalPlayerId: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) =>
        q.eq("clerkUserId", args.userId)
      )
      .unique();
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      clerkUserId: v.string(),
      role: v.union(
        v.literal("driver"),
        v.literal("owner"),
        v.literal("client"),
        v.literal("corporate")
      ),
      firstName: v.optional(v.string()),
      email: v.optional(v.string()),
      onboardingComplete: v.boolean(),
      notificationsEnabled: v.optional(v.boolean()),
      profileSetupComplete: v.optional(v.boolean()),
      avatarUri: v.optional(v.string()),
      expoPushToken: v.optional(v.string()),
      onesignalPlayerId: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) =>
        q.eq("email", args.email)
      )
      .first();
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
    notificationsEnabled: v.optional(v.boolean()),
    profileSetupComplete: v.optional(v.boolean()),
    avatarUri: v.optional(v.string()),
    expoPushToken: v.optional(v.string()),
    onesignalPlayerId: v.optional(v.string()),
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) =>
        q.eq("clerkUserId", args.userId)
      )
      .unique();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        ...(args.firstName !== undefined && { firstName: args.firstName }),
        ...(args.email !== undefined && { email: args.email }),
        role: args.role,
        onboardingComplete: args.onboardingComplete,
        ...(args.notificationsEnabled !== undefined && { notificationsEnabled: args.notificationsEnabled }),
        ...(args.profileSetupComplete !== undefined && { profileSetupComplete: args.profileSetupComplete }),
        ...(args.avatarUri !== undefined && { avatarUri: args.avatarUri }),
        ...(args.expoPushToken !== undefined && { expoPushToken: args.expoPushToken }),
        ...(args.onesignalPlayerId !== undefined && { onesignalPlayerId: args.onesignalPlayerId }),
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkUserId: args.userId,
      role: args.role,
      firstName: args.firstName,
      email: args.email,
      onboardingComplete: args.onboardingComplete,
      notificationsEnabled: args.notificationsEnabled ?? true,
      profileSetupComplete: args.profileSetupComplete ?? false,
      avatarUri: args.avatarUri,
      expoPushToken: args.expoPushToken,
      onesignalPlayerId: args.onesignalPlayerId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const syncSettings = mutation({
  args: {
    userId: v.string(),
    notificationsEnabled: v.optional(v.boolean()),
    profileSetupComplete: v.optional(v.boolean()),
    avatarUri: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) =>
        q.eq("clerkUserId", args.userId)
      )
      .unique();

    if (!existing) {
      return null;
    }

    const now = Date.now();
    await ctx.db.patch(existing._id, {
      ...(args.notificationsEnabled !== undefined && { notificationsEnabled: args.notificationsEnabled }),
      ...(args.profileSetupComplete !== undefined && { profileSetupComplete: args.profileSetupComplete }),
      ...(args.avatarUri !== undefined && { avatarUri: args.avatarUri }),
      updatedAt: now,
    });

    return null;
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
        q.eq("clerkUserId", args.userId)
      )
      .unique();
    return user?.role ?? null;
  },
});

export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated request");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    return user ?? null;
  },
});

export const searchUsers = query({
  args: { searchTerm: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("users"),
      clerkUserId: v.string(),
      role: v.union(
        v.literal("driver"),
        v.literal("owner"),
        v.literal("client"),
        v.literal("corporate")
      ),
      firstName: v.optional(v.string()),
      email: v.optional(v.string()),
      onboardingComplete: v.boolean(),
      profileSetupComplete: v.optional(v.boolean()),
      avatarUri: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const term = args.searchTerm.trim().toLowerCase();
    if (!term) {
      return [];
    }

    const users = await ctx.db.query("users").collect();

    const matchedUserIds = new Set<string>();
    const matches: any[] = [];

    for (const user of users) {
      const name = (user.firstName ?? "").toLowerCase();
      if (name.includes(term) && !matchedUserIds.has(user._id)) {
        matchedUserIds.add(user._id);
        matches.push({
          _id: user._id,
          clerkUserId: user.clerkUserId,
          role: user.role,
          firstName: user.firstName,
          email: user.email,
          onboardingComplete: user.onboardingComplete,
          profileSetupComplete: user.profileSetupComplete,
          avatarUri: user.avatarUri,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        });
      }
    }

    const ownerProfiles = await ctx.db.query("ownerProfiles").collect();
    for (const profile of ownerProfiles) {
      const companyName = (profile.companyName ?? "").toLowerCase();
      if (companyName.includes(term) && !matchedUserIds.has(profile.userId)) {
        const user = users.find((u) => u._id === profile.userId);
        if (user) {
          matchedUserIds.add(user._id);
          matches.push({
            _id: user._id,
            clerkUserId: user.clerkUserId,
            role: user.role,
            firstName: user.firstName,
            email: user.email,
            onboardingComplete: user.onboardingComplete,
            profileSetupComplete: user.profileSetupComplete,
            avatarUri: user.avatarUri,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          });
        }
      }
    }

    const corporateProfiles = await ctx.db.query("corporateProfiles").collect();
    for (const profile of corporateProfiles) {
      const companyName = (profile.companyName ?? "").toLowerCase();
      if (companyName.includes(term) && !matchedUserIds.has(profile.userId)) {
        const user = users.find((u) => u._id === profile.userId);
        if (user) {
          matchedUserIds.add(user._id);
          matches.push({
            _id: user._id,
            clerkUserId: user.clerkUserId,
            role: user.role,
            firstName: user.firstName,
            email: user.email,
            onboardingComplete: user.onboardingComplete,
            profileSetupComplete: user.profileSetupComplete,
            avatarUri: user.avatarUri,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          });
        }
      }
    }

    return matches.slice(0, 20);
  },
});

export const updateSettings = mutation({
  args: {
    theme: v.optional(v.string()),
    currency: v.optional(v.string()),
    notifications: v.optional(v.boolean()),
    firstName: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    const now = Date.now();
    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        ...(args.theme !== undefined && { theme: args.theme }),
        ...(args.currency !== undefined && { currency: args.currency }),
        ...(args.notifications !== undefined && { notificationsEnabled: args.notifications }),
        ...(args.firstName !== undefined && { firstName: args.firstName }),
        ...(args.email !== undefined && { email: args.email }),
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("users", {
        clerkUserId: identity.subject,
        role: "client",
        email: identity.email ?? args.email ?? "",
        firstName: identity.firstName ? String(identity.firstName) : args.firstName ?? "",
        onboardingComplete: false,
        theme: args.theme ?? undefined,
        currency: args.currency ?? undefined,
        notificationsEnabled: args.notifications ?? true,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

export const savePushToken = mutation({
  args: {
    expoPushToken: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!existingUser) {
      return;
    }

    await ctx.db.patch(existingUser._id, {
      expoPushToken: args.expoPushToken,
      updatedAt: Date.now(),
    });
  },
});

export const getOwnerProfile = query({
  args: { userId: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("ownerProfiles"),
      _creationTime: v.number(),
      userId: v.string(),
      companyName: v.optional(v.string()),
      fleetSize: v.optional(v.number()),
      referralCode: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ownerProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

export const createOwnerProfile = mutation({
  args: {
    userId: v.string(),
    companyName: v.optional(v.string()),
    fleetSize: v.optional(v.number()),
  },
  returns: v.id("ownerProfiles"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("ownerProfiles", {
      userId: args.userId,
      companyName: args.companyName,
      fleetSize: args.fleetSize,
    });
  },
});

export const updateOwnerProfile = mutation({
  args: {
    userId: v.string(),
    companyName: v.optional(v.string()),
    fleetSize: v.optional(v.number()),
    referralCode: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("ownerProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .unique();

    if (!existing) {
      return null;
    }

    await ctx.db.patch(existing._id, {
      ...(args.companyName !== undefined && { companyName: args.companyName }),
      ...(args.fleetSize !== undefined && { fleetSize: args.fleetSize }),
      ...(args.referralCode !== undefined && { referralCode: args.referralCode }),
    });

    return null;
  },
});
