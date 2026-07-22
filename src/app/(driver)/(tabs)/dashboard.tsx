import { useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
  } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useStaggeredEntrance } from "@/hooks/useStaggeredEntrance";

export default function DriverDashboard() {
  const entrance = useStaggeredEntrance();
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setShowVerifyModal(false);
    }, 2000);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <Animated.View
          style={[
            styles.header,
            { opacity: entrance.headerOpacity },
          ]}
        >
          <Pressable style={styles.menuBtn} hitSlop={12}>
            <Ionicons name="menu-outline" size={26} color="#0F172A" />
          </Pressable>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <View style={styles.headerSpacer} />
        </Animated.View>

        {/* ── Profile Card ── */}
        <Animated.View
          style={[
            styles.profileCard,
            {
              opacity: entrance.formOpacity,
              transform: [{ translateY: entrance.formTranslateY }],
            },
          ]}
        >
          <View style={styles.profileHeader}>
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" }}
              style={styles.avatar}
              contentFit="cover"
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Prince Obed</Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>Level 1</Text>
              </View>
            </View>
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Online</Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Vehicle Card ── */}
        <Animated.View
          style={[
            styles.vehicleCard,
            {
              opacity: entrance.formOpacity,
              transform: [{ translateY: entrance.formTranslateY }],
            },
          ]}
        >
          <View style={styles.vehicleImageWrap}>
            <View style={styles.vehiclePlaceholder}>
              <Ionicons name="car-outline" size={64} color="#94A3B8" />
            </View>
            <View style={styles.mapPin}>
              <Ionicons name="location" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.checkBadge}>
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
            </View>
          </View>

          <Pressable
            style={styles.addVehicleBtn}
            onPress={() => {}}
          >
            <Text style={styles.addVehicleText}>Add Vehicle Info</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>

      {/* ── Verify Identity Modal ── */}
      <Modal
        visible={showVerifyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowVerifyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalIconWrap}>
              <View style={styles.modalIconBox}>
                <Ionicons name="person-outline" size={48} color="#1E3A8A" />
              </View>
            </View>

            <Text style={styles.modalTitle}>Verify your identity</Text>
            <Text style={styles.modalSubtitle}>
              Please complete face verification to become a verified driver. It
              will more trusted
            </Text>

            <Pressable
              style={styles.modalPrimaryBtn}
              onPress={handleVerify}
              disabled={verifying}
            >
              {verifying ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.modalPrimaryText}>
                  Verify your identity
                </Text>
              )}
            </Pressable>

            <Pressable onPress={() => setShowVerifyModal(false)} hitSlop={8}>
              <Text style={styles.modalSecondaryText}>I Will Do It Later</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    marginBottom: 16,
  },
  menuBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  headerSpacer: {
    width: 40,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E2E8F0",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },
  levelBadge: {
    marginTop: 4,
    alignSelf: "flex-start",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 999,
  },
  levelText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E3A8A",
  },
  onlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  onlineText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#047857",
  },
  vehicleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  },
  vehicleImageWrap: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    height: 180,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    marginBottom: 16,
  },
  vehiclePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  mapPin: {
    position: "absolute",
    top: 12,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  checkBadge: {
    position: "absolute",
    top: 12,
    right: 60,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#F8FAFC",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  addVehicleBtn: {
    backgroundColor: "#1E3A8A",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  addVehicleText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#00000066",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
    width: "100%",
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E2E8F0",
    alignSelf: "center",
    marginBottom: 20,
  },
  modalIconWrap: {
    alignItems: "center",
    marginBottom: 16,
  },
  modalIconBox: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#EFF6FF",
    borderWidth: 2,
    borderColor: "#BFDBFE",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  modalPrimaryBtn: {
    backgroundColor: "#1E3A8A",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  modalPrimaryText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  modalSecondaryText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E3A8A",
    textAlign: "center",
    paddingVertical: 8,
    textDecorationLine: "underline",
  },
});
