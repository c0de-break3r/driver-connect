import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OnboardingScreen } from "./_components/OnboardingScreen";
import { router } from "expo-router";

export default function DriverAvailabilityScreen() {
  return (
    <OnboardingScreen
      title="Set Your Availability"
      subtitle="Tell us when you're available to drive. This helps clients find you when they need a ride."
      showSkip={true}
      nextLabel="Continue"
      onNext={() => router.push("/(onboarding)/reflection")}
    />
  );
}
