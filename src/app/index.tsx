import { useEffect } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthProvider";
import { RingLoader } from "@/components/WelcomeAuthScreen";

const NAVY = "#2C3E5B";

export default function Index() {
  const { isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded) {
      router.replace("/home");
    }
  }, [isLoaded]);

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF8F3", alignItems: "center", justifyContent: "center" }}>
      <RingLoader color={NAVY} size={120} />
    </View>
  );
}
