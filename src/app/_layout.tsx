import "@/global.css";

import { ConvexProviderWithAuth } from "convex/react";
import { enableScreens } from "react-native-screens";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { convex } from "@/lib/convex";
import { useConvexRoleSync } from "@/hooks/useConvexRoleSync";
<<<<<<< HEAD
import { useSessionManager } from "@/hooks/useSessionManager";
=======
import { AuthProvider, useAuth } from "@/contexts/AuthProvider";
>>>>>>> 33eb3cd (updates)

enableScreens(false);

function ConvexAuthWrapper({ children }: { children: React.ReactNode }) {
  const { isLoaded, signedIn } = useAuth();

<<<<<<< HEAD
if (!publishableKey) {
  throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env");
}

const clerkKey: string = publishableKey;

function ConvexAuthBridge({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();

=======
>>>>>>> 33eb3cd (updates)
  const convexAuth = {
    isLoading: !isLoaded,
    isAuthenticated: signedIn,
    fetchAccessToken: async () => {
      const {
        data: { session },
      } = await (await import("@/lib/supabase")).supabase.auth.getSession();
      return session?.access_token ?? null;
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
<<<<<<< HEAD
      <ClerkProvider publishableKey={clerkKey}>
        <ConvexAuthBridge>
          <AppInner />
        </ConvexAuthBridge>
      </ClerkProvider>
=======
      <AuthProvider>
        <ConvexAuthWrapper>
          <AppInner />
        </ConvexAuthWrapper>
      </AuthProvider>
>>>>>>> 33eb3cd (updates)
    </GestureHandlerRootView>
  );
}

function AppInner() {
<<<<<<< HEAD
  const { isSignedIn, isLoaded, userId } = useAuth();
  useConvexRoleSync({ isLoaded, isSignedIn, userId });
  useSessionManager({ isLoaded, isSignedIn, userId });
=======
  const auth = useAuth();
  useConvexRoleSync({ isLoaded: auth.isLoaded, isSignedIn: auth.signedIn, userId: auth.userId });
>>>>>>> 33eb3cd (updates)

  return <Stack screenOptions={{ headerShown: false }} />;
}

export const unstable_settings = {
  initialRouteName: "index",
};
