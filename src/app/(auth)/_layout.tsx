import { Redirect, Stack } from "expo-router";

import { useAuth } from "@/contexts/AuthProvider";
import { getPostAuthRoute } from "@/lib/routing";
import { useRoleStore } from "@/store/useRoleStore";

export default function AuthLayout() {
  const { isLoaded, signedIn } = useAuth();
  const role = useRoleStore((s) => s.role);

  if (!isLoaded) {
    return null;
  }

  if (signedIn) {
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
