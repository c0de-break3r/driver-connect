import { useEffect } from "react";
import { View, Text } from "react-native";
import { router, useRootNavigationState } from "expo-router";
import { useAuth } from "@/contexts/AuthProvider";

export default function SSOCallback() {
  const { isLoaded, signedIn } = useAuth();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (!rootNavigationState?.key) {
      return;
    }

    if (!isLoaded) {
      return;
    }

    router.replace("/home");
  }, [isLoaded, signedIn, rootNavigationState?.key]);

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#2C3E5B" }}>Completing sign in…</Text>
    </View>
  );
}
