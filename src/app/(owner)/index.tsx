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

type OwnerTab = "today" | "calendar" | "listings" | "messages" | "menu";
type TodaySubTab = "today" | "upcoming";

export default function OwnerDashboard() {
  const [activeTab, setActiveTab] = useState<OwnerTab>("today");
  const [activeSubTab, setActiveSubTab] = useState<TodaySubTab>("today");

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "today" && (
          <View>
            <View style={styles.tabBar}>
              <TouchableOpacity
                style={[styles.tab, activeSubTab === "today" && styles.tabActive]}
                onPress={() => setActiveSubTab("today")}
              >
                <Text style={[styles.tabText, activeSubTab === "today" && styles.tabTextActive]}>
                  Today
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeSubTab === "upcoming" && styles.tabActive]}
                onPress={() => setActiveSubTab("upcoming")}
              >
                <Text style={[styles.tabText, activeSubTab === "upcoming" && styles.tabTextActive]}>
                  Upcoming
                </Text>
              </TouchableOpacity>
            </View>

            {activeSubTab === "today" ? (
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
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.illustrationWrap}>
                  <Ionicons name="calendar-outline" size={120} color="#2C3E5B" />
                </View>
                <Text style={styles.emptyTitle}>No upcoming reservations</Text>
                <Text style={styles.emptySubtitle}>
                  Your future bookings will appear here once you have active listings.
                </Text>
              </View>
            )}
          </View>
        )}

        {activeTab === "calendar" && (
          <View>
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>Calendars</Text>
              <TouchableOpacity hitSlop={8}>
                <Ionicons name="search" size={22} color={NAVY} />
              </TouchableOpacity>
            </View>
            <View style={styles.centerContent}>
              <Text style={styles.message}>
                When you publish a listing you&apos;ll be able to see and edit your calendar here.
              </Text>
            </View>
          </View>
        )}

        {activeTab === "listings" && (
          <View>
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>Listings</Text>
              <TouchableOpacity hitSlop={8} onPress={() => router.push("/create-listing" as any)}>
                <Ionicons name="add" size={22} color={NAVY} />
              </TouchableOpacity>
            </View>
            <View style={styles.centerContent}>
              <Text style={styles.message}>
                You don&apos;t have any listings yet. Create your first listing to start receiving bookings.
              </Text>
              <TouchableOpacity style={styles.ctaButton} onPress={() => router.push("/create-listing" as any)}>
                <Text style={styles.ctaButtonText}>Create a listing</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === "messages" && (
          <View>
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>Messages</Text>
            </View>
            <View style={styles.centerContent}>
              <Text style={styles.message}>
                Your messages will appear here. When guests inquire about your listings, you&apos;ll be able to chat with them here.
              </Text>
            </View>
          </View>
        )}

        {activeTab === "menu" && (
          <View>
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>Menu</Text>
              <View style={styles.headerActions}>
                <TouchableOpacity hitSlop={8}>
                  <Ionicons name="notifications-outline" size={22} color={NAVY} />
                </TouchableOpacity>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>J</Text>
                </View>
              </View>
            </View>

            <View style={styles.onboardingCard}>
              <View style={styles.cardImagesRow}>
                <View style={styles.cardImagePlaceholder}>
                  <Ionicons name="image-outline" size={28} color="#9CA3AF" />
                </View>
                <View style={styles.cardImagePlaceholder}>
                  <Ionicons name="image-outline" size={28} color="#9CA3AF" />
                </View>
                <View style={styles.cardImagePlaceholder}>
                  <Ionicons name="image-outline" size={28} color="#9CA3AF" />
                </View>
              </View>
              <Text style={styles.onboardingTitle}>New to Airbnb?</Text>
              <Text style={styles.onboardingSubtitle}>
                Discover tips and best practices shared by top-rated hosts.
              </Text>
              <TouchableOpacity style={styles.onboardingButton}>
                <Text style={styles.onboardingButtonText}>Get started</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.menuList}>
              <MenuItem icon="settings-outline" label="Account settings" />
              <MenuItem icon="book-outline" label="Hosting resources" />
              <MenuItem icon="help-circle-outline" label="Get help" />
              <MenuItem icon="people-outline" label="Find a co-host" />
              <MenuItem icon="add-circle-outline" label="Create a new listing" />
              <MenuItem icon="people-outline" label="Refer a host" />
              <MenuItem icon="document-text-outline" label="Legal" />
            </View>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.logoutRow}>
              <Ionicons name="log-out-outline" size={22} color={NAVY} />
              <Text style={styles.logoutText}>Log out</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.switchButton}>
              <Ionicons name="swap-horizontal" size={20} color="#FFFFFF" />
              <Text style={styles.switchButtonText}>Switch to travelling</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        <NavItem icon="today-outline" label="Today" active={activeTab === "today"} onPress={() => setActiveTab("today")} />
        <NavItem icon="calendar" label="Calendar" active={activeTab === "calendar"} onPress={() => setActiveTab("calendar")} />
        <NavItem icon="square-outline" label="Listings" active={activeTab === "listings"} onPress={() => setActiveTab("listings")} />
        <NavItem icon="chatbubble-ellipses-outline" label="Messages" active={activeTab === "messages"} onPress={() => setActiveTab("messages")} />
        <NavItem icon="menu" label="Menu" active={activeTab === "menu"} onPress={() => setActiveTab("menu")} />
      </View>
    </View>
  );
}

function MenuItem({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <TouchableOpacity style={styles.menuItem}>
      <Ionicons name={icon} size={22} color={NAVY} />
      <Text style={styles.menuItemText}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" style={{ marginLeft: "auto" }} />
    </TouchableOpacity>
  );
}

function NavItem({
  icon,
  label,
  active,
  activeColor,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  activeColor?: string;
  onPress?: () => void;
}) {
  const color = active ? (activeColor || NAVY) : "#9CA3AF";
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={[styles.navLabel, active && { color }]}>{label}</Text>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: NAVY,
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    marginTop: 120,
  },
  message: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    textAlign: "center",
    lineHeight: 24,
  },
  onboardingCard: {
    backgroundColor: "#F3F4F6",
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 24,
  },
  cardImagesRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  cardImagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  onboardingTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  onboardingSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  onboardingButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    minWidth: 180,
    alignItems: "center",
  },
  onboardingButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  menuList: {
    gap: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    gap: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
  },
  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    gap: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  switchButton: {
    backgroundColor: "#111827",
    paddingVertical: 16,
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 24,
  },
  switchButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
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
});
