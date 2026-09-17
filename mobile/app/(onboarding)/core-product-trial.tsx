import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OnboardingScreen } from "./_components/OnboardingScreen";
import { router } from "expo-router";

export default function CoreProductTrialScreen() {
  return (
    <OnboardingScreen
      title="Explore Driver Connect"
      subtitle="Browse available vehicles and drivers in your area. This is what you'll see every day."
      showSkip={false}
      nextLabel="Continue"
      onNext={() => router.push("/(onboarding)/milestone")}
    />
  );
}
