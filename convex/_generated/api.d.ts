/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ads from "../ads.js";
import type * as analytics from "../analytics.js";
import type * as jobs from "../jobs.js";
import type * as listingAutomation from "../listingAutomation.js";
import type * as listingQueries from "../listingQueries.js";
import type * as messages from "../messages.js";
import type * as notifications from "../notifications.js";
import type * as referralCodes from "../referralCodes.js";
import type * as userBehavior from "../userBehavior.js";
import type * as users from "../users.js";
import type * as verifications from "../verifications.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ads: typeof ads;
  analytics: typeof analytics;
  jobs: typeof jobs;
  listingAutomation: typeof listingAutomation;
  listingQueries: typeof listingQueries;
  messages: typeof messages;
  notifications: typeof notifications;
  referralCodes: typeof referralCodes;
  userBehavior: typeof userBehavior;
  users: typeof users;
  verifications: typeof verifications;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
