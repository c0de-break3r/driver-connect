import { useEffect, useRef } from "react";
import { useSessionStore } from "@/store/useSessionStore";
import { useOnboardingAnswersStore } from "@/store/useOnboardingAnswersStore";
import { useDriverOnboardingStore } from "@/store/useDriverOnboardingStore";

type UseSessionManagerParams = {
  isLoaded: boolean;
  isSignedIn: boolean | undefined;
  userId: string | null | undefined;
};

export function useSessionManager({
  isLoaded,
  isSignedIn,
  userId,
}: UseSessionManagerParams) {
  const setCurrentUser = useSessionStore((s) => s.setCurrentUser);
  const clearSession = useSessionStore((s) => s.clearSession);
  const resetOnboarding = useOnboardingAnswersStore((s) => s.reset);
  const resetDriver = useDriverOnboardingStore((s) => s.reset);

  const previousUserIdRef = useRef<string | null | undefined>(userId);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const previousUserId = previousUserIdRef.current;
    const hasUserChanged = previousUserId !== userId;

    if (hasUserChanged) {
      if (userId && isSignedIn) {
        setCurrentUser(userId);
      } else {
        clearSession();
        resetOnboarding();
        resetDriver();
      }
      previousUserIdRef.current = userId;
    }
  }, [isLoaded, isSignedIn, userId, setCurrentUser, clearSession, resetOnboarding, resetDriver]);
}
