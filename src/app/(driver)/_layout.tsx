import { Stack, Redirect } from "expo-router";
import { useAuth } from "@clerk/expo";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useRoleStore } from "@/store/useRoleStore";

export default function DriverLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const role = useRoleStore((s) => s.role);

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    const href = role === "driver" ? "/(auth)/sign-in" : "/(onboarding)/welcome";
    return <Redirect href={href as any} />;
  }

  if (role !== "driver") {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2C3E5B" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: "slide_from_right",
      }}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#FFF8F3",
    alignItems: "center",
    justifyContent: "center",
  },
});
