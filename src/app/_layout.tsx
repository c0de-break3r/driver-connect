import { useMemo } from "react";
import { ConvexProviderWithAuth } from "convex/react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import * as WebBrowser from "expo-web-browser";

import { convex } from "@/lib/convex";
import { useConvexRoleSync } from "@/hooks/useConvexRoleSync";
import { AuthProvider, useAuth } from "@/contexts/AuthProvider";

WebBrowser.maybeCompleteAuthSession();

function ConvexAuthWrapper({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  const convexAuth = useMemo(() => ({
    isLoading: !auth.isLoaded,
    isAuthenticated: auth.signedIn,
    fetchAccessToken: async () => {
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token ?? null;
    },
  }), [auth.isLoaded, auth.signedIn]);

  return (
    <ConvexProviderWithAuth client={convex} useAuth={() => convexAuth}>
      {children}
    </ConvexProviderWithAuth>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ConvexAuthWrapper>
          <AppInner />
        </ConvexAuthWrapper>
      </AuthProvider>
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
