import { router, type Href } from "expo-router";

import { useRoleStore, type UserRole } from "@/store/useRoleStore";

/**
 * Returns the route a user should land on after authentication,
 * based on their selected role.
 *
 * - driver → location permission first, then dashboard
 * - owner / client / corporate → placeholder trial page
 * - no role yet → role selection
 */
export function getPostAuthRoute(role: UserRole | null): Href {
  switch (role) {
    case "driver":
      return "/(driver)/location-permission" as Href;
    case "owner":
    case "client":
    case "corporate":
      return "/(onboarding)/welcome" as Href;
    default:
      return "/(onboarding)/welcome" as Href;
  }
}

/** Navigate to the correct post-auth destination based on the current role. */
export function navigatePostAuth(): void {
  const role = useRoleStore.getState().role;
  router.replace(getPostAuthRoute(role));
}
