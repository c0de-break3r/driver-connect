import { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const NAVY = "#2C3E5B";

type Tab = "today" | "upcoming";

export default function OwnerDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("today");

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "today" && styles.tabActive]}
            onPress={() => setActiveTab("today")}
          >
            <Text style={[styles.tabText, activeTab === "today" && styles.tabTextActive]}>
              Today
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "upcoming" && styles.tabActive]}
            onPress={() => setActiveTab("upcoming")}
          >
            <Text style={[styles.tabText, activeTab === "upcoming" && styles.tabTextActive]}>
              Upcoming
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.emptyState}>
          <View style={styles.illustrationWrap}>
            <Ionicons name="calendar-outline" size={120} color="#2C3E5B" />
          </View>
          <Text style={styles.emptyTitle}>You don&apos;t have any reservations</Text>
          <Text style={styles.emptySubtitle}>
            To get booked, you&apos;ll need to complete and publish your listing.
          </Text>
          <TouchableOpacity style={styles.ctaButton} onPress={() => router.push("/create-listing" as any)}>
            <Text style={styles.ctaButtonText}>Complete your listing</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <NavItem icon="today-outline" label="Today" active={activeTab === "today"} onPress={() => setActiveTab("today")} />
        <NavItem icon="calendar-outline" label="Calendar" />
        <NavItem icon="cube-outline" label="Listings" onPress={() => router.push("/owner/listings" as any)} />
        <NavItem icon="chatbubble-ellipses-outline" label="Messages" />
        <NavItem icon="menu-outline" label="Menu" />
      </View>
    </View>
  );
}

function NavItem({
  icon,
  label,
  active,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <Ionicons name={icon} size={22} color={active ? NAVY : "#9CA3AF"} />
      <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flex: 1,
    paddingTop: Platform.select({ ios: 60, android: 40 }),
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    padding: 4,
    marginBottom: 32,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: "#2C3E5B",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6B7280",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  illustrationWrap: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: NAVY,
    textAlign: "center",
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  ctaButton: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  ctaButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
  },
  bottomNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#FFFFFF",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
    paddingVertical: 10,
    paddingBottom: Platform.select({ ios: 20, android: 16 }),
    paddingHorizontal: 12,
  },
  navItem: {
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  navLabelActive: {
    color: NAVY,
  },
});
