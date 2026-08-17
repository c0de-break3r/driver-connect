import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convexApi";
import EmptyState from "@/components/EmptyState";

const NAVY = "#2C3E5B";

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

type NotificationInboxProps = {
  visible: boolean;
  onClose: () => void;
};

export default function NotificationInbox({ visible, onClose }: NotificationInboxProps) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const notifications = useQuery(api.notifications.getUserNotifications);
  const markRead = useMutation(api.notifications.markNotificationRead);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(0);
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const handleNotificationPress = async (notificationId: string) => {
    await markRead({ notificationId: notificationId as any });
    handleClose();
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 0],
  });

  const opacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const sorted = notifications
    ? [...notifications].sort((a, b) => b.createdAt - a.createdAt)
    : [];

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
      pointerEvents={visible ? "auto" : "none"}
    >
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={handleClose} hitSlop={8} style={styles.closeButton}>
          <Ionicons name="close" size={22} color={NAVY} />
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={NAVY} />
        }
      >
        {sorted.length === 0 && (
          <EmptyState
            title="No notifications yet"
            subtitle="We'll notify you about bookings, messages, and updates here."
          />
        )}

        {sorted.map((item) => {
          const isUnread = !item.read && item.status !== "sent";
          return (
            <TouchableOpacity
              key={item._id}
              style={styles.item}
              onPress={() => handleNotificationPress(item._id)}
              activeOpacity={0.7}
            >
              <View style={styles.itemLeft}>
                <View style={[styles.dot, isUnread && styles.dotActive]} />
                <View style={[styles.itemIconWrap, isUnread && styles.itemIconWrapActive]}>
                  <Ionicons name="notifications" size={18} color="#FFFFFF" />
                </View>
              </View>
              <View style={styles.itemBody}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemBodyText} numberOfLines={2}>
                  {item.body}
                </Text>
                <Text style={styles.itemTime}>{timeAgo(item.createdAt)}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </Animated.ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    zIndex: 50,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
    color: NAVY,
  },
  closeButton: {
    padding: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  itemLeft: {
    alignItems: "center",
    gap: 6,
    paddingTop: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "transparent",
  },
  dotActive: {
    backgroundColor: NAVY,
  },
  itemIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#9CA3AF",
    alignItems: "center",
    justifyContent: "center",
  },
  itemIconWrapActive: {
    backgroundColor: NAVY,
  },
  itemBody: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
    marginBottom: 4,
  },
  itemBodyText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    lineHeight: 20,
  },
  itemTime: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
    marginTop: 6,
  },
});
