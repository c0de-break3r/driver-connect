import { useEffect } from "react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PortalHost } from "@rn-primitives/portal";

import { convex } from "@/lib/convex";
import { useConvexRoleSync } from "@/hooks/useConvexRoleSync";
import { AuthProvider, useAuth } from "@/contexts/AuthProvider";
import { ClerkProvider, useAuth as useClerkAuth } from "@clerk/expo";
import { ConvexSync } from "@/components/ConvexSync";
import { setupOneSignal } from "@/lib/onesignal";

// Ensure @expo/ui view managers are registered before the app renders.
// This prevents "ViewManagerRegistry.get()" crashes on Android when
// navigation or auth flows trigger preallocation of Expo UI views.
import "@expo/ui";

// Import global styles for NativeWind theme variables and utilities.
import "../global.css";

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
  return <ConvexProviderWithClerk client={convex} useAuth={useClerkAuth}>{children}</ConvexProviderWithClerk>;
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
