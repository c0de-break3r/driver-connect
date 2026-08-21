import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Booking,
  WaitlistEntry,
  SlotStatus,
  DEFAULT_TIME_SLOTS,
  getSlotStatus,
  getWaitlistPosition,
  isOnWaitlist,
} from "@/lib/availability";

export { DEFAULT_TIME_SLOTS, SlotStatus };

type AvailabilityState = {
  bookings: Booking[];
  waitlist: WaitlistEntry[];
  addBooking: (booking: Omit<Booking, "id" | "createdAt">) => Booking;
  cancelBooking: (id: string) => void;
  getSlotStatus: (
    date: string,
    slotStart: string,
    slotEnd: string,
    resourceId: string,
    resourceType: "driver" | "vehicle"
  ) => SlotStatus;
  getBookingsForResource: (
    date: string,
    resourceId: string,
    resourceType: "driver" | "vehicle"
  ) => Booking[];
  joinWaitlist: (entry: Omit<WaitlistEntry, "id" | "position" | "createdAt">) => WaitlistEntry;
  leaveWaitlist: (id: string) => void;
  getWaitlistPosition: (
    date: string,
    slotStart: string,
    userId: string,
    resourceId: string,
    resourceType: "driver" | "vehicle"
  ) => number;
  isOnWaitlist: (
    date: string,
    slotStart: string,
    userId: string,
    resourceId: string,
    resourceType: "driver" | "vehicle"
  ) => boolean;
  load: () => Promise<void>;
  seedDemo: () => void;
  persist: () => Promise<void>;
};

export const useAvailabilityStore = create<AvailabilityState>((set, get) => ({
  bookings: [],
  waitlist: [],

  addBooking: (booking) => {
    const newBooking: Booking = {
      ...booking,
      id: `booking_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      createdAt: Date.now(),
    };
    set({ bookings: [...get().bookings, newBooking] });
    get().persist();
    return newBooking;
  },

  cancelBooking: (id) => {
    const bookings = get().bookings.map((b) =>
      b.id === id ? { ...b, status: "cancelled" as const } : b
    );
    set({ bookings });
    get().persist();
  },

  getSlotStatus: (date, slotStart, slotEnd, resourceId, resourceType) =>
    getSlotStatus(get().bookings, date, slotStart, slotEnd, resourceId, resourceType),

  getBookingsForResource: (date, resourceId, resourceType) => {
    const field = resourceType === "driver" ? "driverId" : "vehicleId";
    return get().bookings.filter(
      (b) =>
        b.date === date &&
        b[field] === resourceId &&
        b.status !== "cancelled" &&
        b.status !== "completed"
    );
  },

  joinWaitlist: (entry) => {
    const position =
      getWaitlistPosition(
        get().waitlist,
        entry.date,
        entry.slotStart,
        entry.userId,
        entry.driverId || entry.vehicleId || "",
        entry.driverId ? "driver" : "vehicle"
      ) + 1;

    const newEntry: WaitlistEntry = {
      ...entry,
      id: `waitlist_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      position,
      createdAt: Date.now(),
    };
    set({ waitlist: [...get().waitlist, newEntry] });
    get().persist();
    return newEntry;
  },

  leaveWaitlist: (id) => {
    const waitlist = get().waitlist.filter((w) => w.id !== id);
    set({ waitlist });
    get().persist();
  },

  getWaitlistPosition: (date, slotStart, userId, resourceId, resourceType) =>
    getWaitlistPosition(get().waitlist, date, slotStart, userId, resourceId, resourceType),

  isOnWaitlist: (date, slotStart, userId, resourceId, resourceType) =>
    isOnWaitlist(get().waitlist, date, slotStart, userId, resourceId, resourceType),

  load: async () => {
    try {
      const [storedBookings, storedWaitlist] = await AsyncStorage.multiGet([
        "africana-bookings",
        "africana-waitlist",
      ]);
      const bookings = storedBookings[1] ? JSON.parse(storedBookings[1]) : [];
      const waitlist = storedWaitlist[1] ? JSON.parse(storedWaitlist[1]) : [];
      set({ bookings, waitlist });
    } catch {
      set({ bookings: [], waitlist: [] });
    }
  },

  seedDemo: () => {
    const today = new Date().toISOString().split("T")[0];
    const demoBookings: Booking[] = [
      {
        id: "booking_demo_1",
        driverId: "d1",
        date: today,
        slotStart: "07:00",
        slotEnd: "12:30",
        status: "confirmed",
        userId: "user_demo_1",
        renterName: "Kwame",
        createdAt: Date.now() - 86400000,
      },
      {
        id: "booking_demo_2",
        driverId: "d1",
        date: today,
        slotStart: "17:30",
        slotEnd: "21:00",
        status: "confirmed",
        userId: "user_demo_2",
        renterName: "Ama",
        createdAt: Date.now() - 43200000,
      },
    ];
    set({ bookings: demoBookings });
    get().persist();
  },

  persist: async () => {
    const { bookings, waitlist } = get();
    await AsyncStorage.multiSet([
      ["africana-bookings", JSON.stringify(bookings)],
      ["africana-waitlist", JSON.stringify(waitlist)],
    ]);
  },
}));
