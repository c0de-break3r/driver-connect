import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OnboardingScreen } from "./_components/OnboardingScreen";
import { router } from "expo-router";

export default function MilestoneScreen() {
  return (
    <OnboardingScreen
      title="You're ready to go!"
      subtitle="Your account is set up. Enable notifications to stay updated on bookings and messages."
      showSkip={false}
      nextLabel="Enable Notifications"
      onNext={() => router.push("/(onboarding)/permissions")}
    />
  );
}
