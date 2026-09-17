import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OnboardingScreen } from "./_components/OnboardingScreen";
import { router } from "expo-router";

export default function PersonalizedInsightScreen() {
  return (
    <OnboardingScreen
      title="You're all set!"
      subtitle="Based on your preferences, we've personalized your experience. Let's get you started."
      showSkip={true}
      nextLabel="Continue"
      onNext={() => router.push("/(onboarding)/reflection")}
    />
  );
}
