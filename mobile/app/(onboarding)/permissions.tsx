import { View, Text, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/button";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";

export default function PermissionsScreen() {
  const insets = useSafeAreaInsets();

  const handleEnableNotifications = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(driver)/index");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="notifications-outline" size={48} color="#2C3E5B" />
        </View>

        <Text style={styles.title}>Enable Notifications</Text>
        <Text style={styles.subtitle}>
          Get real-time updates on booking requests, messages, and trip reminders.
        </Text>

        <View style={styles.permissionList}>
          <View style={styles.permissionItem}>
            <Ionicons name="checkmark-circle" size={24} color="#059669" />
            <Text style={styles.permissionText}>Booking updates</Text>
          </View>
          <View style={styles.permissionItem}>
            <Ionicons name="checkmark-circle" size={24} color="#059669" />
            <Text style={styles.permissionText}>Messages from clients</Text>
          </View>
          <View style={styles.permissionItem}>
            <Ionicons name="checkmark-circle" size={24} color="#059669" />
            <Text style={styles.permissionText}>Trip reminders</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Button onPress={handleEnableNotifications} className="w-full">
            Enable Notifications
          </Button>
          <Pressable onPress={() => router.push("/(driver)/index")}>
            <Text style={styles.skipText}>Skip for now</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: "center",
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2C3E5B",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 32,
    textAlign: "center",
    lineHeight: 24,
  },
  permissionList: {
    width: "100%",
    gap: 16,
    marginBottom: 32,
  },
  permissionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
  },
  permissionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2C3E5B",
  },
  footer: {
    width: "100%",
    gap: 12,
    marginTop: "auto",
  },
  skipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
  },
});
