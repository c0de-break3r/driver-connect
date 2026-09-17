import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Button } from "@/components/ui/button";

export default function OnboardingDashboardScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Driver Connect!</Text>
        <Text style={styles.subtitle}>
          You&apos;re all set up. Start exploring vehicles, drivers, and booking options.
        </Text>

        <View style={styles.form}>
          <Button onPress={() => router.replace("/(driver)/index")} className="w-full">
            Go to Dashboard
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2C3E5B",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 32,
    textAlign: "center",
    lineHeight: 24,
  },
  form: {
    gap: 16,
  },
});
