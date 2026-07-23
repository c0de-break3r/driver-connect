import { useMemo } from "react";
import {
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

const NAVY = "#2C3E5B";
const ORANGE = "#FF7B54";
const PEACH = "#FFF8F3";

type SettingItem = {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  route?: string;
};

const SETTINGS_ITEMS: SettingItem[] = [
  { title: "Account", subtitle: "Profile, email, phone", icon: "person-outline" },
  { title: "Vehicles", subtitle: "Manage your vehicles", icon: "car-outline" },
  { title: "Verification", subtitle: "ID and documents", icon: "shield-checkmark-outline" },
  { title: "Payments", subtitle: "Wallet and payouts", icon: "wallet-outline" },
  { title: "Notifications", subtitle: "Ride and staff alerts", icon: "notifications-outline" },
  { title: "Privacy & Security", subtitle: "Password, permissions", icon: "lock-closed-outline" },
  { title: "Support", subtitle: "Help center and contact", icon: "help-circle-outline" },
  { title: "About", subtitle: "Version, terms, privacy", icon: "information-circle-outline" },
];

export default function SettingsScreen() {
  const entrance = useStaggeredEntrance();

  const items = useMemo(() => SETTINGS_ITEMS, []);

  const handlePress = (item: SettingItem) => {
    if (!item.route) return;
    router.push(item.route as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PEACH }} edges={["top"]}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={NAVY} />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.list,
            {
              opacity: entrance.formOpacity,
              transform: [{ translateY: entrance.formTranslateY }],
            },
          ]}
        >
          {items.map((item) => (
            <Pressable
              key={item.title}
              style={styles.card}
              onPress={() => handlePress(item)}
            >
              <View style={styles.iconWrap}>
                <Ionicons name={item.icon} size={20} color={ORANGE} />
              </View>
              <View style={styles.textWrap}>
                <Text style={styles.title}>{item.title}</Text>
                {!!item.subtitle && (
                  <Text style={styles.subtitle}>{item.subtitle}</Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={18} color="#6E7E91" />
            </Pressable>
          ))}
        </View>
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
    width: 40,
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
    alignItems: "center",
    gap: 14,
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EAE1D9",
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
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6E7E91",
  },
});
