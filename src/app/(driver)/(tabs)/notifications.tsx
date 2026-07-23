import { useEffect, useMemo } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useStaggeredEntrance } from "@/hooks/useStaggeredEntrance";
import { useNotificationStore, type Notification } from "@/store/useNotificationStore";

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
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();

  const unread = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  useEffect(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PEACH }} edges={["top"]}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={NAVY} />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerRight}>
          {unread > 0 && (
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EAE1D9",
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
