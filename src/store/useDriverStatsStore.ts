import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type StatItem = {
  label: string;
  value: string;
  icon: "car" | "people" | "star" | "briefcase";
};

type DriverStatsState = {
  stats: StatItem[];
  tripsCompleted: number;
  staffTripsCompleted: number;
  totalEarnings: number;
  averageRating: number;
  incrementTrips: (count?: number) => void;
  incrementStaffTrips: (count?: number) => void;
  addEarnings: (amount: number) => void;
  setRating: (rating: number) => void;
  reset: () => void;
};

const initialState = {
  stats: [
    { label: "Trips", value: "0", icon: "car" as const },
    { label: "Staff", value: "0", icon: "people" as const },
    { label: "Rating", value: "0.0", icon: "star" as const },
    { label: "Earnings", value: "GHS 0", icon: "briefcase" as const },
  ],
  tripsCompleted: 0,
  staffTripsCompleted: 0,
  totalEarnings: 0,
  averageRating: 0,
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
      incrementStaffTrips: (count = 1) => {
        const next = get().staffTripsCompleted + count;
        set({
          staffTripsCompleted: next,
          stats: get().stats.map((s, i) =>
            i === 1 ? { ...s, value: next.toString() } : s,
          ),
        });
      },
      addEarnings: (amount) => {
        const next = get().totalEarnings + amount;
        set({
          totalEarnings: next,
          stats: get().stats.map((s, i) =>
            i === 3 ? { ...s, value: `GHS ${next}` } : s,
          ),
        });
      },
      setRating: (rating) => {
        const rounded = Math.round(rating * 10) / 10;
        set({
          averageRating: rounded,
          stats: get().stats.map((s, i) =>
            i === 2 ? { ...s, value: rounded.toFixed(1) } : s,
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
