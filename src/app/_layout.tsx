import { useMemo } from "react";
import { ConvexProviderWithAuth } from "convex/react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { convex } from "@/lib/convex";
import { useConvexRoleSync } from "@/hooks/useConvexRoleSync";
import { AuthProvider, useAuth } from "@/contexts/AuthProvider";
import { ClerkProvider } from "@clerk/expo";

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
            <AppInner />
          </ConvexAuthWrapper>
        </AuthProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}

function AppInner() {
  const auth = useAuth();
  useConvexRoleSync({ isLoaded: auth.isLoaded, isSignedIn: auth.signedIn, userId: auth.userId });

  return <Stack screenOptions={{ headerShown: false }} />;
}

export const unstable_settings = {
  initialRouteName: "index",
};
