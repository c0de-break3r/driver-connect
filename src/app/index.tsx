import { useEffect } from "react";
import { View } from "react-native";
import { router, useRootNavigationState } from "expo-router";

export default function Index() {
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (!rootNavigationState?.key) {
      return;
    }

    router.replace("/home");
  }, [rootNavigationState?.key]);

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }} />
  );
}
