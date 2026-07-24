import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type LatLng = {
  latitude: number;
  longitude: number;
};

export type RideRequest = {
  id: string;
  pickup: string;
  dropoff: string;
  price: string;
  duration: string;
  passengers: string;
  distance: string;
};

type DriverMapState = {
  driverLocation: LatLng | null;
  isOnline: boolean;
  rideRequests: RideRequest[];
  searchQuery: string;
  selectedDestination: LatLng | null;
  setDriverLocation: (location: LatLng | null) => void;
  toggleOnline: () => void;
  addRideRequest: (request: RideRequest) => void;
  acceptRideRequest: (id: string) => void;
  declineRideRequest: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedDestination: (destination: LatLng | null) => void;
};

const initialState = {
  driverLocation: null,
  isOnline: false,
  rideRequests: [],
  searchQuery: "",
  selectedDestination: null,
};

export const useDriverMapStore = create<DriverMapState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setDriverLocation: (location) => set({ driverLocation: location }),
      toggleOnline: () =>
        set((state) => ({ isOnline: !state.isOnline })),
      addRideRequest: (request) =>
        set((state) => ({
          rideRequests: [request, ...state.rideRequests],
        })),
      acceptRideRequest: (id) =>
        set((state) => ({
          rideRequests: state.rideRequests.filter((r) => r.id !== id),
        })),
      declineRideRequest: (id) =>
        set((state) => ({
          rideRequests: state.rideRequests.filter((r) => r.id !== id),
        })),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedDestination: (destination) =>
        set({ selectedDestination: destination }),
    }),
    {
      name: "africana-driver-map-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isOnline: state.isOnline,
        rideRequests: state.rideRequests,
        searchQuery: state.searchQuery,
      }),
    }
  )
);
