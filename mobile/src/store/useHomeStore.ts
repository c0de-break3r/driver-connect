import { create } from "zustand";

type HomeState = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

export const useHomeStore = create<HomeState>((set) => ({
  activeTab: "explore",
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
