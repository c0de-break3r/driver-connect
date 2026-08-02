import { useEffect } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthProvider";

export default function SSOCallback() {
  const { isLoaded, signedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    if (signedIn) {
      router.replace("/home");
    } else {
      router.replace("/home");
    }
  }, [isLoaded, signedIn]);

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF8F3", alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#2C3E5B" }}>Completing sign in…</Text>
    </View>
  );
}
