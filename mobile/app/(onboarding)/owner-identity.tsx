import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OnboardingScreen } from "./_components/OnboardingScreen";
import { router } from "expo-router";

export default function OwnerIdentityScreen() {
  return (
    <OnboardingScreen
      title="Owner Verification"
      subtitle="To ensure safety and trust, we need to verify your identity and vehicle documents."
      showSkip={true}
      nextLabel="Continue"
      onNext={() => router.push("/(onboarding)/owner-vehicle-basics")}
    />
  );
}
