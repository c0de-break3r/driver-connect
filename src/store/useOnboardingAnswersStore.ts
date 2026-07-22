import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** Ordered list of onboarding screens for progress tracking. */
export const ONBOARDING_SCREENS = ["welcome", "role-question"] as const;

export type OnboardingScreen = (typeof ONBOARDING_SCREENS)[number];

type OnboardingAnswersState = {
  /** Driver: years of driving experience. */
  yearsExperience: string | null;
  /** Driver: current employment status. */
  employmentStatus: "employed" | "looking" | "open" | null;
  /** Owner: number of vehicles owned. */
  vehicleCount: string | null;
  /** Owner: biggest driver-hiring pain point. */
  ownerPainPoint: "trust" | "availability" | "cost" | "no-shows" | null;
  /** Client: preferred occasion type. */
  preferredOccasionType: string | null;
  /** Client: booking frequency. */
  bookingFrequency: "occasional" | "regular" | null;
  /** Corporate: organization size. */
  orgSize: string | null;
  /** Corporate: biggest outsourcing challenge. */
  corporateChallenge: "cost" | "reliability" | "compliance" | "scale" | null;
  /** User's commitment level from Act 3. */
  commitment:
    | "extremely"
    | "very"
    | "moderately"
    | "somewhat"
    | "trying"
    | null;
  /** The furthest screen the user has completed. */
  lastCompletedScreen: OnboardingScreen | null;
  /** Set driver-specific answers. */
  setDriverAnswers: (
    years: string,
    status: "employed" | "looking" | "open",
  ) => void;
  /** Set owner-specific answers. */
  setOwnerAnswers: (
    count: string,
    painPoint: "trust" | "availability" | "cost" | "no-shows",
  ) => void;
  /** Set client-specific answers. */
  setClientAnswers: (
    occasion: string,
    frequency: "occasional" | "regular",
  ) => void;
  /** Set corporate-specific answers. */
  setCorporateAnswers: (
    size: string,
    challenge: "cost" | "reliability" | "compliance" | "scale",
  ) => void;
  /** Set the user's commitment level. */
  setCommitment: (
    level: "extremely" | "very" | "moderately" | "somewhat" | "trying",
  ) => void;
  /** Mark a screen as completed (advances progress). */
  setLastCompletedScreen: (screen: OnboardingScreen) => void;
  /** Reset all onboarding answers (useful for logout / restart). */
  reset: () => void;
};

const initialState = {
  yearsExperience: null,
  employmentStatus: null as "employed" | "looking" | "open" | null,
  vehicleCount: null,
  ownerPainPoint: null as "trust" | "availability" | "cost" | "no-shows" | null,
  preferredOccasionType: null,
  bookingFrequency: null as "occasional" | "regular" | null,
  orgSize: null,
  corporateChallenge: null as
    | "cost"
    | "reliability"
    | "compliance"
    | "scale"
    | null,
  commitment: null as
    | "extremely"
    | "very"
    | "moderately"
    | "somewhat"
    | "trying"
    | null,
  lastCompletedScreen: null as OnboardingScreen | null,
};

/**
 * Persisted store for the user's onboarding answers.
 * throughout the rest of onboarding.
 */
export const useOnboardingAnswersStore = create<OnboardingAnswersState>()(
  persist(
    (set) => ({
      ...initialState,
      setDriverAnswers: (yearsExperience, employmentStatus) =>
        set({ yearsExperience, employmentStatus }),
      setOwnerAnswers: (vehicleCount, ownerPainPoint) =>
        set({ vehicleCount, ownerPainPoint }),
      setClientAnswers: (preferredOccasionType, bookingFrequency) =>
        set({ preferredOccasionType, bookingFrequency }),
      setCorporateAnswers: (orgSize, corporateChallenge) =>
        set({ orgSize, corporateChallenge }),
      setCommitment: (commitment) => set({ commitment }),
      setLastCompletedScreen: (lastCompletedScreen) =>
        set((state) => {
          const currentIdx = state.lastCompletedScreen
            ? ONBOARDING_SCREENS.indexOf(state.lastCompletedScreen)
            : -1;
          const newIdx = ONBOARDING_SCREENS.indexOf(lastCompletedScreen);
          // Only advance, never go backwards
          if (newIdx > currentIdx) {
            return { lastCompletedScreen };
          }
          return {};
        }),
      reset: () => set(initialState),
    }),
    {
      name: "africana-onboarding-answers",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
