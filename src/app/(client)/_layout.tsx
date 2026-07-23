import { Stack, Redirect } from "expo-router";
import { useAuth } from "@clerk/expo";
import { useRoleStore } from "@/store/useRoleStore";
import { getPostAuthRoute } from "@/lib/routing";

export default function ClientLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const role = useRoleStore((s) => s.role);

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn || role !== "client") {
    const href = role === "client" ? "/(auth)/sign-in" : getPostAuthRoute(role);
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
