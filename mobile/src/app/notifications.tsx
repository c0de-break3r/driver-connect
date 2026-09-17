import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import NotificationInbox from "@/components/NotificationInbox";

const NAVY = "#2C3E5B";

export default function NotificationsScreen() {
  const router = useRouter();
  const [inboxVisible, setInboxVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={NAVY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={() => router.push("/notification-settings" as any)} hitSlop={8} style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={22} color={NAVY} />
        </TouchableOpacity>
      </View>

      <View style={styles.placeholder}>
        <TouchableOpacity style={styles.openInboxButton} onPress={() => setInboxVisible(true)}>
          <Ionicons name="notifications" size={28} color="#FFFFFF" />
          <Text style={styles.openInboxText}>View your notifications</Text>
        </TouchableOpacity>
      </View>

      <NotificationInbox
        visible={inboxVisible}
        onClose={() => setInboxVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
  settingsButton: {
    padding: 8,
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  openInboxButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: NAVY,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  openInboxText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
