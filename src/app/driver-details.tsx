import { useState, useRef, useEffect, useCallback } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable, Dimensions } from "react-native";
import { Image } from "expo-image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Animated } from "react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useAuth } from "@/contexts/AuthProvider";
import WelcomeAuthScreen from "@/components/WelcomeAuthScreen";
import Toast from "@/components/Toast";
import { getPendingVehicleTripDates, clearPendingVehicleTripDates } from "@/lib/tripDateBridge";
import { getDriverAssignments, acceptDriverAssignment, declineDriverAssignment } from "@/lib/driverAssignmentsBridge";
import { DRIVERS } from "@/data/drivers";

const NAVY = "#2C3E5B";
const GREEN = "#10B981";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function DriverDetailsScreen() {
  const params = useLocalSearchParams();
  const driverId = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "d1";
  const driver = DRIVERS.find((d) => d.id === driverId) || DRIVERS[0];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFullscreenImage, setShowFullscreenImage] = useState(false);
  const [authVisible, setAuthVisible] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: "success" | "error" | "info" | "warning" }>({ visible: false, message: "", type: "success" });
  const heartScale = useRef(new Animated.Value(1)).current;

  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: "", type: "success" }), 2500);
  };

  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const fullscreenScrollRef = useRef<ScrollView>(null);
  const fullscreenAnim = useRef(new Animated.Value(0)).current;

  const { signedIn } = useAuth();

  const [pickupDate, setPickupDate] = useState("Sat, 26 Sep");
  const [returnDate, setReturnDate] = useState("Tue, 29 Sep");
  const [pickupTime, setPickupTime] = useState("10:00 am");
  const [returnTime, setReturnTime] = useState("10:00 am");
  const [assignedVehicle, setAssignedVehicle] = useState<{ id?: string; title?: string } | null>(null);
  const [driverAssignments, setDriverAssignments] = useState<{
    driverId: string;
    driverName: string;
    vehicleTitle: string;
    pickupDate: string;
    returnDate: string;
    pickupTime: string;
    returnTime: string;
    status: "pending" | "accepted" | "declined";
  }[]>([]);
  const relatedNavRef = useRef(false);

  const pendingAssignments = driverAssignments.filter((a) => a.status === "pending");
  const acceptedAssignments = driverAssignments.filter((a) => a.status === "accepted");

  useEffect(() => {
    setCurrentImageIndex(0);
    scrollRef.current?.scrollTo({ x: 0, animated: false });
  }, [driverId]);

  useEffect(() => {
    if (showFullscreenImage) {
      fullscreenAnim.setValue(0);
      Animated.timing(fullscreenAnim, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }).start();
      setFullscreenIndex(0);
      fullscreenScrollRef.current?.scrollTo({ x: 0, animated: false });
    }
  }, [showFullscreenImage]);

  useFocusEffect(
    useCallback(() => {
      const pending = getPendingVehicleTripDates();
      if (pending) {
        setPickupDate(pending.pickupDate);
        setReturnDate(pending.returnDate);
        setPickupTime(pending.pickupTime);
        setReturnTime(pending.returnTime);
        setAssignedVehicle(pending.vehicleId ? { id: pending.vehicleId, title: pending.vehicleTitle } : null);
        clearPendingVehicleTripDates();
      }

      setDriverAssignments(getDriverAssignments(driver.id));
    }, [driver.id])
  );

  const handleAddTrips = () => {
    router.push({
      pathname: "/favorites/trip-dates",
      params: {
        source: "driver",
        defaultPickupDate: pickupDate,
        defaultReturnDate: returnDate,
        defaultPickupTime: pickupTime,
        defaultReturnTime: returnTime,
      },
    } as any);
  };

  const triggerHeartBeat = () => {
    heartScale.setValue(1);
    Animated.sequence([
      Animated.timing(heartScale, { toValue: 1.35, duration: 120, useNativeDriver: true }),
      Animated.timing(heartScale, { toValue: 0.85, duration: 120, useNativeDriver: true }),
      Animated.timing(heartScale, { toValue: 1.15, duration: 120, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, tension: 180, friction: 3 }),
    ]).start();
  };

  const handleFavorite = () => {
    triggerHeartBeat();
    if (!signedIn) {
      setAuthVisible(true);
      return;
    }
    router.push(`/favorites/save-to-favorites?vehicle=${encodeURIComponent(JSON.stringify({
      id: driver.id,
      title: driver.name,
      image: driver.image,
      price: driver.hourlyRate,
      location: driver.location,
      rating: driver.rating,
    }))}` as any);
  };

  const handleAuthDismiss = () => {
    setAuthVisible(false);
  };

  const handleHire = () => {
    showToast(`Hire request sent to ${driver.name}`, "success");
  };

  const openFullscreenImage = () => {
    setShowFullscreenImage(true);
  };

  const closeFullscreenImage = () => {
    setShowFullscreenImage(false);
  };

  const handleFullscreenMomentum = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setFullscreenIndex(index);
  };

  return (
    <View key={driverId} style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.imageWrap}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            ref={scrollRef}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setCurrentImageIndex(index);
            }}
          >
            {[driver.image].map((image, index) => (
              <Pressable key={index} onPress={openFullscreenImage}>
                <Image source={{ uri: image }} style={styles.heroImage} contentFit="cover" />
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>
              {currentImageIndex + 1} / 1
            </Text>
          </View>

          {/* Top actions */}
          <View style={styles.topActions}>
            <Pressable style={styles.iconButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </Pressable>
            <View style={styles.topRightActions}>
              <Pressable style={styles.iconButton}>
                <Ionicons name="share-outline" size={22} color="#FFFFFF" />
              </Pressable>
              <Pressable style={styles.iconButton} onPress={handleFavorite}>
                <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                  <Ionicons
                    name={isFavorite ? "heart" : "heart-outline"}
                    size={22}
                    color={isFavorite ? "#E74C3C" : "#FFFFFF"}
                  />
                </Animated.View>
              </Pressable>
            </View>
          </View>

          {/* Expand hint */}
          <View style={styles.expandHint}>
            <Ionicons name="expand-outline" size={18} color="#FFFFFF" />
            <Text style={styles.expandHintText}>Tap to expand</Text>
          </View>
        </View>

        {/* Driver Overview */}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View style={styles.titleWrap}>
              <Text style={styles.title}>{driver.name}</Text>
              <Text style={styles.subtitle}>{driver.location}</Text>
            </View>
            <View style={styles.rateBadge}>
              <Text style={styles.rateBadgeValue}>{driver.hourlyRate}</Text>
              <Text style={styles.rateBadgeSub}>/hr</Text>
            </View>
          </View>

          <View style={styles.ratingRow}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={16} color="#FFB800" />
              <Text style={styles.ratingText}>{driver.rating}</Text>
            </View>
            <Text style={styles.tripsText}>({driver.trips} trips)</Text>
            {driver.isVerified && (
              <View style={styles.verifiedBadge}>
                 <Ionicons name="checkmark-circle" size={14} color={GREEN} />
                <Text style={styles.verifiedBadgeText}>Verified</Text>
              </View>
            )}
          </View>

          {/* Quick Stats */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="car-sports" size={20} color={NAVY} />
              <Text style={styles.statValue}>{driver.yearsOnPlatform}</Text>
              <Text style={styles.statLabel}>Experience</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="steering" size={20} color={NAVY} />
              <Text style={styles.statValue}>{driver.vehicleType}</Text>
              <Text style={styles.statLabel}>Vehicle types</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="google-translate" size={20} color={NAVY} />
              <Text style={styles.statValue}>{driver.languages}</Text>
              <Text style={styles.statLabel}>Languages</Text>
            </View>
          </View>

          {/* Trip Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trip Details</Text>
            <View style={styles.tripRow}>
              <View style={styles.tripIcon}>
                <Ionicons name="calendar-outline" size={20} color={NAVY} />
              </View>
              <View style={styles.tripInfo}>
                <Text style={styles.tripLabel}>Pick-up</Text>
                <Text style={styles.tripValue}>{pickupDate} · {pickupTime}</Text>
              </View>
            </View>
            <View style={[styles.tripRow, { marginTop: 16 }]}>
              <View style={styles.tripIcon}>
                <Ionicons name="location-outline" size={20} color={NAVY} />
              </View>
              <View style={styles.tripInfo}>
                <Text style={styles.tripLabel}>Return</Text>
                <Text style={styles.tripValue}>{returnDate} · {returnTime}</Text>
              </View>
            </View>
            {assignedVehicle?.title && (
              <View style={styles.assignedVehicleBadge}>
                <Ionicons name="car-outline" size={14} color={NAVY} />
                <Text style={styles.assignedVehicleText}>{assignedVehicle.title}</Text>
              </View>
            )}
            <Pressable style={styles.addTripsButton} onPress={handleAddTrips}>
              <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
              <Text style={styles.addTripsButtonText}>Add trips</Text>
            </Pressable>
          </View>

          {pendingAssignments.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Booking Requests</Text>
              {pendingAssignments.map((assignment, index) => {
                const globalIndex = driverAssignments.indexOf(assignment);
                return (
                  <View key={globalIndex} style={styles.assignmentCard}>
                    <View style={styles.assignmentIcon}>
                      <MaterialCommunityIcons name="car-sports" size={18} color={NAVY} />
                    </View>
                    <View style={styles.assignmentInfo}>
                      <Text style={styles.assignmentVehicle}>{assignment.vehicleTitle}</Text>
                      <Text style={styles.assignmentDates}>
                        {assignment.pickupDate} · {assignment.pickupTime}
                      </Text>
                      <Text style={styles.assignmentReturn}>
                        Return: {assignment.returnDate} · {assignment.returnTime}
                      </Text>
                    </View>
                    <View style={[styles.assignmentBadge, styles.assignmentBadgePending]}>
                      <Text style={[styles.assignmentBadgeText, styles.assignmentBadgeTextPending]}>Pending</Text>
                    </View>
                    <View style={styles.assignmentActions}>
                      <Pressable
                        style={[styles.assignmentActionButton, styles.acceptButton]}
                        onPress={() => {
                          acceptDriverAssignment(globalIndex);
                          showToast("Booking accepted", "success");
                          setDriverAssignments([...driverAssignments]);
                        }}
                      >
                        <Text style={styles.acceptButtonText}>Accept</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.assignmentActionButton, styles.declineButton]}
                        onPress={() => {
                          declineDriverAssignment(globalIndex);
                          showToast("Booking declined", "warning");
                          setDriverAssignments([...driverAssignments]);
                        }}
                      >
                        <Text style={styles.declineButtonText}>Decline</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {acceptedAssignments.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Confirmed Bookings</Text>
              {acceptedAssignments.map((assignment, index) => (
                <View key={index} style={styles.assignmentCard}>
                  <View style={styles.assignmentIcon}>
                    <MaterialCommunityIcons name="car-sports" size={18} color={NAVY} />
                  </View>
                  <View style={styles.assignmentInfo}>
                    <Text style={styles.assignmentVehicle}>{assignment.vehicleTitle}</Text>
                    <Text style={styles.assignmentDates}>
                      {assignment.pickupDate} · {assignment.pickupTime}
                    </Text>
                    <Text style={styles.assignmentReturn}>
                      Return: {assignment.returnDate} · {assignment.returnTime}
                    </Text>
                  </View>
                  <View style={[styles.assignmentBadge, styles.assignmentBadgeAccepted]}>
                    <Text style={[styles.assignmentBadgeText, styles.assignmentBadgeTextAccepted]}>Accepted</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.aboutText}>{driver.about}</Text>
          </View>

          {/* Driver Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Driver Stats</Text>
            <View style={styles.statsRow}>
              <View style={styles.statRowItem}>
                <Ionicons name="briefcase-outline" size={18} color={NAVY} />
                <View style={styles.statRowInfo}>
                  <Text style={styles.statRowValue}>{driver.trips}</Text>
                  <Text style={styles.statRowLabel}>Trips completed</Text>
                </View>
              </View>
              <View style={styles.statRowItem}>
                <Ionicons name="star" size={18} color="#FFB800" />
                <View style={styles.statRowInfo}>
                  <Text style={styles.statRowValue}>{driver.rating}</Text>
                  <Text style={styles.statRowLabel}>Driver rating</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Reviews */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <View style={styles.reviewCard}>
              <Image
                source={{ uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80" }}
                style={styles.reviewAvatar}
                contentFit="cover"
              />
              <View style={styles.reviewContent}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewName}>Client</Text>
                  <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons key={star} name="star" size={14} color="#FFB800" />
                    ))}
                  </View>
                  <Text style={styles.reviewDate}>28 Jul 2026</Text>
                </View>
                <Text style={styles.reviewText}>
                  Excellent driver. Punctual, professional, and very familiar with the area. Would definitely book again.
                </Text>
              </View>
            </View>
          </View>

          {/* Cancellation Policy */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cancellation Policy</Text>
            <View style={styles.cancellationRow}>
              <View style={styles.cancellationIcon}>
                <Ionicons name="shield-checkmark-outline" size={22} color={NAVY} />
              </View>
              <View style={styles.cancellationInfo}>
                <Text style={styles.cancellationTitle}>Free cancellation</Text>
                <Text style={styles.cancellationSubtitle}>
                  Full refund if cancelled up to 24 hours before the trip.
                </Text>
              </View>
            </View>
          </View>

          {/* Other Drivers */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Other drivers you may like</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.relatedScroll}>
              {DRIVERS.filter((d) => d.id !== driver.id).slice(0, 5).map((related) => (
                <Pressable
                  key={related.id}
                  style={styles.relatedCard}
                  onPress={() => {
                    if (relatedNavRef.current) return;
                    relatedNavRef.current = true;
                    setTimeout(() => { relatedNavRef.current = false; }, 600);
                    router.push(`/driver-details?id=${related.id}`);
                  }}
                >
                  <Image source={{ uri: related.image }} style={styles.relatedImage} contentFit="cover" />
                  <View style={styles.relatedBody}>
                    <Text style={styles.relatedTitle} numberOfLines={1}>{related.name}</Text>
                    <Text style={styles.relatedPrice}>{related.hourlyRate}/hr</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Bottom spacing for hire button */}
          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceInfo}>
          <Text style={styles.rateLabel}>Rate</Text>
          <Text style={styles.rateValue}>{driver.hourlyRate}</Text>
          <Text style={styles.priceNote}>per hour</Text>
        </View>
        <Pressable style={styles.hireButton} onPress={handleHire}>
          <Text style={styles.hireButtonText}>Hire</Text>
        </Pressable>
      </View>

      {/* Fullscreen Image Overlay */}
      {showFullscreenImage && (
        <Animated.View
          style={[
            styles.fullscreenOverlay,
            {
              opacity: fullscreenAnim,
            },
          ]}
        >
          <Pressable style={styles.fullscreenCloseButton} onPress={closeFullscreenImage}>
            <Ionicons name="close" size={24} color={NAVY} />
          </Pressable>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            ref={fullscreenScrollRef}
            onMomentumScrollEnd={handleFullscreenMomentum}
          >
            <Image
              source={{ uri: driver.image }}
              style={styles.fullscreenImage}
              contentFit="contain"
            />
          </ScrollView>

          <View style={styles.fullscreenCounter}>
            <Text style={styles.fullscreenCounterText}>
              1 / 1
            </Text>
          </View>

          <View style={styles.fullscreenDots}>
            <View
              style={[
                styles.fullscreenDot,
                styles.fullscreenDotActive,
              ]}
            />
          </View>
        </Animated.View>
      )}
      {authVisible && <WelcomeAuthScreen onDismiss={handleAuthDismiss} />}

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ visible: false, message: "", type: "success" })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  imageWrap: {
    position: "relative",
    width: "100%",
    height: 300,
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: 300,
  },
  imageCounter: {
    position: "absolute",
    bottom: 16,
    left: 16,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  imageCounterText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  topActions: {
    position: "absolute",
    top: 48,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topRightActions: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  expandHint: {
    position: "absolute",
    bottom: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  expandHintText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 12,
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: NAVY,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  rateBadge: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#D1FAE5",
    alignItems: "center",
  },
  rateBadgeValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#10B981",
  },
  rateBadgeSub: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "700",
    color: NAVY,
  },
  tripsText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  verifiedBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#10B981",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 28,
  },
  statItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statValue: {
    fontSize: 15,
    fontWeight: "800",
    color: NAVY,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: NAVY,
    marginBottom: 16,
  },
  aboutText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
    lineHeight: 20,
  },
  statsRow: {
    gap: 12,
    marginBottom: 4,
  },
  statRowItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statRowInfo: {
    flex: 1,
  },
  statRowValue: {
    fontSize: 15,
    fontWeight: "800",
    color: NAVY,
    marginBottom: 2,
  },
  statRowLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  reviewCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  reviewContent: {
    flex: 1,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  reviewName: {
    fontSize: 14,
    fontWeight: "700",
    color: NAVY,
  },
  reviewStars: {
    flexDirection: "row",
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    fontWeight: "500",
    color: "#9CA3AF",
    marginLeft: "auto",
  },
  reviewText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#4B5563",
    lineHeight: 18,
  },
  cancellationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cancellationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cancellationInfo: {
    flex: 1,
  },
  cancellationTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
    marginBottom: 4,
  },
  cancellationSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
    lineHeight: 18,
  },
  tripRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tripIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tripInfo: {
    flex: 1,
    gap: 2,
  },
  tripLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tripValue: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
  },
  addTripsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: NAVY,
    marginTop: 16,
  },
  addTripsButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  assignedVehicleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  assignedVehicleText: {
    fontSize: 13,
    fontWeight: "700",
    color: NAVY,
  },
  assignmentCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  assignmentIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  assignmentInfo: {
    flex: 1,
    gap: 2,
  },
  assignmentVehicle: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
  },
  assignmentDates: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  assignmentReturn: {
    fontSize: 12,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  assignmentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  assignmentBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  assignmentBadgePending: {
    backgroundColor: "#FEF3C7",
    borderColor: "#FDE68A",
  },
  assignmentBadgeTextPending: {
    color: "#D97706",
  },
  assignmentBadgeAccepted: {
    backgroundColor: "#D1FAE5",
    borderColor: "#A7F3D0",
  },
  assignmentBadgeTextAccepted: {
    color: "#047857",
  },
  assignmentBadgeDeclined: {
    backgroundColor: "#FEE2E2",
    borderColor: "#FECACA",
  },
  assignmentBadgeTextDeclined: {
    color: "#B91C1C",
  },
  assignmentActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  assignmentActionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  acceptButton: {
    backgroundColor: NAVY,
  },
  acceptButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  declineButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  declineButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
  },
  relatedScroll: {
    marginHorizontal: -4,
  },
  relatedCard: {
    width: 160,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
    marginHorizontal: 4,
  },
  relatedImage: {
    width: "100%",
    height: 110,
  },
  relatedBody: {
    padding: 10,
    gap: 4,
  },
  relatedTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: NAVY,
  },
  relatedPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: GREEN,
  },
  bottomSpacer: {
    height: 20,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  priceInfo: {
    flex: 1,
  },
  rateLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  rateValue: {
    fontSize: 18,
    fontWeight: "800",
    color: NAVY,
  },
  priceNote: {
    fontSize: 12,
    fontWeight: "500",
    color: "#9CA3AF",
    marginTop: 2,
  },
  hireButton: {
    backgroundColor: NAVY,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  hireButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  fullscreenOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    zIndex: 1000,
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenCloseButton: {
    position: "absolute",
    top: 48,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1001,
  },
  fullscreenImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  fullscreenCounter: {
    position: "absolute",
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  fullscreenCounterText: {
    color: NAVY,
    fontSize: 14,
    fontWeight: "600",
  },
  fullscreenDots: {
    position: "absolute",
    bottom: 24,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  fullscreenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  fullscreenDotActive: {
    backgroundColor: NAVY,
    width: 24,
  },
  toast: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
});
