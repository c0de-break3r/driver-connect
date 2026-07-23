import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type StreakState = {
  streak: number;
  lastActiveDate: string | null;
  totalDays: number;
  markActive: () => void;
  reset: () => void;
};

const initialState = {
  streak: 0,
  lastActiveDate: null as string | null,
  totalDays: 0,
};

function getTodayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export const useStreakStore = create<StreakState>()(
  persist(
    (set, get) => ({
      ...initialState,
      markActive: () => {
        const today = getTodayKey();
        const { lastActiveDate, streak } = get();

        if (lastActiveDate === today) return;

        const yesterday = getTodayKey(new Date(Date.now() - 86400000));
        const nextStreak = lastActiveDate === yesterday ? streak + 1 : 1;

        set({
          streak: nextStreak,
          lastActiveDate: today,
          totalDays: get().totalDays + 1,
        });
      },
      reset: () => set(initialState),
    }),
    {
      name: "africana-streak-store",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
