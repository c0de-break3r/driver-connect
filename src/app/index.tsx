import { Redirect } from "expo-router";

/**
 * Root index — redirects to the onboarding welcome screen.
 * Once auth is implemented, this will check auth state and
 * route to the appropriate dashboard instead.
 */
export default function Index() {
  return <Redirect href="/(onboarding)/welcome" />;
}
