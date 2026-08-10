import { useState, useEffect } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useAuth } from "@/contexts/AuthProvider";
import { useRoleStore } from "@/store/useRoleStore";
import { useAppStateStore } from "@/store/useAppStateStore";
import { useNotifications } from "@/lib/notifications";
import { useNotificationStore } from "@/store/useNotificationStore";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import SwitchRoleBottomSheet from "./SwitchRoleBottomSheet";
import RoleSwitchTransition from "./RoleSwitchTransition";
import type { UserRole } from "@/store/useRoleStore";

const NAVY = "#2C3E5B";

const ROLE_LABELS: Record<string, string> = {
  driver: "Driver",
  owner: "Vehicle Owner",
  client: "Client",
  corporate: "Corporate Client",
};

type MenuItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
};

const menuItems: MenuItem[] = [
  { icon: "settings-outline", label: "Account settings" },
  { icon: "help-circle-outline", label: "Get help" },
  { icon: "person-outline", label: "View profile" },
  { icon: "hand-left-outline", label: "Privacy" },
  { icon: "people-outline", label: "Refer a host" },
  { icon: "person-add-outline", label: "Find a co-host" },
  { icon: "document-text-outline", label: "Legal" },
];

export default function ProfileScreen({
  onSwitchingRoleChange,
}: {
  onSwitchingRoleChange?: (isSwitching: boolean) => void;
}) {
  const { firstName, email, signOut } = useAuth();
  const role = useRoleStore((state) => state.role);
  const setRole = useRoleStore((state) => state.setRole);
  const avatarUri = useAppStateStore((state) => state.avatarUri);
  const setAvatarUri = useAppStateStore((state) => state.setAvatarUri);
  const unreadNotificationCount = useNotificationStore((state) => state.unreadCount);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const [showSwitchRole, setShowSwitchRole] = useState(false);
  const [switchingRole, setSwitchingRole] = useState<UserRole | null>(null);
  const [switchingFromRole, setSwitchingFromRole] = useState<UserRole | null>(null);

  useEffect(() => {
    onSwitchingRoleChange?.(!!switchingRole);
  }, [switchingRole, onSwitchingRoleChange]);

  const displayName = firstName || email?.split("@")[0] || "Guest";
  const roleLabel = role ? ROLE_LABELS[role] : "Guest";

  const handlePickAvatar = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission needed", "Please allow access to your photos to update your profile picture.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        const persistentUri = await copyImageToPersistentStorage(result.assets[0].uri);
        setAvatarUri(persistentUri);
      }
    } catch {
      Alert.alert("Error", "Unable to pick image. Please try again.");
    }
  };

  const copyImageToPersistentStorage = async (uri: string): Promise<string> => {
    const baseDir = FileSystem.documentDirectory || "";
    const destination = `${baseDir.replace(/\/?$/, "/")}avatar-${Date.now()}.jpg`;
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    await FileSystem.writeAsStringAsync(destination, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return destination;
  };

  const handleSwitchRole = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowSwitchRole(true);
  };

  const handleRoleSelected = (newRole: UserRole, formData: Record<string, string>) => {
    setSwitchingFromRole(role);
    setRole(newRole);
    setSwitchingRole(newRole);
  };

  const handleSignOut = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      useAppStateStore.getState().setHasSeenWelcome(false);
      await signOut();
      router.replace("/" as any);
    } catch {
      Alert.alert("Error", "Unable to log out. Please try again.");
    }
  };

  const handleNotificationPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/notifications");
  };

  return (
    <View style={styles.safeArea}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerSpacer} />
          <TouchableOpacity onPress={handleNotificationPress} hitSlop={8} style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={22} color={NAVY} />
            {unreadNotificationCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <TouchableOpacity onPress={handlePickAvatar} activeOpacity={0.85} style={styles.avatarContainer}>
            <View style={styles.avatarRing}>
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri, cacheKey: avatarUri }}
                  style={styles.avatar}
                  contentFit="cover"
                  transition={200}
                  onError={(e) => console.log("Avatar load error:", e.error, avatarUri)}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>{displayName.charAt(0).toUpperCase()}</Text>
                </View>
              )}
            </View>
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <Text style={styles.profileName}>{displayName}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>Guest</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.switchRoleButton} onPress={handleSwitchRole} activeOpacity={0.85}>
          <Text style={styles.switchRoleText}>Become a host</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.menuItem,
                index < menuItems.length - 1 && styles.menuItemBorder,
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconWrap}>
                <Ionicons name={item.icon} size={20} color={NAVY} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut} activeOpacity={0.7}>
          <View style={styles.logoutIconWrap}>
            <Ionicons name="power-outline" size={20} color="#E74C3C" />
          </View>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <SwitchRoleBottomSheet
        visible={showSwitchRole}
        onClose={() => setShowSwitchRole(false)}
        onSelectRole={handleRoleSelected}
        currentRole={role}
      />

      {switchingRole ? (
        <RoleSwitchTransition role={switchingRole} fromRole={switchingFromRole ?? undefined} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: Platform.select({ ios: 60, android: 40 }),
    paddingBottom: 48,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  headerSpacer: {
    flex: 1,
  },
  notificationButton: {
    padding: 8,
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#E74C3C",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  profileSection: {
    alignItems: "center",
    marginTop: 0,
    marginBottom: 24,
  },
  avatarContainer: {
    marginBottom: 16,
    position: "relative",
  },
  avatarRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E5E7EB",
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: "hidden",
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 48,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: NAVY,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    zIndex: 2,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "800",
    color: NAVY,
    marginBottom: 4,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  roleBadge: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  roleBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: NAVY,
  },
  switchRoleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: NAVY,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 24,
  },
  switchRoleText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  menuSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 32,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 4,
    gap: 16,
  },
  menuItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  menuIconWrap: {
    width: 24,
    alignItems: "center",
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: NAVY,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    marginBottom: 24,
  },
  logoutIconWrap: {
    width: 24,
    alignItems: "center",
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#E74C3C",
  },
});
