import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoleStore } from "@/store/useRoleStore";

type AppState = {
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  hasSeenWelcome: boolean;
  setHasSeenWelcome: (seen: boolean) => void;
  unreadNotificationCount: number;
  setUnreadNotificationCount: (count: number | ((prev: number) => number)) => void;
  avatarUriByRole: Record<string, string | null>;
  setAvatarUri: (uri: string | null) => void;
  profileSetupCompleteByRole: Record<string, boolean>;
  setProfileSetupComplete: (complete: boolean) => void;
  reset: () => void;
};

const initialState = {
  notificationsEnabled: true,
  hasSeenWelcome: false,
  unreadNotificationCount: 0,
  avatarUriByRole: {} as Record<string, string | null>,
  profileSetupCompleteByRole: {} as Record<string, boolean>,
};

export const useAppStateStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setHasSeenWelcome: (seen) => set({ hasSeenWelcome: seen }),
      setUnreadNotificationCount: (count) =>
        set((state) => ({
          unreadNotificationCount: typeof count === "function" ? (count as (prev: number) => number)(state.unreadNotificationCount) : count,
        })),
      setAvatarUri: (uri) =>
        set((state) => {
          const role = useRoleStore.getState().role;
          if (!role) return { avatarUriByRole: { ...state.avatarUriByRole, [""]: uri } };
          return { avatarUriByRole: { ...state.avatarUriByRole, [role]: uri } };
        }),
      setProfileSetupComplete: (complete) =>
        set((state) => {
          const role = useRoleStore.getState().role;
          if (!role) return { profileSetupCompleteByRole: { ...state.profileSetupCompleteByRole, [""]: complete } };
          return { profileSetupCompleteByRole: { ...state.profileSetupCompleteByRole, [role]: complete } };
        }),
      reset: () => set(initialState),
    }),
    {
      name: "africana-app-state-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export function getEffectiveAvatarUri(): string | null {
  const state = useAppStateStore.getState();
  const role = useRoleStore.getState().role;
  if (!role) return state.avatarUriByRole[""] ?? null;
  return state.avatarUriByRole[role] ?? null;
}

export function getEffectiveProfileSetupComplete(): boolean {
  const state = useAppStateStore.getState();
  const role = useRoleStore.getState().role;
  if (!role) return state.profileSetupCompleteByRole[""] ?? false;
  return state.profileSetupCompleteByRole[role] ?? false;
}
