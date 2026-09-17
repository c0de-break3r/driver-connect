import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OnboardingScreen } from "./_components/OnboardingScreen";
import { router } from "expo-router";

export default function ReflectionScreen() {
  return (
    <OnboardingScreen
      title="You're on the right track"
      subtitle="Complete your profile to unlock all features and start booking or listing vehicles."
      showSkip={false}
      nextLabel="Complete Profile"
      onNext={() => router.push("/(onboarding)/account-creation")}
    />
  );
}
