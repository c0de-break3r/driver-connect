import { useState, useEffect, useRef } from "react";
import { Platform } from "react-native";
import { useAuth } from "@/contexts/AuthProvider";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/lib/convexApi";
import { useNotificationStore } from "@/store/useNotificationStore";

let Notifications: typeof import("expo-notifications") | null = null;
let Device: typeof import("expo-device") | null = null;

try {
  Notifications = require("expo-notifications");
} catch (e) {
  console.log("expo-notifications not available:", e);
}

try {
  Device = require("expo-device");
} catch (e) {
  console.log("expo-device not available:", e);
}

type NotificationStatus = {
  granted: boolean;
  canAskAgain: boolean;
};

export function useNotifications() {
  const [status, setStatus] = useState<NotificationStatus | null>(null);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const { signedIn, isLoaded, userId } = useAuth();
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);
  const hasRegisteredRef = useRef(false);
  const welcomedRef = useRef(false);
  const savePushToken = useMutation((api.users as any).savePushToken);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const convexUser = useQuery(
    api.users.getByUserId,
    signedIn && userId ? { userId } : "skip"
  );

  const requestPermission = async () => {
    if (!Notifications || !Device?.isDevice) {
      return { granted: false, canAskAgain: false };
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    const granted = finalStatus === "granted";
    const canAskAgain = finalStatus === "undetermined";

    setStatus({ granted, canAskAgain });
    return { granted, canAskAgain };
  };

  const registerForPushNotifications = async () => {
    if (!Notifications || !Device?.isDevice || !signedIn || !userId) {
      return null;
    }

    if (hasRegisteredRef.current) {
      return null;
    }

    try {
      const { granted } = await requestPermission();
      if (!granted) {
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_EXPO_PROJECT_ID,
      });

      hasRegisteredRef.current = true;

      savePushToken({ expoPushToken: token.data }).catch((error) => {
        console.error("Failed to save push token to Convex:", error);
      });

      return token.data;
    } catch (error: any) {
      const message = typeof error?.message === "string" ? error.message : "";
      if (message.includes("googleServicesFile") || message.includes("FirebaseApp.initializeApp")) {
        console.warn("Push token registration skipped: Android FCM is not configured yet. Add `google-services.json` and set `googleServicesFile` in `app.json` to enable push notifications.");
      } else {
        console.error("Failed to register for push notifications:", error);
      }
      return null;
    }
  };

  const scheduleLocalNotification = (
    title: string,
    body: string,
    data?: Record<string, string>,
    trigger?: any
  ) => {
    if (!Notifications) {
      return Promise.resolve(null);
    }
    return Notifications.scheduleNotificationAsync({
      content: { title, body, data, sound: true, priority: Notifications.AndroidNotificationPriority.HIGH },
      trigger: trigger ?? null,
    });
  };

  const cancelAllNotifications = async () => {
    if (!Notifications) {
      return;
    }
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  const sendWelcomeNotification = async () => {
    if (!Notifications) {
      return;
    }
    if (welcomedRef.current) {
      return;
    }
    if (convexUser) {
      welcomedRef.current = true;
      return;
    }

    welcomedRef.current = true;
    await scheduleLocalNotification(
      "Welcome!",
      "You're all set. We'll notify you about new bookings and messages."
    );
  };

  useEffect(() => {
    if (!Notifications) {
      return;
    }

    if (!isLoaded || !signedIn) {
      hasRegisteredRef.current = false;
      welcomedRef.current = false;
      return;
    }

    let isCancelled = false;

    const run = async () => {
      try {
        const token = await registerForPushNotifications();
        if (!isCancelled) {
          if (token) {
            setExpoPushToken(token);
          }
          sendWelcomeNotification();
        }
      } catch {
        // non-blocking
      }
    };

    run();

    if (Notifications.addNotificationReceivedListener) {
      notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received:", notification);
        addNotification({
          id: `${Date.now()}-${Math.random()}`,
          title: notification.request.content.title || "Notification",
          body: notification.request.content.body || "",
          receivedAt: Date.now(),
        });
      });
    }

    if (Notifications.addNotificationResponseReceivedListener) {
      responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification tapped:", response);
      });
    }

    return () => {
      isCancelled = true;
      if (notificationListener.current) {
        (notificationListener.current as any).remove();
      }
      if (responseListener.current) {
        (responseListener.current as any).remove();
      }
    };
  }, [isLoaded, signedIn, userId, addNotification, convexUser]);

  useEffect(() => {
    if (!Notifications) {
      return;
    }

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    if (Platform.OS !== "android") {
      return;
    }

    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#2C3E5B",
    });
  }, []);

  return {
    status,
    expoPushToken,
    requestPermission,
    registerForPushNotifications,
    scheduleLocalNotification,
    cancelAllNotifications,
    sendWelcomeNotification,
  };
}
