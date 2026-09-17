import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OnboardingScreen } from "./_components/OnboardingScreen";
import { router } from "expo-router";

export default function DriverIdentityScreen() {
  return (
    <OnboardingScreen
      title="Driver Verification"
      subtitle="To ensure safety and trust, we need to verify your identity. You'll need your ID, driving license, and a selfie."
      showSkip={true}
      nextLabel="Continue"
      onNext={() => router.push("/(onboarding)/driver-availability")}
    />
  );
}
