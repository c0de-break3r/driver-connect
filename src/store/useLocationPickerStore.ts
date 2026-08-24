import { create } from "zustand";

type LocationPickerState = {
  selectedLocation: string | null;
  selectedMode: "pickup" | "destination" | null;
  setSelectedLocation: (location: string, mode: "pickup" | "destination") => void;
  clearSelection: () => void;
};

export const useLocationPickerStore = create<LocationPickerState>((set) => ({
  selectedLocation: null,
  selectedMode: null,
  setSelectedLocation: (location, mode) => set({ selectedLocation: location, selectedMode: mode }),
  clearSelection: () => set({ selectedLocation: null, selectedMode: null }),
}));
