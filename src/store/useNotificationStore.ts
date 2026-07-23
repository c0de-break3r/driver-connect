import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type NotificationType = "ride_request" | "staff_request" | "system" | "payment";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
};

type NotificationState = {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
};

const initialState = {
  notifications: [
    {
      id: "1",
      type: "ride_request" as NotificationType,
      title: "New Ride Request",
      body: "Client Michael A. requested a ride from East Legon to Kotoka Airport.",
      timestamp: Date.now() - 1000 * 60 * 5,
      read: false,
    },
    {
      id: "2",
      type: "staff_request" as NotificationType,
      title: "Staff Transfer Request",
      body: "Corporate client ABC Ltd requests 2 drivers for staff shuttle this Friday.",
      timestamp: Date.now() - 1000 * 60 * 45,
      read: false,
    },
  ] as Notification[],
  unreadCount: 2,
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      ...initialState,
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: Date.now().toString(),
          timestamp: Date.now(),
          read: false,
        };
        set({
          notifications: [newNotification, ...get().notifications],
          unreadCount: get().unreadCount + 1,
        });
      },
      markAsRead: (id) => {
        set({
          notifications: get().notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
          unreadCount: Math.max(0, get().unreadCount - 1),
        });
      },
      markAllAsRead: () => {
        set({
          notifications: get().notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        });
      },
      clearAll: () => {
        set({
          notifications: [],
          unreadCount: 0,
        });
      },
    }),
    {
      name: "africana-notification-store",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
