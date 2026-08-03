import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type VehicleFavorite = {
  id: string;
  title: string;
  category: string;
  location: string;
  region: string;
  price: string;
  originalPrice: string;
  period: string;
  rating: number;
  image: string;
  ownerName: string;
  ownerAvatar: string;
  isVerified: boolean;
  condition: string;
  transmission: string;
  yearsOnPlatform: string;
};

export type Collection = {
  id: string;
  name: string;
  vehicleIds: string[];
  coverImage?: string;
};

type FavoriteState = {
  favorites: Record<string, boolean>;
  userEmail: string | null;
  collections: Collection[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  reset: () => void;
  loadForUser: (email: string | null) => Promise<void>;
  addVehicleToCollection: (collectionId: string, vehicleId: string) => void;
  removeVehicleFromCollection: (collectionId: string, vehicleId: string) => void;
  createCollection: (name: string) => Collection;
  renameCollection: (collectionId: string, name: string) => void;
  deleteCollection: (collectionId: string) => void;
};

export const useFavoritesStore = create<FavoriteState>((set, get) => ({
  favorites: {},
  userEmail: null,
  collections: [],

  toggleFavorite: (id) => {
    const newFavorites = { ...get().favorites, [id]: !get().favorites[id] };
    set({ favorites: newFavorites });
    const email = get().userEmail;
    if (email) {
      AsyncStorage.setItem(`africana-favorites-${email}`, JSON.stringify(newFavorites));
    }
  },

  isFavorite: (id) => !!get().favorites[id],

  reset: () => set({ favorites: {}, userEmail: null, collections: [] }),

  loadForUser: async (email) => {
    if (!email) {
      set({ favorites: {}, userEmail: null, collections: [] });
      return;
    }
    try {
      const favKey = `africana-favorites-${email}`;
      const colKey = `africana-collections-${email}`;
      const storedFav = await AsyncStorage.getItem(favKey);
      const storedCol = await AsyncStorage.getItem(colKey);
      set({
        favorites: storedFav ? JSON.parse(storedFav) : {},
        collections: storedCol ? JSON.parse(storedCol) : [],
        userEmail: email,
      });
    } catch {
      set({ favorites: {}, collections: [], userEmail: email });
    }
  },

  addVehicleToCollection: (collectionId, vehicleId) => {
    const collections = get().collections.map((c) => {
      if (c.id !== collectionId) return c;
      if (c.vehicleIds.includes(vehicleId)) return c;
      return { ...c, vehicleIds: [...c.vehicleIds, vehicleId] };
    });
    set({ collections });
    const email = get().userEmail;
    if (email) {
      AsyncStorage.setItem(`africana-collections-${email}`, JSON.stringify(collections));
    }
  },

  removeVehicleFromCollection: (collectionId, vehicleId) => {
    const collections = get().collections.map((c) => {
      if (c.id !== collectionId) return c;
      return { ...c, vehicleIds: c.vehicleIds.filter((id) => id !== vehicleId) };
    });
    set({ collections });
    const email = get().userEmail;
    if (email) {
      AsyncStorage.setItem(`africana-collections-${email}`, JSON.stringify(collections));
    }
  },

  createCollection: (name) => {
    const collection: Collection = {
      id: `col_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      name,
      vehicleIds: [],
    };
    const collections = [...get().collections, collection];
    set({ collections });
    const email = get().userEmail;
    if (email) {
      AsyncStorage.setItem(`africana-collections-${email}`, JSON.stringify(collections));
    }
    return collection;
  },

  renameCollection: (collectionId, name) => {
    const collections = get().collections.map((c) =>
      c.id === collectionId ? { ...c, name } : c
    );
    set({ collections });
    const email = get().userEmail;
    if (email) {
      AsyncStorage.setItem(`africana-collections-${email}`, JSON.stringify(collections));
    }
  },

  deleteCollection: (collectionId) => {
    const collections = get().collections.filter((c) => c.id !== collectionId);
    set({ collections });
    const email = get().userEmail;
    if (email) {
      AsyncStorage.setItem(`africana-collections-${email}`, JSON.stringify(collections));
    }
  },
}));
