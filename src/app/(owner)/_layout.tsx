import { Stack, Redirect } from "expo-router";
import { useAuth } from "@clerk/expo";
import { useRoleStore } from "@/store/useRoleStore";
import { getPostAuthRoute } from "@/lib/routing";

export default function OwnerLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const role = useRoleStore((s) => s.role);

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn || role !== "owner") {
    const href = role === "owner" ? "/(auth)/sign-in" : getPostAuthRoute(role);
    return <Redirect href={href as any} />;
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
