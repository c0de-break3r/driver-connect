import { useMemo, useEffect } from "react";
import { ConvexProviderWithAuth } from "convex/react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PortalHost } from "@rn-primitives/portal";

import { convex } from "@/lib/convex";
import { useConvexRoleSync } from "@/hooks/useConvexRoleSync";
import { AuthProvider, useAuth } from "@/contexts/AuthProvider";
import { ClerkProvider } from "@clerk/expo";
import { ConvexSync } from "@/components/ConvexSync";
import { setupOneSignal } from "@/lib/onesignal";

// Ensure @expo/ui view managers are registered before the app renders.
// This prevents "ViewManagerRegistry.get()" crashes on Android when
// navigation or auth flows trigger preallocation of Expo UI views.
import "@expo/ui";

function NotificationSetup() {
  useEffect(() => {
    let isCancelled = false;
    const run = async () => {
      const cleanup = await setupOneSignal();
      if (isCancelled || typeof cleanup !== "function") {
        return;
      }
      return cleanup;
    };
    run();

    return () => {
      isCancelled = true;
    };
  }, []);

  return null;
}

function ConvexAuthWrapper({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  const convexAuth = useMemo(() => ({
    isLoading: !auth.isLoaded,
    isAuthenticated: auth.signedIn,
    fetchAccessToken: async () => {
      if (!auth.userId) return null;
      return `clerk_${auth.userId}`;
    },
  }), [auth.isLoaded, auth.signedIn, auth.userId]);

  return (
    <ConvexProviderWithAuth client={convex} useAuth={() => convexAuth}>
      {children}
    </ConvexProviderWithAuth>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
        <AuthProvider>
          <ConvexAuthWrapper>
            <BottomSheetModalProvider>
              <AppInner />
            </BottomSheetModalProvider>
          </ConvexAuthWrapper>
        </AuthProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}

function AppInner() {
  const auth = useAuth();
  useConvexRoleSync({ isLoaded: auth.isLoaded, isSignedIn: auth.signedIn, userId: auth.userId });

  return (
    <>
      <NotificationSetup />
      <ConvexSync />
      <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }} />
      <PortalHost />
    </>
  );
}

export const unstable_settings = {
  initialRouteName: "home",
};
