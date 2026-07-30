import { create } from "zustand";

type TabVisibilityState = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  hide: () => void;
  show: () => void;
};

export const useTabVisibilityStore = create<TabVisibilityState>((set) => ({
  visible: true,
  setVisible: (visible) => set({ visible }),
  hide: () => set({ visible: false }),
  show: () => set({ visible: true }),
}));
