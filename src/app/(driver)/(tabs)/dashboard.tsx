import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useAuth } from "@clerk/expo";

import { useStaggeredEntrance } from "@/hooks/useStaggeredEntrance";
import { Card } from "@/components/ui/card";
import { useStreakStore } from "@/store/useStreakStore";
import { useDriverStatsStore } from "@/store/useDriverStatsStore";
import { useDriverOnboardingStore } from "@/store/useDriverOnboardingStore";
import { api } from "@/lib/convexApi";
import { useQuery } from "convex/react";

const NAVY = "#2C3E5B";

export default function DriverDashboard() {
  const entrance = useStaggeredEntrance();
  const [showProfilePanel] = useState(false);
  const { isSignedIn, userId } = useAuth();
  const streak = useStreakStore((s) => s.streak);
  const stats = useDriverStatsStore((s) => s.stats);
  const {
    fullLegalName,
    licenseClass,
    licenseNumber,
    selfieUri: onboardingSelfieUri,
    preferredJobType,
    selectedVehicleType,
    verificationPipelineStatus,
  } = useDriverOnboardingStore();
  const convexUser = useQuery(api.users.getByClerkUserId, isSignedIn && userId ? { clerkUserId: userId } : "skip");
  const convexVerification = useQuery(api.verifications.getByUserId, convexUser ? { userId: convexUser._id } : "skip");
  const profileAnim = useMemo(() => new Animated.Value(0), []);

  const displayVerificationStatus = convexVerification?.status ?? verificationPipelineStatus;

  // Demo: seed some stats on first mount so the dashboard isn't empty.
  useEffect(() => {
    const store = useDriverStatsStore.getState();
    if (store.tripsCompleted === 0) {
      store.incrementTrips(12);
      store.addEarnings(1450);
    }
  }, []);

  const handleVerify = () => {
    router.push("/(driver)/verify-identity" as any);
  };

  const handleAddVehicle = () => {
    router.push("/(driver)/add-vehicle" as any);
  };

  const handleInvite = () => {
    Alert.alert("Invite Friends", "Share your referral code: DRIVE2026");
  };

  const handleSettings = () => {
    router.push("/(driver)/settings");
  };

  const handleNotifications = () => {
    router.push("/(driver)/notifications");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF8F3" }} edges={["top"]}>
      {/* ── Sticky Header ── */}
      <Animated.View
        style={[
          styles.headerRow,
          {
            opacity: entrance.headerOpacity,
            transform: [{ translateY: entrance.headerTranslateY }],
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <Pressable style={styles.iconButton} onPress={handleSettings}>
            <Ionicons name="settings-outline" size={22} color={NAVY} />
          </Pressable>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.iconButton} onPress={handleNotifications}>
            <Ionicons name="notifications-outline" size={22} color={NAVY} />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>1</Text>
            </View>
          </Pressable>
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={14} color="#FFFFFF" />
            <Text style={styles.streakText}>{streak}</Text>
          </View>
        </View>
      </Animated.View>

      {/* ── Expandable Profile Panel ── */}
      <Animated.View
        style={[
          styles.profilePanel,
          {
            opacity: profileAnim,
            transform: [
              {
                translateY: profileAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-12, 0],
                }),
              },
            ],
          },
        ]}
      >
        {showProfilePanel && (
          <Card style={styles.profilePanelCard}>
            <View style={styles.profilePanelRow}>
              <View style={styles.profilePanelAvatarWrap}>
                {onboardingSelfieUri ? (
                  <Image
                    source={{ uri: onboardingSelfieUri }}
                    style={styles.profilePanelImage}
                    contentFit="cover"
                  />
                ) : (
                  <View style={styles.profilePanelPlaceholder}>
                    <Ionicons name="person" size={28} color={NAVY} />
                  </View>
                )}
              </View>
              <View style={styles.profilePanelTextWrap}>
                <Text style={styles.profilePanelName}>
                  {fullLegalName || "Driver"}
                </Text>
                <Text style={styles.profilePanelMeta}>
                  {licenseClass ? `License Class ${licenseClass}` : "License pending"}
                </Text>
                {licenseNumber ? (
                  <Text style={styles.profilePanelMeta}>{licenseNumber}</Text>
                ) : null}
                {(preferredJobType || selectedVehicleType) && (
                  <Text style={styles.profilePanelMeta}>
                    {preferredJobType || selectedVehicleType}
                  </Text>
                )}
                <View style={styles.verificationBadge}>
                  <Ionicons
                    name={
                      displayVerificationStatus === "confirmed"
                        ? "checkmark-circle"
                        : "time-outline"
                    }
                    size={14}
                    color={
                      displayVerificationStatus === "confirmed"
                        ? "#10B981"
                        : "#6E7E91"
                    }
                  />
                  <Text
                    style={[
                      styles.verificationBadgeText,
                      displayVerificationStatus === "confirmed" &&
                        styles.verificationBadgeTextConfirmed,
                    ]}
                  >
                    {displayVerificationStatus === "confirmed"
                      ? "Verified"
                      : "Verification pending"}
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        )}
      </Animated.View>

      {/* ── Scrollable Content ── */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Quick Stats strip ── */}
        <Animated.View
          style={[
            styles.statsRow,
            {
              opacity: entrance.headerOpacity,
              transform: [{ translateY: entrance.headerTranslateY }],
            },
          ]}
        >
          {stats.flatMap((item, index) => {
            if (index === 0) {
              return [
                <View key={item.label} style={styles.statPill}>
                  <Text style={styles.statValue}>{item.value}</Text>
                  <Text style={styles.statLabel}>{item.label}</Text>
                </View>,
              ];
            }
            return [
              <View key={`${item.label}-divider`} style={styles.statDivider} />,
              <View key={item.label} style={styles.statPill}>
                <Text style={styles.statValue}>{item.value}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </View>,
            ];
          })}
        </Animated.View>

        {/* ── Vehicle Card ── */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: entrance.formOpacity,
              transform: [{ translateY: entrance.formTranslateY }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>My Vehicle</Text>
          <Card style={styles.vehicleCard}>
            <View style={styles.vehicleImageWrap}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&h=400&fit=crop",
                }}
                style={styles.vehicleImage}
                contentFit="cover"
                transition={200}
              />
              <View style={styles.vehicleOverlayTopRight}>
                <View style={styles.vehicleCheckBadge}>
                  <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                </View>
              </View>
              <View style={styles.vehicleOverlayBottomLeft}>
                <View style={styles.mapMarker}>
                  <Ionicons name="location" size={18} color="#FF7B54" />
                </View>
              </View>
            </View>
            <Pressable style={styles.primaryButton} onPress={handleAddVehicle}>
              <Text style={styles.primaryButtonText}>Add Vehicle Info</Text>
            </Pressable>
          </Card>
        </Animated.View>

        {/* ── Verify ID Card ── */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: entrance.formOpacity,
              transform: [{ translateY: entrance.formTranslateY }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>Verification</Text>
          <Card style={styles.verifyCard}>
            <View style={styles.verifyRow}>
              <View style={styles.verifyIconWrap}>
                <Ionicons name="shield-checkmark-outline" size={22} color="#1E3A8A" />
              </View>
              <View style={styles.verifyTextWrap}>
                <Text style={styles.verifyTitle}>Verify your identity</Text>
                <Text style={styles.verifySubtitle}>
                  Complete face verification to unlock more jobs.
                </Text>
              </View>
              <Pressable
                style={styles.verifyButton}
                onPress={handleVerify}
              >
                <Text style={styles.verifyButtonText}>Verify</Text>
              </Pressable>
            </View>
          </Card>
        </Animated.View>

        {/* ── Invite Card ── */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: entrance.footerOpacity,
              transform: [{ translateY: entrance.formTranslateY }],
            },
          ]}
        >
          <Card style={styles.inviteCard}>
            <View style={styles.inviteRow}>
              <View style={styles.inviteTextWrap}>
                <Text style={styles.inviteTitle}>Invite & Earn</Text>
                <Text style={styles.inviteSubtitle}>
                  Share your referral code. Both you and your friend get rewards when they sign up.
                </Text>
                <Pressable style={styles.inviteButton} onPress={handleInvite}>
                  <Text style={styles.inviteButtonText}>Invite Friends</Text>
                </Pressable>
              </View>
              <View style={styles.inviteIllustration}>
                <View style={styles.inviteAccent} />
                <View style={styles.inviteCoin}>
                  <Ionicons name="cash-outline" size={22} color="#FFFFFF" />
                </View>
              </View>
            </View>
          </Card>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 20,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    paddingRight: 20,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EAE1D9",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#FFF8F3",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FF7B54",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    shadowColor: "#FF7B54",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  streakText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 16,
    shadowColor: "#2C3E5B",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 3,
  },
  statPill: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C3E5B",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6E7E91",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 28,
    backgroundColor: "#EAE1D9",
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6E7E91",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingHorizontal: 4,
  },
  profileIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EAE1D9",
    overflow: "hidden",
  },
  profileImageSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  profileInitialsSmall: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2C3E5B",
  },
  profilePanel: {
    backgroundColor: "#FFF8F3",
  },
  profilePanelCard: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  profilePanelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  profilePanelAvatarWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F5ECE5",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  profilePanelImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  profilePanelPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F5ECE5",
    alignItems: "center",
    justifyContent: "center",
  },
  profilePanelTextWrap: {
    flex: 1,
    gap: 2,
  },
  profilePanelName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C3E5B",
  },
  profilePanelMeta: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6E7E91",
  },
  vehicleCard: {
    padding: 0,
    overflow: "hidden",
  },
  vehicleImageWrap: {
    height: 180,
    backgroundColor: "#FFF8F3",
    position: "relative",
  },
  vehicleImage: {
    width: "100%",
    height: "100%",
  },
  vehicleOverlayTopRight: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  vehicleCheckBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  vehicleOverlayBottomLeft: {
    position: "absolute",
    bottom: 12,
    left: 12,
  },
  mapMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: "#FF7B54",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginVertical: 16,
    shadowColor: "#FF7B54",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  verifyCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  verifyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  verifyIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#BFDBFE",
  },
  verifyTextWrap: {
    flex: 1,
    gap: 2,
  },
  verifyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2C3E5B",
  },
  verifySubtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6E7E91",
    lineHeight: 18,
  },
  verifyButton: {
    backgroundColor: "#FF7B54",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    shadowColor: "#FF7B54",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  verifyButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  inviteCard: {
    paddingVertical: 20,
    paddingHorizontal: 18,
  },
  inviteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  inviteTextWrap: {
    flex: 1,
    gap: 8,
  },
  inviteTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C3E5B",
  },
  inviteSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6E7E91",
    lineHeight: 18,
  },
  inviteButton: {
    backgroundColor: "#FF7B54",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: "flex-start",
    shadowColor: "#FF7B54",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  inviteButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  inviteIllustration: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  inviteAccent: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFF7ED",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#FFEDD5",
  },
  inviteCoin: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  verificationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  verificationBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6E7E91",
  },
  verificationBadgeTextConfirmed: {
    color: "#10B981",
  },
});
