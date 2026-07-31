import { router, type Href } from "expo-router";

/**
 * Returns the route a user should land on after authentication.
 *
 * For now the app is simplified to a single home screen.
 */
export function getPostAuthRoute(_role: string | null): Href {
  return "/home" as Href;
}

/** Navigate to the home screen after authentication. */
export function navigatePostAuth(): void {
  router.replace(getPostAuthRoute(null));
}
