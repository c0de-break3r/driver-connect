import { useEffect } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthProvider";
import { useRoleStore } from "@/store/useRoleStore";
import { getPostAuthRoute } from "@/lib/routing";

export default function Index() {
  const { isLoaded, signedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    if (signedIn) {
      router.replace(getPostAuthRoute(useRoleStore.getState().role));
    } else {
      router.replace("/welcome-auth");
    }
  }, [isLoaded, signedIn]);

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF8F3", alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#2C3E5B" }}>Loading…</Text>
    </View>
  );
}
