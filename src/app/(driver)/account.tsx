import { Image } from "expo-image";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Animated,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";

import { useClerk } from "@clerk/expo";
import { useSessionStore } from "@/store/useSessionStore";
import { useStaggeredEntrance } from "@/hooks/useStaggeredEntrance";
import { useDriverOnboardingStore } from "@/store/useDriverOnboardingStore";
import { useOnboardingAnswersStore } from "@/store/useOnboardingAnswersStore";
import { useRoleStore } from "@/store/useRoleStore";

const NAVY = "#2C3E5B";
const ORANGE = "#FF7B54";
const PEACH = "#FFF8F3";

type SettingItem = {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export default function AccountScreen() {
  const entrance = useStaggeredEntrance();
  const clerk = useClerk();
  const setSelfieCapture = useDriverOnboardingStore((s) => s.setSelfieCapture);
  const onboardingSelfieUri = useDriverOnboardingStore((s) => s.selfieUri);
  const [profileUri, setProfileUri] = useState<string | null>(onboardingSelfieUri || null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const handleLogout = async () => {
    await clerk.signOut();
    useSessionStore.getState().clearSession();
  };

  const confirmDelete = async () => {
    try {
      if (typeof (clerk as any).deleteUser === "function") {
        await (clerk as any).deleteUser();
      } else if ((clerk as any).user?.delete) {
        await (clerk as any).user.delete();
      } else {
        await clerk.signOut();
      }
    } catch (error) {
      console.error("Delete account failed:", error);
      Alert.alert("Error", "Failed to delete account. Please try again.");
      return;
    } finally {
      setDeleteModalVisible(false);
      setDeleteConfirmText("");
    }

    useRoleStore.getState().reset();
    useOnboardingAnswersStore.getState().reset();
    useDriverOnboardingStore.getState().reset();

    router.replace("/(onboarding)/welcome");
  };

  const items: SettingItem[] = [
    { title: "Edit Profile", subtitle: "Name, photo, bio", icon: "person-outline" },
    { title: "Change Email", subtitle: "Update email address", icon: "mail-outline" },
    { title: "Change Phone", subtitle: "Update phone number", icon: "call-outline" },
    { title: "License Details", subtitle: "Class, number, expiry", icon: "card-outline" },
    { title: "Bank Account", subtitle: "Payout preferences", icon: "wallet-outline" },
  ];

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setProfileUri(uri);
      setSelfieCapture(uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PEACH }} edges={["top"]}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={NAVY} />
        </Pressable>
        <Text style={styles.headerTitle}>Account</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.avatarSection,
            {
              opacity: entrance.iconOpacity,
              transform: [{ scale: entrance.iconScale }],
            },
          ]}
        >
          <Pressable style={styles.avatarWrap} onPress={handlePickImage}>
            {profileUri ? (
              <Image
                source={{ uri: profileUri }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={32} color={NAVY} />
              </View>
            )}
            <View style={styles.avatarBadge}>
              <Ionicons name="camera" size={14} color="#FFFFFF" />
            </View>
          </Pressable>
          <Text style={styles.avatarLabel}>Tap to change photo</Text>
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
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
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

        <Animated.View
          style={[
            styles.dangerZone,
            {
              opacity: entrance.formOpacity,
              transform: [{ translateY: entrance.formTranslateY }],
            },
          ]}
        >
          <Pressable
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color={NAVY} />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </Pressable>
          <Pressable
            style={styles.deleteButton}
            onPress={() => setDeleteModalVisible(true)}
          >
            <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
            <Text style={styles.deleteButtonText}>Delete Account Permanently</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>

      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Delete Account</Text>
              <Text style={styles.modalMessage}>
                This action is permanent and cannot be undone. To confirm, type{" "}
                <Text style={styles.confirmHighlight}>DELETE MY ACCOUNT</Text> in
                the box below.
              </Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Type DELETE MY ACCOUNT"
                placeholderTextColor="#6E7E91"
                value={deleteConfirmText}
                onChangeText={setDeleteConfirmText}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              <View style={styles.modalActions}>
                <Pressable
                  style={styles.modalCancelButton}
                  onPress={() => {
                    setDeleteModalVisible(false);
                    setDeleteConfirmText("");
                  }}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.modalDeleteButton,
                    deleteConfirmText !== "DELETE MY ACCOUNT" && styles.modalDeleteButtonDisabled,
                  ]}
                  onPress={confirmDelete}
                  disabled={deleteConfirmText !== "DELETE MY ACCOUNT"}
                >
                  <Text style={styles.modalDeleteText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    gap: 20,
  },
  avatarSection: {
    alignItems: "center",
    marginTop: 12,
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EAE1D9",
  },
  avatarBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: PEACH,
  },
  avatarLabel: {
    marginTop: 10,
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
  dangerZone: {
    gap: 12,
    marginTop: 8,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EAE1D9",
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#EF4444",
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    gap: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: NAVY,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 14,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 20,
  },
  confirmHighlight: {
    fontWeight: "800",
    color: "#EF4444",
  },
  modalInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EAE1D9",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: NAVY,
    backgroundColor: "#F7F4F1",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EAE1D9",
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
  },
  modalDeleteButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EF4444",
  },
  modalDeleteButtonDisabled: {
    backgroundColor: "#F7F4F1",
    borderColor: "#EAE1D9",
  },
  modalDeleteText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#EF4444",
  },
});
