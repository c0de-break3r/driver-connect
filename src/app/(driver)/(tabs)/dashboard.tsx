import { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  PanResponder,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";

import { useStaggeredEntrance } from "@/hooks/useStaggeredEntrance";
import { useDriverOnboardingStore } from "@/store/useDriverOnboardingStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useTabVisibilityStore } from "@/store/useTabVisibilityStore";
import { api } from "@/lib/convexApi";
import { useQuery } from "convex/react";
import {
  availableJobs as mockAvailableJobs,
  filterChips,
} from "@/data/driverJobs";

const NAVY = "#2C3E5B";
const ORANGE = "#FF7B54";
const PEACH = "#FFF8F3";
const WHITE = "#FFFFFF";
const MUTED = "#6E7E91";
const BORDER = "#EAE1D9";

const JOB_STATUS_COLORS: Record<string, { bg: string; text: string; border: string; accent: string }> = {
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

type JobCard = {
  _id?: string;
  id?: string;
  title: string;
  category: string;
  location: string;
  distance: string;
  pay: string;
  payPeriod: string;
  postedAgo: string;
  vehicleType: string;
  urgent?: boolean;
  latitude?: number;
  longitude?: number;
  image?: any;
};

const STABLE_FAKE_IDS = [
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j",
];

export default function DriverDashboard() {
  const entrance = useStaggeredEntrance();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const [useRealData, setUseRealData] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const searchAnim = useMemo(() => new Animated.Value(0), []);
  const [refreshToken, setRefreshToken] = useState(0);
  const { profileImageUri, setProfileImageUri } = useDriverOnboardingStore();
  const { unreadCount } = useNotificationStore();
  const tabVisible = useTabVisibilityStore((s) => s.visible);
  const setTabVisible = useTabVisibilityStore((s) => s.setVisible);
  const convexJobs = useQuery(api.vehicles.listVehicles, useRealData ? {} : "skip");
  const lastScrollY = useRef(0);
  const mapPan = useMemo(() => new Animated.ValueXY({ x: 0, y: 0 }), []);
  const posRef = useRef({ x: 0, y: 0 });

  /* eslint-disable react-hooks/refs -- PanResponder callbacks are event handlers, not render. */
  const mapPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gesture) => {
          const nextX = posRef.current.x + gesture.dx;
          const nextY = posRef.current.y + gesture.dy;
          mapPan.setValue({ x: nextX, y: nextY });
        },
        onPanResponderRelease: (_, gesture) => {
          if (Math.abs(gesture.dx) < 5 && Math.abs(gesture.dy) < 5) {
            impactAsync(ImpactFeedbackStyle.Light);
            router.push("/(driver)/(tabs)/map");
          } else {
            posRef.current = {
              x: posRef.current.x + gesture.dx,
              y: posRef.current.y + gesture.dy,
            };
          }
        },
      }),
    [mapPan]
  );
  /* eslint-enable react-hooks/refs */

  const handleScroll = useCallback(
    (event: any) => {
      const currentY = event.nativeEvent.contentOffset.y;
      const delta = currentY - lastScrollY.current;

      if (delta > 5) {
        setTabVisible(false);
      } else if (delta < -5) {
        setTabVisible(true);
      }

      lastScrollY.current = currentY;
    },
    [setTabVisible]
  );

  const handleFilterPress = async (chip: string) => {
    await impactAsync(ImpactFeedbackStyle.Light);
    setActiveFilter(chip);
  };

  const navigatingRef = useRef(false);

  const handleJobPress = async (jobId: string) => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;
    await impactAsync(ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/(driver)/job-details",
      params: { jobId, useRealData: String(useRealData) },
    });
    setTimeout(() => {
      navigatingRef.current = false;
    }, 300);
  };

  const handleSearchToggle = async () => {
    await impactAsync(ImpactFeedbackStyle.Light);
    const next = !searchExpanded;
    setSearchExpanded(next);
    Animated.timing(searchAnim, {
      toValue: next ? 1 : 0,
      duration: 320,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      useNativeDriver: false,
    }).start();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setActiveFilter("All");
    setSearchQuery("");
    setRefreshToken((token) => token + 1);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setRefreshing(false);
  };

  const handleProfilePress = async () => {
    await impactAsync(ImpactFeedbackStyle.Light);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert("Permission required", "Please allow access to your photos to update your profile image.");
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
  };

  const allJobs: JobCard[] = useMemo(() => {
    if (useRealData && convexJobs) {
      return convexJobs.map((vehicle: any) => ({
        id: vehicle._id,
        title: vehicle.title,
        category: vehicle.category,
        location: `${vehicle.city}, ${vehicle.region}`,
        distance: "Nearby",
        pay: `GHS ${vehicle.pricePerDay.toFixed(2)}`,
        payPeriod: "per day",
        postedAgo: "Available",
        vehicleType: vehicle.category,
        urgent: false,
        latitude: vehicle.latitude,
        longitude: vehicle.longitude,
      }));
    }
    return mockAvailableJobs;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useRealData, convexJobs, refreshToken]);

  const filteredJobs = useMemo(() => {
    let jobs = allJobs;

    if (activeFilter !== "All") {
      if (activeFilter === "Nearby") {
        jobs = jobs.filter((job) => parseFloat(job.distance) <= 5);
      } else if (activeFilter === "High Pay") {
        const payValue = (job: JobCard) => parseFloat(job.pay.replace(/[^0-9]/g, "")) || 0;
        jobs = jobs.filter((job) => payValue(job) >= 200);
      } else {
        jobs = jobs.filter((job) => job.category === activeFilter);
      }
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      jobs = jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.location.toLowerCase().includes(query) ||
          job.category.toLowerCase().includes(query) ||
          job.vehicleType.toLowerCase().includes(query)
      );
    }

    return jobs;
  }, [activeFilter, searchQuery, allJobs]);

  const isEmpty = filteredJobs.length === 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PEACH }} edges={["top"]}>
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Pressable onPress={handleProfilePress} style={styles.profileAvatar}>
              {profileImageUri ? (
                <Image
                  source={{ uri: profileImageUri }}
                  style={styles.profileAvatarImage}
                  contentFit="cover"
                />
              ) : (
                <Ionicons name="person" size={22} color={NAVY} />
              )}
            </Pressable>
          </View>
          <View style={styles.headerRight}>
            <Pressable
              style={styles.iconButton}
              onPress={() => router.push("/(driver)/notifications")}
            >
              <Ionicons name="notifications-outline" size={22} color={NAVY} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </Pressable>
            <Pressable style={styles.searchToggle} onPress={handleSearchToggle}>
              <Ionicons name="search" size={22} color={NAVY} />
            </Pressable>
          </View>
        </View>

        {!searchExpanded && (
          <View style={styles.filtersWrap}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersContent}
            >
              {filterChips.map((chip) => {
                const isActive = activeFilter === chip;
                return (
                  <Pressable
                    key={chip}
                    onPress={() => handleFilterPress(chip)}
                    style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}
                  >
                    <Text
                      style={[styles.chipText, isActive ? styles.chipTextActive : styles.chipTextInactive]}
                    >
                      {chip}
                    </Text>
                  </Pressable>
                );
              })}
              <Pressable
                onPress={() => setUseRealData((prev) => !prev)}
                style={[styles.chip, useRealData ? styles.chipActive : styles.chipInactive]}
              >
                <Text
                  style={[styles.chipText, useRealData ? styles.chipTextActive : styles.chipTextInactive]}
                >
                  {useRealData ? "Live Data" : "Mock Data"}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        )}

        <Animated.View
          pointerEvents={searchExpanded ? "auto" : "none"}
          style={[
            styles.searchOverlay,
            {
              opacity: searchAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
              transform: [
                {
                  scaleX: searchAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.92, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.searchContainer}>
            <Pressable onPress={handleSearchToggle} hitSlop={8}>
              <Ionicons name="chevron-back" size={22} color={NAVY} style={styles.searchBackIcon} />
            </Pressable>
            <TextInput
              style={styles.searchInput}
              placeholder="Search jobs, locations..."
              placeholderTextColor={MUTED}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              autoFocus={searchExpanded}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
                <Ionicons name="close-circle" size={20} color={MUTED} />
              </Pressable>
            )}
          </View>
        </Animated.View>
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: PEACH }}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabVisible ? 100 : 24 },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={ORANGE}
            colors={[ORANGE]}
          />
        }
      >
        <Animated.View
          style={[
            styles.section,
            {
              opacity: entrance.formOpacity,
              transform: [{ translateY: entrance.formTranslateY }],
            },
          ]}
        >
          {isEmpty ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="briefcase-outline" size={40} color={MUTED} />
              </View>
              <Text style={styles.emptyTitle}>No jobs found</Text>
              <Text style={styles.emptyBody}>
                Try adjusting your search or filter to find more opportunities.
              </Text>
              <Pressable style={styles.emptyButton} onPress={() => { setActiveFilter("All"); setSearchQuery(""); }}>
                <Text style={styles.emptyButtonText}>Clear filters</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.masonryGrid}>
              {filteredJobs.map((job, index) => {
                const statusColors = JOB_STATUS_COLORS[job.category] ?? JOB_STATUS_COLORS["Find Work"];
                const categoryIcon = CATEGORY_ICONS[job.category] ?? CATEGORY_ICONS["Find Work"];
                const jobId = job._id ?? job.id ?? STABLE_FAKE_IDS[index % STABLE_FAKE_IDS.length];
                const isWide = index % 5 === 0;
                return (
                  <Pressable
                    key={jobId}
                    onPress={() => handleJobPress(jobId)}
                    style={({ pressed }) => [styles.pinCard, isWide && styles.pinCardWide, pressed && styles.jobCardPressed]}
                  >
                    <View style={[styles.pinImagePlaceholder, { backgroundColor: statusColors.bg }]}>
                      {job.image ? (
                        <Image
                          source={{ uri: job.image }}
                          style={styles.pinImage}
                          contentFit="cover"
                        />
                      ) : (
                        <View style={[styles.pinImageIconWrap, { backgroundColor: statusColors.accent }]}>
                          <Ionicons name={categoryIcon.name} size={24} color="#FFFFFF" />
                        </View>
                      )}
                    </View>
                    <View style={styles.pinBody}>
                      <Text style={styles.pinTitle} numberOfLines={2}>{job.title}</Text>
                      <Text style={styles.pinPay}>{job.pay}</Text>
                      <View style={styles.pinLocationRow}>
                        <Ionicons name="location-outline" size={14} color={MUTED} />
                        <Text style={styles.pinLocation} numberOfLines={1}>
                          {job.location} • {job.distance}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <Animated.View
        {...mapPanResponder.panHandlers}
        style={[
          styles.mapToggleWrap,
          {
            opacity: entrance.iconOpacity,
            transform: [
              { scale: entrance.iconScale },
              { translateX: mapPan.x },
              { translateY: mapPan.y },
            ],
            bottom: tabVisible ? 88 : 24,
          },
        ]}
      >
        <View style={styles.mapToggleButton}>
          <Ionicons name="map" size={22} color={WHITE} />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 14,
    backgroundColor: PEACH,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    zIndex: 10,
    position: "relative",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 100,
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerLeft: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: WHITE,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
    overflow: "hidden",
  },
  profileAvatarImage: {
    width: "100%",
    height: "100%",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: WHITE,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
    position: "relative",
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
    borderColor: PEACH,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: WHITE,
  },
  searchToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: WHITE,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
  },
  searchOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: PEACH,
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 20,
    zIndex: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: WHITE,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchBackIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 15,
    fontWeight: "600",
    color: NAVY,
  },
  filtersWrap: {
    gap: 10,
    overflow: "hidden",
  },
  filtersContent: {
    gap: 10,
    paddingRight: 20,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipActive: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  chipInactive: {
    backgroundColor: WHITE,
    borderColor: BORDER,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  chipTextActive: {
    color: WHITE,
  },
  chipTextInactive: {
    color: NAVY,
  },
  section: {
    gap: 12,
  },
  masonryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  pinCard: {
    width: "48%",
    backgroundColor: WHITE,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  pinCardWide: {
    width: "100%",
  },
  jobCardPressed: {
    opacity: 0.92,
  },
  pinImagePlaceholder: {
    width: "100%",
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  pinImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
  pinImageIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  pinBody: {
    padding: 12,
    gap: 6,
  },
  pinTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: NAVY,
    lineHeight: 18,
  },
  pinPay: {
    fontSize: 14,
    fontWeight: "700",
    color: ORANGE,
  },
  pinLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  pinLocation: {
    fontSize: 12,
    fontWeight: "600",
    color: MUTED,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    gap: 12,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#F5ECE5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: NAVY,
  },
  emptyBody: {
    fontSize: 14,
    fontWeight: "600",
    color: MUTED,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 24,
  },
  emptyButton: {
    marginTop: 4,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: PEACH,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: NAVY,
  },
  mapToggleWrap: {
    position: "absolute",
    right: 20,
    bottom: 24,
    zIndex: 10,
  },
  mapToggleButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: NAVY,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  bottomSpacer: {
    height: 24,
  },
});
