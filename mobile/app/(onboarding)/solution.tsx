import { OnboardingScreen } from "./_components/OnboardingScreen";
import { router } from "expo-router";

export default function SolutionScreen() {
  return (
    <OnboardingScreen
      title="Verified drivers. Transparent pricing. Secure bookings."
      subtitle="Every driver and vehicle on Driver Connect is identity-verified. Pay securely, track your ride, and travel with confidence."
      showSkip={true}
      nextLabel="Tell us about you"
      onNext={() => router.push("/(onboarding)/name")}
    />
  );
}
