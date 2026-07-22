import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

/** The four roles a user can choose during onboarding. */
export type UserRole = "driver" | "owner" | "client" | "corporate";

type RoleState = {
  /** The selected role, null until the user picks one. */
  role: UserRole | null;
  /** Whether onboarding has been completed. */
  onboardingComplete: boolean;
  /** Set the selected role. */
  setRole: (role: UserRole) => void;
  /** Mark onboarding as complete. */
  setOnboardingComplete: (complete: boolean) => void;
  /** Reset all onboarding state (useful for logout). */
  reset: () => void;
};

const initialState = {
  role: null,
  onboardingComplete: false,
};

/**
 * Persisted store for the user's selected role.
 * Survives app restarts via AsyncStorage.
 */
export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      ...initialState,
      setRole: (role) => set({ role }),
      setOnboardingComplete: (complete) => set({ onboardingComplete: complete }),
      reset: () => set(initialState),
    }),
    {
      name: "africana-role-store",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
