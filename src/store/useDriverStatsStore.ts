import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type StatItem = {
  label: string;
  value: string;
  icon: "car" | "briefcase";
};

type DriverStatsState = {
  stats: StatItem[];
  tripsCompleted: number;
  totalEarnings: number;
  incrementTrips: (count?: number) => void;
  addEarnings: (amount: number) => void;
  reset: () => void;
};

const initialState = {
  stats: [
    { label: "Trips", value: "0", icon: "car" as const },
    { label: "Earnings", value: "GHS 0", icon: "briefcase" as const },
  ],
  tripsCompleted: 0,
  totalEarnings: 0,
};

export const useDriverStatsStore = create<DriverStatsState>()(
  persist(
    (set, get) => ({
      ...initialState,
      incrementTrips: (count = 1) => {
        const next = get().tripsCompleted + count;
        set({
          tripsCompleted: next,
          stats: get().stats.map((s, i) =>
            i === 0 ? { ...s, value: next.toString() } : s,
          ),
        });
      },
      addEarnings: (amount) => {
        const next = get().totalEarnings + amount;
        set({
          totalEarnings: next,
          stats: get().stats.map((s, i) =>
            i === 1 ? { ...s, value: `GHS ${next}` } : s,
          ),
        });
      },
      reset: () => set(initialState),
    }),
    {
      name: "africana-driver-stats-store",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
