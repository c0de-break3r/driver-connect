import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const NAVY = "#2C3E5B";

export default function OwnerMenuScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Menu</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity hitSlop={8}>
              <Ionicons name="notifications-outline" size={22} color={NAVY} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/profile" as any)} hitSlop={8}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>J</Text>
              </View>
            </TouchableOpacity>
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
          <MenuItem icon="person-outline" label="Become a guest" onPress={() => router.replace("/(client)" as any)} />
        </View>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.logoutRow}>
          <Ionicons name="log-out-outline" size={22} color={NAVY} />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity style={styles.switchButton}>
        <Ionicons name="swap-horizontal" size={20} color="#FFFFFF" />
        <Text style={styles.switchButtonText}>Switch to travelling</Text>
      </TouchableOpacity>

      <View style={styles.bottomNav}>
        <NavItem icon="bookmark-outline" label="Today" onPress={() => router.replace("/(owner)" as any)} />
        <NavItem icon="calendar" label="Calendar" onPress={() => router.push("/owner/calendar" as any)} />
        <NavItem icon="square-outline" label="Listings" onPress={() => router.push("/owner/listings" as any)} />
        <NavItem icon="chatbubble-ellipses-outline" label="Messages" onPress={() => router.push("/owner/messages" as any)} />
        <NavItem icon="menu" label="Menu" active onPress={() => {}} />
      </View>
    </View>
  );
}

function MenuItem({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
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
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  const color = active ? NAVY : "#9CA3AF";
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
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 120,
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
    position: "absolute",
    bottom: 88,
    left: 24,
    right: 24,
    backgroundColor: "#111827",
    paddingVertical: 16,
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
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
    paddingBottom: 24,
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
