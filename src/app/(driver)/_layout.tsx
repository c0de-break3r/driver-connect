import { Stack, Redirect } from "expo-router";
import { useAuth } from "@clerk/expo";
import { useRoleStore } from "@/store/useRoleStore";
import { getPostAuthRoute } from "@/lib/routing";

export default function DriverLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const role = useRoleStore((s) => s.role);

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn || role !== "driver") {
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
