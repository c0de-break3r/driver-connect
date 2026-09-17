import { create } from "zustand";

export type InAppNotification = {
  id: string;
  title: string;
  body: string;
  receivedAt: number;
};

type NotificationStore = {
  notifications: InAppNotification[];
  unreadCount: number;
  addNotification: (notification: InAppNotification) => void;
  markAllAsRead: () => void;
};

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),
  markAllAsRead: () => set({ notifications: [], unreadCount: 0 }),
}));
