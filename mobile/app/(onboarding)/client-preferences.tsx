import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OnboardingScreen } from "./_components/OnboardingScreen";
import { router } from "expo-router";

export default function ClientPreferencesScreen() {
  return (
    <OnboardingScreen
      title="Your Travel Preferences"
      subtitle="Help us understand your travel needs so we can recommend the best options."
      showSkip={true}
      nextLabel="Continue"
      onNext={() => router.push("/(onboarding)/reflection")}
    />
  );
}
