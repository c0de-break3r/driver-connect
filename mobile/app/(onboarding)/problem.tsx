import { OnboardingScreen } from "./_components/OnboardingScreen";
import { router } from "expo-router";

export default function ProblemScreen() {
  return (
    <OnboardingScreen
      title="Finding reliable transport shouldn't be this hard"
      subtitle="Unverified drivers, hidden fees, and last-minute cancellations make travel stressful. We're here to change that."
      showSkip={true}
      nextLabel="See How"
      onNext={() => router.push("/(onboarding)/solution")}
    />
  );
}
