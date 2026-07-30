import { useMemo, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Animated,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";

import { useStaggeredEntrance } from "@/hooks/useStaggeredEntrance";
import { useDriverOnboardingStore } from "@/store/useDriverOnboardingStore";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";

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
  { title: "Account", subtitle: "Profile, email, phone", icon: "person-outline", route: "/(driver)/account" },
  { title: "Vehicles", subtitle: "Manage your vehicles", icon: "car-outline", route: "/(driver)/add-vehicle" },
  { title: "Verification", subtitle: "ID and documents", icon: "shield-checkmark-outline", route: "/(driver)/verify-identity" },
  { title: "Payments", subtitle: "Wallet and payouts", icon: "wallet-outline", route: "/(driver)/(tabs)/wallet" },
  { title: "Notifications", subtitle: "Ride and staff alerts", icon: "notifications-outline", route: "/(driver)/notifications" },
  { title: "Privacy & Security", subtitle: "Password, permissions", icon: "lock-closed-outline", route: "/(driver)/privacy-security" },
  { title: "Support", subtitle: "Help center and contact", icon: "help-circle-outline", route: "/(driver)/support" },
  { title: "About", subtitle: "Version, terms, privacy", icon: "information-circle-outline", route: "/(driver)/about" },
];

export default function SettingsScreen() {
  const entrance = useStaggeredEntrance();
  const navigatingRef = useRef(false);
  const { fullLegalName, profileImageUri, setProfileImageUri } = useDriverOnboardingStore();
  const [changingImage, setChangingImage] = useState(false);

  const displayName = fullLegalName?.trim() || "Driver";
  const items = useMemo(() => SETTINGS_ITEMS, []);

  const handlePress = (item: SettingItem) => {
    if (!item.route) return;
    router.push(item.route as any);
  };

  const handleBack = async () => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/(driver)/(tabs)/dashboard");
    }
    setTimeout(() => {
      navigatingRef.current = false;
    }, 300);
  };

  const handleChangePhoto = async () => {
    if (changingImage) return;
    setChangingImage(true);
    await impactAsync(ImpactFeedbackStyle.Light);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert("Permission required", "Please allow access to your photos to update your profile image.");
      setChangingImage(false);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImageUri(result.assets[0].uri);
    }
    setChangingImage(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PEACH }} edges={["top"]}>
<<<<<<< HEAD
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={NAVY} />
=======
      <View style={styles.fixedHeader}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={NAVY} />
>>>>>>> 33eb3cd (updates)
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerRight} />
      </View>

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
          <Pressable onPress={handleChangePhoto} style={styles.profileImageWrap}>
            {profileImageUri ? (
              <Image source={{ uri: profileImageUri }} style={styles.profileImage} contentFit="cover" />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={32} color={NAVY} />
              </View>
            )}
            <View style={styles.profileImageBadge}>
              <Ionicons name="camera" size={14} color="#FFFFFF" />
            </View>
          </Pressable>
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
              <Ionicons name="chevron-forward" size={18} color="#6E7E91" />
            </Pressable>
          ))}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fixedHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
    backgroundColor: PEACH,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#EAE1D9",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
<<<<<<< HEAD
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
=======
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EAE1D9",
>>>>>>> 33eb3cd (updates)
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
  profileCard: {
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EAE1D9",
  },
  profileImageWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EAE1D9",
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  profileImagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PEACH,
  },
  profileImageBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  profileName: {
    fontSize: 17,
    fontWeight: "700",
    color: NAVY,
  },
  profileRole: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6E7E91",
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
