import { router, type Href } from "expo-router";
import { useRoleStore } from "@/store/useRoleStore";

/**
 * Returns the route a user should land on after authentication.
 */
export function getPostAuthRoute(role: string | null): Href {
  if (role === "owner") {
    return "/(owner)" as Href;
  }
  if (role === "driver") {
    return "/(driver)" as Href;
  }
  if (role === "corporate") {
    return "/(corporate)" as Href;
  }
  return "/home" as Href;
}

/** Navigate to the home screen after authentication. */
export function navigatePostAuth(): void {
  const role = useRoleStore.getState().role;
  router.replace(getPostAuthRoute(role));
}
