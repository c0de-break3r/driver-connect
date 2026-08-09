import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const NAVY = "#2C3E5B";

export default function OwnerCalendarScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
      </ScrollView>

      <View style={styles.bottomNav}>
        <NavItem icon="bookmark-outline" label="Today" onPress={() => router.replace("/(owner)" as any)} />
        <NavItem icon="calendar" label="Calendar" active onPress={() => {}} />
        <NavItem icon="square-outline" label="Listings" onPress={() => router.push("/owner/listings" as any)} />
        <NavItem icon="chatbubble-ellipses-outline" label="Messages" onPress={() => router.push("/owner/messages" as any)} />
        <NavItem icon="menu-outline" label="Menu" onPress={() => router.push("/owner/menu" as any)} />
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
    paddingBottom: 100,
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
