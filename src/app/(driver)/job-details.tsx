import { useMemo, useRef } from "react";
import {
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useStaggeredEntrance } from "@/hooks/useStaggeredEntrance";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import { availableJobs } from "@/data/driverJobs";
import { useQuery } from "convex/react";
import { api } from "@/lib/convexApi";

const NAVY = "#2C3E5B";
const ORANGE = "#FF7B54";
const PEACH = "#FFF8F3";
const WHITE = "#FFFFFF";
const MUTED = "#6E7E91";
const BORDER = "#EAE1D9";

const JOB_STATUS_COLORS: Record<
  string,
  { bg: string; text: string; border: string; accent: string }
> = {
  "Find Work": { bg: "#EFF6FF", text: "#1E3A8A", border: "#BFDBFE", accent: "#3B82F6" },
  "Need Vehicle": { bg: "#FFF7ED", text: "#7C2D12", border: "#FFEDD5", accent: "#F97316" },
  Sales: { bg: "#F5F3FF", text: "#3B0764", border: "#E9D5FF", accent: "#8B5CF6" },
  Rentals: { bg: "#ECFDF5", text: "#064E3B", border: "#A7F3D0", accent: "#10B981" },
};

const CATEGORY_ICONS: Record<string, { name: keyof typeof Ionicons.glyphMap; label: string }> = {
  "Find Work": { name: "briefcase", label: "Find Work" },
  "Need Vehicle": { name: "car", label: "Need Vehicle" },
  Sales: { name: "pricetag", label: "Sales" },
  Rentals: { name: "key", label: "Rentals" },
};

export default function JobDetailsScreen() {
  const entrance = useStaggeredEntrance();
  const router = useRouter();
  const { jobId, useRealData } = useLocalSearchParams<{
    jobId: string;
    useRealData?: string;
  }>();
  const navigatingRef = useRef(false);
  const useReal = useRealData === "true";

  const convexJob = useQuery(
    api.vehicles.listVehicles,
    useReal ? {} : "skip"
  );

  const job = useMemo(() => {
    if (useReal && convexJob) {
      const found = convexJob.find((v: any) => v._id === jobId);
      if (found) {
        return {
          id: found._id,
          title: found.title,
          category: found.category,
          location: `${found.city}, ${found.region}`,
          latitude: found.latitude,
          longitude: found.longitude,
          distance: "Nearby",
          pay: `GHS ${found.pricePerDay.toFixed(2)}`,
          payPeriod: "per day",
          postedAgo: "Available",
          vehicleType: found.category,
          urgent: false,
          description: found.description ?? "No description available",
          startTime: "TBD",
          endTime: "TBD",
          duration: "TBD",
          customerName: "Customer",
          customerRating: 0,
        };
      }
    }
    return availableJobs.find((j) => j.id === jobId) ?? availableJobs[0];
  }, [jobId, useReal, convexJob]);

  const statusColors =
    JOB_STATUS_COLORS[job.category] ?? JOB_STATUS_COLORS["Chauffeur"];
  const categoryIcon =
    CATEGORY_ICONS[job.category] ?? CATEGORY_ICONS["Chauffeur"];

  const handleApply = async () => {
    await impactAsync(ImpactFeedbackStyle.Medium);
    Alert.alert("Application Sent", `You applied for ${job.title}.`);
  };

  const handleBack = async () => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;
    await impactAsync(ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/(driver)/(tabs)/dashboard");
    }
    setTimeout(() => {
      navigatingRef.current = false;
    }, 300);
  };

  const handleNavigate = async () => {
    await impactAsync(ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/(driver)/(tabs)/map",
      params: {
        destinationLat: String(job.latitude ?? ""),
        destinationLng: String(job.longitude ?? ""),
        destinationLabel: job.location,
        jobId: job.id,
      },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PEACH }} edges={["top"]}>
      <View style={styles.fixedHeader}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={NAVY} />
        </Pressable>
        <Text style={styles.headerTitle}>Job Details</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.hero,
            { opacity: entrance.formOpacity, transform: [{ translateY: entrance.formTranslateY }] },
          ]}
        >
          <View style={[styles.heroIconWrap, { backgroundColor: statusColors.bg }]}>
            <View style={[styles.heroIconInner, { backgroundColor: statusColors.accent }]}>
              <Ionicons name={categoryIcon.name} size={32} color="#FFFFFF" />
            </View>
            {job.urgent && (
              <View style={styles.urgentBadge}>
                <Ionicons name="flash" size={12} color="#FFFFFF" />
                <Text style={styles.urgentBadgeText}>Urgent</Text>
              </View>
            )}
          </View>
          <Text style={styles.heroTitle}>{job.title}</Text>
          <View style={styles.titleRow}>
            <View style={[styles.statusBadge, { backgroundColor: statusColors.bg, borderColor: statusColors.border }]}>
              <Text style={[styles.statusBadgeText, { color: statusColors.text }]}>{job.category}</Text>
            </View>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color={ORANGE} />
              <Text style={styles.ratingText}>{job.customerRating}</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            { opacity: entrance.formOpacity, transform: [{ translateY: entrance.formTranslateY }] },
          ]}
        >
          <Text style={styles.sectionLabel}>About this job</Text>
          <Text style={styles.description}>{job.description}</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            { opacity: entrance.formOpacity, transform: [{ translateY: entrance.formTranslateY }] },
          ]}
        >
          <Text style={styles.sectionLabel}>Schedule</Text>
          <View style={styles.timeGrid}>
            <View style={styles.timeItem}>
              <Text style={styles.timeLabel}>Start</Text>
              <Text style={styles.timeValue}>{job.startTime}</Text>
            </View>
            <View style={styles.timeItem}>
              <Text style={styles.timeLabel}>End</Text>
              <Text style={styles.timeValue}>{job.endTime}</Text>
            </View>
            <View style={styles.timeItem}>
              <Text style={styles.timeLabel}>Duration</Text>
              <Text style={styles.timeValue}>{job.duration}</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            { opacity: entrance.formOpacity, transform: [{ translateY: entrance.formTranslateY }] },
          ]}
        >
          <View style={styles.customerRow}>
            <View style={styles.customerAvatar}>
              <Ionicons name="person" size={20} color={NAVY} />
            </View>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{job.customerName}</Text>
              <View style={styles.customerMetaRow}>
                <Ionicons name="star" size={14} color={ORANGE} />
                  <Text style={styles.customerRatingText}>
                    {job.customerRating > 0 ? `${job.customerRating} rating` : "New listing"}
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

        <Animated.View
          style={[
            styles.card,
            { opacity: entrance.formOpacity, transform: [{ translateY: entrance.formTranslateY }] },
          ]}
        >
          <Text style={styles.sectionLabel}>Verified Information</Text>
          <View style={styles.verifiedGrid}>
            <View style={styles.verifiedItem}>
              <Ionicons name="shield-checkmark" size={18} color={ORANGE} />
              <Text style={styles.verifiedText}>Identity verified</Text>
            </View>
            <View style={styles.verifiedItem}>
              <Ionicons name="document-text" size={18} color={ORANGE} />
              <Text style={styles.verifiedText}>License on file</Text>
            </View>
            <View style={styles.verifiedItem}>
              <Ionicons name="location" size={18} color={ORANGE} />
              <Text style={styles.verifiedText}>Address confirmed</Text>
            </View>
            <View style={styles.verifiedItem}>
              <Ionicons name="call" size={18} color={ORANGE} />
              <Text style={styles.verifiedText}>Phone verified</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            { opacity: entrance.formOpacity, transform: [{ translateY: entrance.formTranslateY }] },
          ]}
        >
          <Text style={styles.sectionLabel}>Requirements</Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>Valid drivers license</Text>
            </View>
            <View style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>Clean driving record</Text>
            </View>
            <View style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>Minimum 2 years experience</Text>
            </View>
            <View style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>Smartphone with GPS enabled</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            { opacity: entrance.formOpacity, transform: [{ translateY: entrance.formTranslateY }] },
          ]}
        >
          <Text style={styles.sectionLabel}>Benefits</Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>Competitive daily pay</Text>
            </View>
            <View style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>Flexible schedule</Text>
            </View>
            <View style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>Weekly or bi-weekly payout</Text>
            </View>
            <View style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>24/7 support line</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            { opacity: entrance.formOpacity, transform: [{ translateY: entrance.formTranslateY }] },
          ]}
        >
          <Text style={styles.sectionLabel}>Resources</Text>
          <Pressable style={styles.resourceRow}>
            <Ionicons name="document-attach-outline" size={20} color={NAVY} />
            <Text style={styles.resourceText}>Job description PDF</Text>
            <Ionicons name="download-outline" size={18} color={MUTED} />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.resourceRow}>
            <Ionicons name="map-outline" size={20} color={NAVY} />
            <Text style={styles.resourceText}>Route preview</Text>
            <Ionicons name="chevron-forward" size={18} color={MUTED} />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.resourceRow}>
            <Ionicons name="help-circle-outline" size={20} color={NAVY} />
            <Text style={styles.resourceText}>Support contact</Text>
            <Ionicons name="chevron-forward" size={18} color={MUTED} />
          </Pressable>
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            { opacity: entrance.formOpacity, transform: [{ translateY: entrance.formTranslateY }] },
          ]}
        >
          <View style={styles.metaList}>
            <Pressable style={styles.metaRow} onPress={handleNavigate}>
              <View style={styles.metaIconWrap}>
                <Ionicons name="location-outline" size={20} color={NAVY} />
              </View>
              <View style={styles.metaTextWrap}>
                <Text style={styles.metaLabel}>Pickup Location</Text>
                <Text style={styles.metaValue}>
                  {job.location} • {job.distance}
                </Text>
              </View>
              <Ionicons name="navigate" size={20} color={NAVY} />
            </Pressable>

            <View style={styles.divider} />

            <View style={styles.metaRow}>
              <View style={styles.metaIconWrap}>
                <Ionicons name="cash-outline" size={20} color={NAVY} />
              </View>
              <View style={styles.metaTextWrap}>
                <Text style={styles.metaLabel}>Pay Rate</Text>
                <Text style={styles.metaValue}>
                  {job.pay} / {job.payPeriod}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.metaRow}>
              <View style={styles.metaIconWrap}>
                <Ionicons name="car-outline" size={20} color={NAVY} />
              </View>
              <View style={styles.metaTextWrap}>
                <Text style={styles.metaLabel}>Vehicle Type</Text>
                <Text style={styles.metaValue}>{job.vehicleType}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.metaRow}>
              <View style={styles.metaIconWrap}>
                <Ionicons name="time-outline" size={20} color={NAVY} />
              </View>
              <View style={styles.metaTextWrap}>
                <Text style={styles.metaLabel}>Posted</Text>
                <Text style={styles.metaValue}>{job.postedAgo}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.actions,
            { opacity: entrance.footerOpacity, transform: [{ translateY: entrance.footerTranslateY }] },
          ]}
        >
          <Pressable style={styles.secondaryButton} onPress={handleBack}>
            <Text style={styles.secondaryButtonText}>Decline</Text>
          </Pressable>
          <Pressable style={styles.primaryButton} onPress={handleApply}>
            <Text style={styles.primaryButtonText}>Apply Now</Text>
          </Pressable>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
    gap: 20,
  },
  fixedHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: PEACH,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: WHITE,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: NAVY,
    textAlign: "center",
  },
  headerRight: {
    width: 40,
  },
  hero: {
    alignItems: "center",
    gap: 16,
  },
  heroIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
    position: "relative",
  },
  heroIconInner: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  urgentBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EF4444",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  urgentBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: NAVY,
    textAlign: "center",
    lineHeight: 26,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  statusBadge: {
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "700",
    color: NAVY,
  },
  card: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 20,
    gap: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  description: {
    fontSize: 14,
    fontWeight: "600",
    color: NAVY,
    lineHeight: 20,
  },
  timeGrid: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  timeItem: {
    flex: 1,
    backgroundColor: PEACH,
    borderRadius: 14,
    padding: 14,
    gap: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
    alignItems: "center",
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: "700",
    color: NAVY,
    textAlign: "center",
  },
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  customerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: PEACH,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
  },
  customerInfo: {
    flex: 1,
    gap: 4,
  },
  customerName: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
  },
  customerMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  customerRatingText: {
    fontSize: 13,
    fontWeight: "600",
    color: MUTED,
  },
  metaList: {
    gap: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  metaIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: PEACH,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
  },
  metaTextWrap: {
    flex: 1,
    gap: 2,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  metaValue: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER,
    marginVertical: 8,
  },
  verifiedGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  verifiedItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: PEACH,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
  },
  verifiedText: {
    fontSize: 13,
    fontWeight: "700",
    color: NAVY,
  },
  bulletList: {
    gap: 10,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ORANGE,
  },
  bulletText: {
    fontSize: 14,
    fontWeight: "600",
    color: NAVY,
    lineHeight: 20,
  },
  resourceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  resourceText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: NAVY,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: WHITE,
    letterSpacing: 0.2,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: WHITE,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
  },
  bottomSpacer: {
    height: 24,
  },
});
