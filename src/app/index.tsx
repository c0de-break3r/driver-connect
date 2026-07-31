import { useEffect } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";

export default function Index() {
  useEffect(() => {
    router.replace("/home");
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF8F3", alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#2C3E5B" }}>Loading…</Text>
    </View>
  );
}
