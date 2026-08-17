import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convexApi";
import * as Haptics from "expo-haptics";

const NAVY = "#2C3E5B";
const INACTIVE = "#9CA3AF";

const CATEGORIES = [
  { key: "trip_account", label: "Trip & account" },
  { key: "messages", label: "Messages" },
  { key: "recommendations", label: "Recommendations" },
  { key: "offers", label: "Offers" },
  { key: "news", label: "News" },
] as const;

const CHANNELS = [
  { key: "push", label: "Push", icon: "notifications" as const },
  { key: "sms", label: "SMS", icon: "chatbubble-ellipses" as const },
  { key: "email", label: "Email", icon: "mail" as const },
] as const;

type CategoryKey = (typeof CATEGORIES)[number]["key"];
type ChannelKey = (typeof CHANNELS)[number]["key"];

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const preferencesMap = useQuery(api.notifications.getNotificationPreferences);
  const setPreference = useMutation(api.notifications.setNotificationPreference);

  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());

  const handleToggle = async (category: CategoryKey, channel: ChannelKey, currentEnabled: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const toggleKey = `${category}-${channel}`;
    setSavingIds((prev) => new Set(prev).add(toggleKey));
    try {
      await setPreference({ channel, category, enabled: !currentEnabled });
    } catch {
      // silent
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(toggleKey);
        return next;
      });
    }
  };

  const isEnabled = (category: CategoryKey, channel: ChannelKey): boolean => {
    if (!preferencesMap) return true;
    const pref = preferencesMap.find(
      (p) => p.category === category && p.channel === channel
    );
    return pref ? pref.enabled : true;
  };

  if (preferencesMap === undefined) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={NAVY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notification Settings</Text>
        </View>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={NAVY} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={NAVY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionLabel}>Categories</Text>

        {CATEGORIES.map((cat) => (
          <View key={cat.key} style={styles.categoryBlock}>
            <Text style={styles.categoryLabel}>{cat.label}</Text>
            <View style={styles.channelRow}>
              {CHANNELS.map((ch) => {
                const enabled = isEnabled(cat.key, ch.key);
                const saving = savingIds.has(`${cat.key}-${ch.key}`);
                return (
                  <TouchableOpacity
                    key={ch.key}
                    style={styles.channelButton}
                    onPress={() => handleToggle(cat.key, ch.key, enabled)}
                    activeOpacity={0.7}
                    disabled={saving}
                  >
                    <Ionicons
                      name={ch.icon}
                      size={18}
                      color={enabled ? NAVY : INACTIVE}
                    />
                    <Text style={[styles.channelLabel, enabled && styles.channelLabelActive]}>
                      {ch.label}
                    </Text>
                    <View style={[styles.toggleTrack, enabled && styles.toggleTrackActive]}>
                      <View style={[styles.toggleThumb, enabled && styles.toggleThumbActive]}>
                        {enabled && (
                          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </View>
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
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: INACTIVE,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
    marginTop: 8,
  },
  categoryBlock: {
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
    marginBottom: 10,
  },
  channelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  channelButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  channelLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: INACTIVE,
  },
  channelLabelActive: {
    color: NAVY,
  },
  toggleTrack: {
    width: 36,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  toggleTrackActive: {
    backgroundColor: NAVY,
  },
  toggleThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    position: "absolute",
    left: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleThumbActive: {
    left: 18,
  },
});
