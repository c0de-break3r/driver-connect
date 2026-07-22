import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton } from "@/components/ui";

export default function DriverSignupSuccessScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>✓</Text>
        </View>
        <Text style={styles.title}>Account Created!</Text>
        <Text style={styles.subtitle}>
          Welcome aboard! Your driver account is almost ready. Complete your
          profile to start finding jobs.
        </Text>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          title="Complete Profile"
          onPress={() => router.replace("/(onboarding)/welcome" as any)}
        />
        <Pressable
          style={styles.skipButton}
          onPress={() => router.replace("/(onboarding)/welcome" as any)}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF8F3",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  icon: {
    fontSize: 40,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2C3E5B",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 16,
    color: "#6E7E91",
    fontWeight: "500",
  },
});
