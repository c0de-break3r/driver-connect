import "@/global.css";

import { ClerkProvider, useAuth } from "@clerk/expo";
import { ConvexProviderWithAuth } from "convex/react";
import { enableScreens } from "react-native-screens";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { convex } from "@/lib/convex";
import { useConvexRoleSync } from "@/hooks/useConvexRoleSync";

enableScreens(false);

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env");
}

const clerkKey: string = publishableKey;

function useConvexAuth() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  return {
    isLoading: !isLoaded,
    isAuthenticated: isSignedIn ?? false,
    fetchAccessToken: async () => {
      const token = await getToken();
      return token ?? null;
    },
  };
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ConvexProviderWithAuth client={convex} useAuth={useConvexAuth}>
        <ClerkProvider publishableKey={clerkKey}>
          <AppInner />
        </ClerkProvider>
      </ConvexProviderWithAuth>
    </GestureHandlerRootView>
  );
}

function AppInner() {
  const { isSignedIn, isLoaded, userId } = useAuth();
  useConvexRoleSync({ isLoaded, isSignedIn, userId });

  return <Stack screenOptions={{ headerShown: false }} />;
}

export const unstable_settings = {
  initialRouteName: "index",
};
