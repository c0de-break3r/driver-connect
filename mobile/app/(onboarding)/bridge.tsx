import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OnboardingScreen } from "./_components/OnboardingScreen";
import { router } from "expo-router";

export default function BridgeScreen() {
  return (
    <OnboardingScreen
      title="Almost there"
      subtitle="Just a few more steps to complete your profile and start using Driver Connect."
      showSkip={false}
      nextLabel="Continue"
      onNext={() => router.push("/(onboarding)/reflection")}
    />
  );
}
