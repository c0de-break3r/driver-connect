import { OnboardingScreen } from "./_components/OnboardingScreen";
import { router } from "expo-router";

export default function WelcomeScreen() {
  return (
    <OnboardingScreen
      title="Welcome to Driver Connect"
      subtitle="Your trusted platform for booking verified drivers and vehicles across Africa."
      showSkip={true}
      nextLabel="Get Started"
      onNext={() => router.push("/(onboarding)/problem")}
    />
  );
}
