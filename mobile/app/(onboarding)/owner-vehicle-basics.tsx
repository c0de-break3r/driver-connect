import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OnboardingScreen } from "./_components/OnboardingScreen";
import { router } from "expo-router";

export default function OwnerVehicleBasicsScreen() {
  return (
    <OnboardingScreen
      title="Add Your Vehicle"
      subtitle="Tell us about the vehicle you want to list. You can add more details later."
      showSkip={true}
      nextLabel="Continue"
      onNext={() => router.push("/(onboarding)/reflection")}
    />
  );
}
