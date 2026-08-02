import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AppState = {
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  profileSetupComplete: boolean;
  setProfileSetupComplete: (complete: boolean) => void;
  hasSeenWelcome: boolean;
  setHasSeenWelcome: (seen: boolean) => void;
  avatarUri: string | null;
  setAvatarUri: (uri: string | null) => void;
  reset: () => void;
};

const initialState = {
  notificationsEnabled: true,
  profileSetupComplete: false,
  hasSeenWelcome: false,
  avatarUri: null,
};

export const useAppStateStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setProfileSetupComplete: (complete) => set({ profileSetupComplete: complete }),
      setHasSeenWelcome: (seen) => set({ hasSeenWelcome: seen }),
      setAvatarUri: (uri) => set({ avatarUri: uri }),
      reset: () => set(initialState),
    }),
    {
      name: "africana-app-state-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
