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
    <View className="flex-1 bg-white items-center justify-center">
      <Text className="text-[#2C3E5B]">Completing sign in…</Text>
    </View>
  );
}
