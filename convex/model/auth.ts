import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type AuthCtx = QueryCtx | MutationCtx;

export async function requireIdentity(ctx: AuthCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated request");
  }
  return identity;
}

export async function requireAppUser(ctx: AuthCtx): Promise<Doc<"users">> {
  const identity = await requireIdentity(ctx);
  const user = await ctx.db
    .query("users")
    .withIndex("by_user_id", (q) => q.eq("clerkUserId", identity.subject))
    .unique();
  if (!user) {
    throw new Error("User profile not found");
  }
  return user;
}

export function isSameActor(
  user: Doc<"users">,
  storedId: string | undefined | null,
): boolean {
  if (!storedId) {
    return false;
  }
  return storedId === user.clerkUserId || storedId === user._id;
}

export function assertCallerId(user: Doc<"users">, suppliedId: string) {
  if (!isSameActor(user, suppliedId)) {
    throw new Error("Forbidden");
  }
}

export async function findUserByActorId(
  ctx: AuthCtx,
  actorId: string,
): Promise<Doc<"users"> | null> {
  const byClerk = await ctx.db
    .query("users")
    .withIndex("by_user_id", (q) => q.eq("clerkUserId", actorId))
    .unique();
  if (byClerk) {
    return byClerk;
  }
  const normalized = ctx.db.normalizeId("users", actorId);
  if (!normalized) {
    return null;
  }
  return await ctx.db.get(normalized);
}
