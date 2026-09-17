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

export type FavoriteItem = {
  id: string;
  title: string;
  image: string;
  price: string;
  location: string;
  rating: number;
};

export type Collection = {
  id: string;
  name: string;
  items: FavoriteItem[];
  coverImage?: string;
  tripDates?: {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
  };
};

type FavoriteState = {
  favorites: Record<string, boolean>;
  favoriteOrder: string[];
  savedItems: FavoriteItem[];
  userEmail: string | null;
  collections: Collection[];
  pendingVehicle: VehicleFavorite | null;
  favoritesViewMode: "grid" | "list";
  toggleFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  reset: () => void;
  loadForUser: (email: string | null) => Promise<void>;
  addVehicleToCollection: (collectionId: string, vehicle: VehicleFavorite) => void;
  removeVehicleFromCollection: (collectionId: string, vehicleId: string) => void;
  createCollection: (name: string) => Collection;
  renameCollection: (collectionId: string, name: string) => void;
  deleteCollection: (collectionId: string) => void;
  setPendingVehicle: (vehicle: VehicleFavorite | null) => void;
  updateCollectionTripDates: (collectionId: string, tripDates: Collection["tripDates"]) => void;
  clearPendingVehicle: () => void;
  setFavoritesViewMode: (mode: "grid" | "list") => void;
};

export const useFavoritesStore = create<FavoriteState>((set, get) => ({
  favorites: {},
  favoriteOrder: [],
  savedItems: [],
  userEmail: null,
  collections: [],
  pendingVehicle: null,
  favoritesViewMode: "grid",

  toggleFavorite: (id) => {
    const current = get().favorites[id];
    const newFavorites = { ...get().favorites, [id]: !current };
    const favoriteOrder = !current
      ? [id, ...get().favoriteOrder.filter((orderId) => orderId !== id)]
      : get().favoriteOrder.filter((orderId) => orderId !== id);
    set({ favorites: newFavorites, favoriteOrder });
    const email = get().userEmail;
    if (email) {
      AsyncStorage.setItem(`africana-favorites-${email}`, JSON.stringify(newFavorites));
      AsyncStorage.setItem(`africana-favorite-order-${email}`, JSON.stringify(favoriteOrder));
    }
  },

  removeFavorite: (id: string) => {
    const { [id]: _, ...rest } = get().favorites;
    set({ favorites: rest, favoriteOrder: get().favoriteOrder.filter((orderId) => orderId !== id) });
    const email = get().userEmail;
    if (email) {
      AsyncStorage.setItem(`africana-favorites-${email}`, JSON.stringify(rest));
      AsyncStorage.setItem(`africana-favorite-order-${email}`, JSON.stringify(get().favoriteOrder));
    }
  },

  isFavorite: (id: string) => !!get().favorites[id],

  reset: () => set({ favorites: {}, favoriteOrder: [], savedItems: [], userEmail: null, collections: [], pendingVehicle: null, favoritesViewMode: "grid" }),

  loadForUser: async (email) => {
    if (!email) {
      set({ favorites: {}, favoriteOrder: [], savedItems: [], userEmail: null, collections: [], pendingVehicle: null, favoritesViewMode: "grid" });
      return;
    }
    try {
      const favKey = `africana-favorites-${email}`;
      const colKey = `africana-collections-${email}`;
      const orderKey = `africana-favorite-order-${email}`;
      const savedKey = `africana-saved-items-${email}`;
      const storedFav = await AsyncStorage.getItem(favKey);
      const storedCol = await AsyncStorage.getItem(colKey);
      const storedOrder = await AsyncStorage.getItem(orderKey);
      const storedSaved = await AsyncStorage.getItem(savedKey);
      let collections = storedCol ? JSON.parse(storedCol) : [];
      if (Array.isArray(collections)) {
        collections = collections.map((c: any) => {
          if (Array.isArray(c.items)) return c;
          if (Array.isArray(c.vehicleIds)) {
            return { ...c, items: c.vehicleIds.map((id: string) => ({ id, title: "", image: "", price: "", location: "", rating: 0 })) };
          }
          return { ...c, items: [] };
        });
      }
      const favoriteOrder = storedOrder ? JSON.parse(storedOrder) : Object.keys(storedFav ? JSON.parse(storedFav) : {});
      set({
        favorites: storedFav ? JSON.parse(storedFav) : {},
        favoriteOrder,
        savedItems: storedSaved ? JSON.parse(storedSaved) : [],
        collections,
        userEmail: email,
        pendingVehicle: null,
        favoritesViewMode: "grid",
      });
    } catch {
      set({ favorites: {}, favoriteOrder: [], savedItems: [], collections: [], userEmail: email, pendingVehicle: null, favoritesViewMode: "grid" });
    }
  },

  addVehicleToCollection: (collectionId, vehicle) => {
    const collections = get().collections.map((c) => {
      if (c.id !== collectionId) return c;
      if (c.items.some((item) => item.id === vehicle.id)) return c;
      return { ...c, items: [...c.items, vehicle] };
    });
    const savedItems = get().savedItems.some((item) => item.id === vehicle.id)
      ? get().savedItems
      : [vehicle, ...get().savedItems];
    set({ collections, savedItems });
    const email = get().userEmail;
    if (email) {
      AsyncStorage.setItem(`africana-collections-${email}`, JSON.stringify(collections));
      AsyncStorage.setItem(`africana-saved-items-${email}`, JSON.stringify(savedItems));
    }
  },

  removeVehicleFromCollection: (collectionId, vehicleId) => {
    const collections = get().collections.map((c) => {
      if (c.id !== collectionId) return c;
      return { ...c, items: c.items.filter((item) => item.id !== vehicleId) };
    });
    const savedItems = get().savedItems.filter((item) => item.id !== vehicleId);
    const favoriteOrder = get().favoriteOrder.filter((id) => id !== vehicleId);
    set({ collections, savedItems, favoriteOrder });
    const email = get().userEmail;
    if (email) {
      AsyncStorage.setItem(`africana-collections-${email}`, JSON.stringify(collections));
      AsyncStorage.setItem(`africana-saved-items-${email}`, JSON.stringify(savedItems));
      AsyncStorage.setItem(`africana-favorite-order-${email}`, JSON.stringify(favoriteOrder));
    }
  },

  createCollection: (name) => {
    const collection: Collection = {
      id: `col_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      name,
      items: [],
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
    const collection = get().collections.find((c) => c.id === collectionId);
    const collections = get().collections.filter((c) => c.id !== collectionId);
    const deletedIds = collection?.items.map((item) => item.id) || [];
    const savedItems = get().savedItems.filter((item) => !deletedIds.includes(item.id));
    const favoriteOrder = get().favoriteOrder.filter((id) => !deletedIds.includes(id));
    set({ collections, savedItems, favoriteOrder });
    const email = get().userEmail;
    if (email) {
      AsyncStorage.setItem(`africana-collections-${email}`, JSON.stringify(collections));
      AsyncStorage.setItem(`africana-saved-items-${email}`, JSON.stringify(savedItems));
      AsyncStorage.setItem(`africana-favorite-order-${email}`, JSON.stringify(favoriteOrder));
    }
  },

  setPendingVehicle: (vehicle) => set({ pendingVehicle: vehicle }),

  updateCollectionTripDates: (collectionId, tripDates) => {
    const collections = get().collections.map((c) =>
      c.id === collectionId ? { ...c, tripDates } : c
    );
    set({ collections });
    const email = get().userEmail;
    if (email) {
      AsyncStorage.setItem(`africana-collections-${email}`, JSON.stringify(collections));
    }
  },

  clearPendingVehicle: () => set({ pendingVehicle: null }),
  setFavoritesViewMode: (mode) => set({ favoritesViewMode: mode }),
}));
