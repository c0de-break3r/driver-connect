import { useMemo } from "react";
import {
  Animated,
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
import { useDriverOnboardingStore } from "@/store/useDriverOnboardingStore";

const NAVY = "#2C3E5B";
const ORANGE = "#FF7B54";
const PEACH = "#FFF8F3";
const WHITE = "#FFFFFF";
const MUTED = "#6E7E91";
const BORDER = "#EAE1D9";

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

export default function AccountScreen() {
  const entrance = useStaggeredEntrance();
  const { fullLegalName, profileImageUri } = useDriverOnboardingStore();
  const displayName = fullLegalName?.trim() || "Driver";

  const items = useMemo(() => SETTINGS_ITEMS, []);

  const handlePress = (item: SettingItem) => {
    if (!item.route) return;
    router.push(item.route as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PEACH }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.profileCard,
            {
              opacity: entrance.headerOpacity,
              transform: [{ translateY: entrance.headerTranslateY }],
            },
          ]}
        >
          <View style={styles.profileImageWrap}>
            {profileImageUri ? (
              <Ionicons name="person" size={32} color={NAVY} />
            ) : (
              <Ionicons name="person" size={32} color={NAVY} />
            )}
          </View>
          <Text style={styles.profileName}>{displayName}</Text>
          <Text style={styles.profileRole}>Driver</Text>
        </Animated.View>

        <Animated.View
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
              <Ionicons name="chevron-forward" size={18} color={MUTED} />
            </Pressable>
          ))}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 16,
  },
  profileCard: {
    alignItems: "center",
    gap: 12,
    backgroundColor: WHITE,
    borderRadius: 20,
    paddingVertical: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
  },
  profileImageWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: PEACH,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
  },
  profileName: {
    fontSize: 17,
    fontWeight: "700",
    color: NAVY,
  },
  profileRole: {
    fontSize: 13,
    fontWeight: "600",
    color: MUTED,
  },
  list: {
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: WHITE,
    padding: 14,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
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
    color: MUTED,
  },
});
