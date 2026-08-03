import { useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, Pressable, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNotificationStore } from "@/store/useNotificationStore";
import { router } from "expo-router";

const NAVY = "#2C3E5B";

export default function NotificationsScreen() {
  const notifications = useNotificationStore((state) => state.notifications);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const [selected, setSelected] = useState<null | {
    title: string;
    body: string;
    receivedAt: number;
  }>(null);

  const sorted = useMemo(() => {
    return [...notifications].sort((a, b) => b.receivedAt - a.receivedAt);
  }, [notifications]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={NAVY} />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        {notifications.length > 0 && (
          <Pressable onPress={markAllAsRead} hitSlop={8} style={styles.markReadButton}>
            <Text style={styles.markReadText}>Mark all read</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.list}>
        {sorted.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptySubtitle}>
              We&apos;ll notify you about bookings, messages, and updates here.
            </Text>
          </View>
        )}

        {sorted.map((item) => (
          <Pressable
            key={item.id}
            style={styles.item}
            onPress={() =>
              setSelected({
                title: item.title,
                body: item.body,
                receivedAt: item.receivedAt,
              })
            }
          >
            <View style={styles.itemIconWrap}>
              <Ionicons name="notifications" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.itemBody}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemBodyText} numberOfLines={2}>
                {item.body}
              </Text>
              <Text style={styles.itemTime}>{formatTime(item.receivedAt)}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <Modal visible={!!selected} animationType="fade" transparent onRequestClose={() => setSelected(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setSelected(null)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>{selected?.title}</Text>
              <Pressable onPress={() => setSelected(null)} hitSlop={8}>
                <Ionicons name="close" size={22} color={NAVY} />
              </Pressable>
            </View>
            <Text style={styles.modalBody}>{selected?.body}</Text>
            <Text style={styles.modalTime}>
              {selected ? formatTime(selected.receivedAt) : ""}
            </Text>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF8F3",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
    color: NAVY,
  },
  markReadButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  markReadText: {
    fontSize: 13,
    fontWeight: "700",
    color: NAVY,
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: NAVY,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 32,
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
  itemIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: NAVY,
    alignItems: "center",
    justifyContent: "center",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    width: "100%",
    maxHeight: "80%",
  },
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    color: NAVY,
    marginRight: 12,
  },
  modalBody: {
    fontSize: 15,
    fontWeight: "500",
    color: "#374151",
    lineHeight: 22,
    marginBottom: 12,
  },
  modalTime: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
  },
});
