import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type RecentlyViewedVehicle = {
  id: string;
  title: string;
  category: string;
  location: string;
  region: string;
  price: string;
  pricePerDay: number;
  rating: number;
  reviewCount: number;
  image: string;
  isVerified: boolean;
  condition: string;
  transmission: string;
  viewedAt: number;
};

export type SearchHistoryItem = {
  id: string;
  query: string;
  location?: string;
  timestamp: number;
};

type RecentlyViewedState = {
  recentlyViewed: RecentlyViewedVehicle[];
  searchHistory: SearchHistoryItem[];
  userEmail: string | null;
  addRecentlyViewed: (vehicle: Omit<RecentlyViewedVehicle, "viewedAt">) => void;
  addSearchHistory: (item: Omit<SearchHistoryItem, "id" | "timestamp">) => void;
  clearRecentlyViewed: () => void;
  clearSearchHistory: () => void;
  reset: () => void;
  loadForUser: (email: string | null) => Promise<void>;
};

const MAX_RECENTLY_VIEWED = 20;
const MAX_SEARCH_HISTORY = 10;

export const useRecentlyViewedStore = create<RecentlyViewedState>((set, get) => ({
  recentlyViewed: [],
  searchHistory: [],
  userEmail: null,

  addRecentlyViewed: (vehicle) => {
    const entry: RecentlyViewedVehicle = {
      ...vehicle,
      viewedAt: Date.now(),
    };
    const existing = get().recentlyViewed.filter((v) => v.id !== vehicle.id);
    const updated = [entry, ...existing].slice(0, MAX_RECENTLY_VIEWED);
    set({ recentlyViewed: updated });
    const email = get().userEmail;
    if (email) {
      AsyncStorage.setItem(`africana-recently-viewed-${email}`, JSON.stringify(updated));
    }
  },

  addSearchHistory: (item) => {
    const entry: SearchHistoryItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: Date.now(),
    };
    const existing = get().searchHistory.filter((s) => s.query !== item.query);
    const updated = [entry, ...existing].slice(0, MAX_SEARCH_HISTORY);
    set({ searchHistory: updated });
    const email = get().userEmail;
    if (email) {
      AsyncStorage.setItem(`africana-search-history-${email}`, JSON.stringify(updated));
    }
  },

  clearRecentlyViewed: () => {
    set({ recentlyViewed: [] });
    const email = get().userEmail;
    if (email) {
      AsyncStorage.removeItem(`africana-recently-viewed-${email}`);
    }
  },

  clearSearchHistory: () => {
    set({ searchHistory: [] });
    const email = get().userEmail;
    if (email) {
      AsyncStorage.removeItem(`africana-search-history-${email}`);
    }
  },

  reset: () => set({ recentlyViewed: [], searchHistory: [], userEmail: null }),

  loadForUser: async (email) => {
    if (!email) {
      set({ recentlyViewed: [], searchHistory: [], userEmail: null });
      return;
    }
    try {
      const recentKey = `africana-recently-viewed-${email}`;
      const searchKey = `africana-search-history-${email}`;
      const storedRecent = await AsyncStorage.getItem(recentKey);
      const storedSearch = await AsyncStorage.getItem(searchKey);
      set({
        recentlyViewed: storedRecent ? JSON.parse(storedRecent) : [],
        searchHistory: storedSearch ? JSON.parse(storedSearch) : [],
        userEmail: email,
      });
    } catch {
      set({ recentlyViewed: [], searchHistory: [], userEmail: email });
    }
  },
}));
