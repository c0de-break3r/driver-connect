import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";

import { getPostAuthRoute } from "@/lib/routing";
import { useRoleStore } from "@/store/useRoleStore";

/**
 * Auth route group layout.
 *
 * - Redirects signed-in users away from auth screens to their role-based destination.
 * - Returns null while auth state is loading.
 * - Otherwise renders the auth stack.
 */
export default function AuthLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const role = useRoleStore((s) => s.role);

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href={getPostAuthRoute(role)} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: "slide_from_right",
      }}
    />
  );
}
