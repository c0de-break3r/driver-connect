import { Redirect } from "expo-router";

/**
 * Root index — redirects to the auth sign-in screen.
 */
export default function Index() {
  return <Redirect href="/(auth)/sign-in" />;
}
