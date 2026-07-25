import "@/global.css";

import { ClerkProvider, useAuth } from "@clerk/expo";
import { ConvexProviderWithAuth } from "convex/react";
import { enableScreens } from "react-native-screens";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { convex } from "@/lib/convex";
import { useConvexRoleSync } from "@/hooks/useConvexRoleSync";
import { useSessionManager } from "@/hooks/useSessionManager";

enableScreens(false);

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env");
}

const clerkKey: string = publishableKey;

function ConvexAuthBridge({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  const convexAuth = {
    isLoading: !isLoaded,
    isAuthenticated: isSignedIn ?? false,
    fetchAccessToken: async () => {
      const token = await getToken();
      return token ?? null;
    },
  };

  return (
    <ConvexProviderWithAuth client={convex} useAuth={() => convexAuth}>
      {children}
    </ConvexProviderWithAuth>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider publishableKey={clerkKey}>
        <ConvexAuthBridge>
          <AppInner />
        </ConvexAuthBridge>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}

function AppInner() {
  const { isSignedIn, isLoaded, userId } = useAuth();
  useConvexRoleSync({ isLoaded, isSignedIn, userId });
  useSessionManager({ isLoaded, isSignedIn, userId });

  return <Stack screenOptions={{ headerShown: false }} />;
}

export const unstable_settings = {
  initialRouteName: "index",
};
