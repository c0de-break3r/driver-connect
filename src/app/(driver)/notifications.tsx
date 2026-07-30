import { useCallback, useRef } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useStaggeredEntrance } from "@/hooks/useStaggeredEntrance";
import { useNotificationStore, type Notification } from "@/store/useNotificationStore";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";

const NAVY = "#2C3E5B";
const ORANGE = "#FF7B54";
const PEACH = "#FFF8F3";

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function notificationIcon(type: Notification["type"]) {
  switch (type) {
    case "ride_request":
      return "car-outline";
    case "staff_request":
      return "people-outline";
    case "payment":
      return "wallet-outline";
    default:
      return "notifications-outline";
  }
}

export default function NotificationsScreen() {
  const entrance = useStaggeredEntrance();
  const navigatingRef = useRef(false);
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotificationStore();

  useFocusEffect(
    useCallback(() => {
      markAllAsRead();
    }, [markAllAsRead])
  );

  const handleBack = async () => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;
    await impactAsync(ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/(driver)/(tabs)/dashboard");
    }
    setTimeout(() => {
      navigatingRef.current = false;
    }, 300);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PEACH }} edges={["top"]}>
<<<<<<< HEAD
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={NAVY} />
=======
      <View style={styles.fixedHeader}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={NAVY} />
>>>>>>> 33eb3cd (updates)
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerRight}>
          {unreadCount > 0 && (
            <Pressable onPress={markAllAsRead}>
              <Text style={styles.markAllText}>Mark all read</Text>
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.list,
            {
              opacity: entrance.formOpacity,
              transform: [{ translateY: entrance.formTranslateY }],
            },
          ]}
        >
          {notifications.length === 0 && (
            <View style={styles.emptyWrap}>
              <Ionicons name="notifications-off-outline" size={40} color="#6E7E91" />
              <Text style={styles.emptyText}>No notifications yet</Text>
            </View>
          )}

          {notifications.map((item) => (
            <Pressable
              key={item.id}
              style={[styles.card, !item.read && styles.cardUnread]}
              onPress={() => markAsRead(item.id)}
            >
              <View style={styles.iconWrap}>
                <Ionicons
                  name={notificationIcon(item.type)}
                  size={20}
                  color={ORANGE}
                />
              </View>
              <View style={styles.textWrap}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.body}>{item.body}</Text>
              </View>
              <View style={styles.metaWrap}>
                <Text style={styles.time}>{timeAgo(item.timestamp)}</Text>
                {!item.read && <View style={styles.unreadDot} />}
              </View>
            </Pressable>
          ))}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fixedHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
    backgroundColor: PEACH,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#EAE1D9",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
<<<<<<< HEAD
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
=======
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EAE1D9",
>>>>>>> 33eb3cd (updates)
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: NAVY,
    flex: 1,
    textAlign: "center",
  },
  headerRight: {
    width: 80,
    alignItems: "flex-end",
  },
  markAllText: {
    fontSize: 13,
    fontWeight: "600",
    color: ORANGE,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 16,
  },
  list: {
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EAE1D9",
  },
  cardUnread: {
    backgroundColor: "#FFF7ED",
    borderColor: ORANGE,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: PEACH,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: NAVY,
  },
  body: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6E7E91",
    lineHeight: 18,
  },
  metaWrap: {
    alignItems: "flex-end",
    gap: 6,
  },
  time: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6E7E91",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ORANGE,
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6E7E91",
  },
});
