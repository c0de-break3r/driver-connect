import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OnboardingScreen } from "./_components/OnboardingScreen";
import { router } from "expo-router";

export default function CorporateInfoScreen() {
  return (
    <OnboardingScreen
      title="Organization Setup"
      subtitle="Tell us about your company so we can set up corporate transport for your team."
      showSkip={true}
      nextLabel="Continue"
      onNext={() => router.push("/(onboarding)/reflection")}
    />
  );
}
