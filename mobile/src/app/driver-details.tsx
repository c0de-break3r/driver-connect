import { useState, useRef, useEffect, useCallback } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable, Dimensions, Linking } from "react-native";
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
import { useToast } from "@/hooks/useToast";
import { useDoubleTap } from "@/hooks/useDoubleTap";
import { useAvailabilityStore, DEFAULT_TIME_SLOTS, SlotStatus } from "@/store/useAvailabilityStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import DetailsImageHeader from "@/components/DetailsImageHeader";

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
  const { toast, showToast, hideToast } = useToast();
  const heartScale = useRef(new Animated.Value(1)).current;

  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const fullscreenScrollRef = useRef<ScrollView>(null);
  const fullscreenAnim = useRef(new Animated.Value(0)).current;

  const { signedIn, userId } = useAuth();

  const availability = useAvailabilityStore();
  const today = new Date().toISOString().split("T")[0];
  const currentUserId = userId || "guest";

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
  const reviewsScrollRef = useRef<ScrollView>(null);
  const relatedScrollRef = useRef<ScrollView>(null);
  const relatedAutoSwipeRef = useRef<NodeJS.Timeout | null>(null);
  const reviewsAutoSwipeRef = useRef<NodeJS.Timeout | null>(null);

  const pendingAssignments = driverAssignments.filter((a) => a.status === "pending");
  const acceptedAssignments = driverAssignments.filter((a) => a.status === "accepted");

  useEffect(() => {
    availability.load();
    if (availability.bookings.length === 0) {
      availability.seedDemo();
    }
  }, [availability]);

  const getSlotStatus = (slotStart: string, slotEnd: string) =>
    availability.getSlotStatus(today, slotStart, slotEnd, driver.id, "driver");

  const handleBookSlot = (slotStart: string, slotEnd: string) => {
    if (!signedIn) {
      setAuthVisible(true);
      return;
    }
    const status = getSlotStatus(slotStart, slotEnd);
    if (status === "booked") {
      showToast("This slot is already booked. Join the waitlist?", "warning");
      return;
    }
    if (status === "partial") {
      showToast("This slot partially overlaps with an existing booking.", "warning");
      return;
    }
    availability.addBooking({
      driverId: driver.id,
      date: today,
      slotStart,
      slotEnd,
      status: "pending",
      userId: currentUserId,
      renterName: "You",
    });
    showToast("Booking requested! Waiting for confirmation.", "success");
  };

  const handleJoinWaitlist = (slotStart: string, slotEnd: string) => {
    if (!signedIn) {
      setAuthVisible(true);
      return;
    }
    const alreadyOnWaitlist = availability.isOnWaitlist(
      today,
      slotStart,
      currentUserId,
      driver.id,
      "driver"
    );
    if (alreadyOnWaitlist) {
      showToast("You are already on the waitlist for this slot.", "info");
      return;
    }
    availability.joinWaitlist({
      driverId: driver.id,
      date: today,
      slotStart,
      slotEnd,
      userId: currentUserId,
    });
    const position = availability.getWaitlistPosition(
      today,
      slotStart,
      currentUserId,
      driver.id,
      "driver"
    );
    showToast(`Joined waitlist. Position: #${position}`, "success");
  };

  const handleLeaveWaitlist = (slotStart: string, slotEnd: string) => {
    const entry = availability.waitlist.find(
      (w) =>
        w.date === today &&
        w.slotStart === slotStart &&
        w.userId === currentUserId &&
        w.driverId === driver.id
    );
    if (entry) {
      availability.leaveWaitlist(entry.id);
      showToast("Left waitlist.", "info");
    }
  };

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

  useEffect(() => {
    return () => {
      if (relatedAutoSwipeRef.current) {
        clearInterval(relatedAutoSwipeRef.current);
      }
      if (reviewsAutoSwipeRef.current) {
        clearInterval(reviewsAutoSwipeRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const relatedDrivers = DRIVERS.filter((d) => d.id !== driver.id).slice(0, 5);
    if (relatedDrivers.length === 0) return;

    relatedAutoSwipeRef.current = setInterval(() => {
      relatedScrollRef.current?.scrollTo({ x: 0, animated: true });
      setTimeout(() => {
        relatedScrollRef.current?.scrollTo({ x: SCREEN_WIDTH * 0.7, animated: true });
      }, 300);
    }, 4000);

    return () => {
      if (relatedAutoSwipeRef.current) {
        clearInterval(relatedAutoSwipeRef.current);
      }
    };
  }, [driver.id]);

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
    router.push(`/(client)/book-now?driverId=${driver.id}` as any);
  };

  const handleCall = () => {
    Linking.openURL("tel:+233241234567");
  };

  const handleMessage = () => {
    Linking.openURL("sms:+233241234567");
  };

  const protectedHire = useDoubleTap(handleHire, { cooldownMs: 800 });
  const protectedCall = useDoubleTap(handleCall, { cooldownMs: 800 });
  const protectedMessage = useDoubleTap(handleMessage, { cooldownMs: 800 });
  const protectedFavorite = useDoubleTap(handleFavorite, { cooldownMs: 800 });
  const protectedBookSlot = useDoubleTap((slotStart: string, slotEnd: string) => {
    handleBookSlot(slotStart, slotEnd);
  }, { cooldownMs: 800 });
  const protectedJoinWaitlist = useDoubleTap((slotStart: string, slotEnd: string) => {
    handleJoinWaitlist(slotStart, slotEnd);
  }, { cooldownMs: 800 });
  const protectedLeaveWaitlist = useDoubleTap((slotStart: string, slotEnd: string) => {
    handleLeaveWaitlist(slotStart, slotEnd);
  }, { cooldownMs: 800 });

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
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
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

          <DetailsImageHeader
            onBack={() => router.back()}
            onShare={() => {}}
            onFavorite={protectedFavorite}
            isFavorite={isFavorite}
            heartScale={heartScale}
          />

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
              <Badge variant="primary" className="flex-row items-center gap-1.5">
                <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" />
                <Text className="text-white font-semibold text-xs">Verified</Text>
              </Badge>
            )}
          </View>

          {/* Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            <Card>
              <CardContent>
                <View style={styles.detailsRow}>
                  <View style={styles.detailsIcon}>
                    <Ionicons name="location-outline" size={20} color={NAVY} />
                  </View>
                  <Text style={styles.detailsValue}>{driver.location || "Accra, Ghana"}</Text>
                </View>
                <View style={[styles.detailsRow, { marginTop: 16 }]}>
                  <View style={styles.detailsIcon}>
                    <Ionicons name="time-outline" size={20} color={NAVY} />
                  </View>
                  <Text style={styles.detailsValue}>Morning · 7:00 am - 12:30 pm</Text>
                </View>
                <View style={[styles.detailsRow, { marginTop: 16 }]}>
                  <Pressable style={styles.detailsIcon} onPress={protectedCall}>
                    <Ionicons name="call-outline" size={20} color={NAVY} />
                  </Pressable>
                  <Text style={styles.contactNumber}>+233 24 123 4567</Text>
                  <Pressable style={styles.detailsIcon} onPress={protectedMessage}>
                    <Ionicons name="chatbubble-outline" size={20} color={NAVY} />
                  </Pressable>
                </View>
              </CardContent>
            </Card>
          </View>

          {pendingAssignments.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Booking Requests</Text>
              {pendingAssignments.map((assignment, index) => {
                const globalIndex = driverAssignments.indexOf(assignment);
                return (
                  <Card key={globalIndex} className="mb-3">
                    <CardContent>
                      <View style={styles.assignmentCard}>
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
                        <Badge variant="warning" className="capitalize">Pending</Badge>
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
                    </CardContent>
                  </Card>
                );
              })}
            </View>
          )}

          {acceptedAssignments.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Confirmed Bookings</Text>
              {acceptedAssignments.map((assignment, index) => (
                <Card key={index}>
                  <CardContent>
                    <View style={styles.assignmentCard}>
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
                      <Badge variant="success" className="capitalize">Accepted</Badge>
                    </View>
                  </CardContent>
                </Card>
              ))}
            </View>
          )}

          {/* About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.aboutText}>{driver.about}</Text>
          </View>

          {/* Recent reviews */}
          <View style={styles.section}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Recent reviews</Text>
              <Pressable
                style={styles.reviewsAllLink}
                onPress={() => router.push(`/(driver)/reviews?driverId=${driver.id}` as any)}
              >
                <Text style={styles.reviewsAllText}>All</Text>
              </Pressable>
            </View>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              ref={reviewsScrollRef}
              style={styles.reviewsScroll}
              contentContainerStyle={styles.reviewsScrollContent}
            >
              <Card style={styles.reviewCard}>
                <CardContent>
                  <View style={styles.reviewContent}>
                    <View style={styles.reviewHeader}>
                      <Avatar
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80"
                        fallback="C"
                        size="sm"
                      />
                      <View style={styles.reviewHeaderText}>
                        <Text style={styles.reviewName}>Client</Text>
                        <View style={styles.reviewStars}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Ionicons key={star} name="star" size={14} color="#FFB800" />
                          ))}
                        </View>
                      </View>
                      <Text style={styles.reviewDate}>28 Jul 2026</Text>
                    </View>
                    <Text style={styles.reviewText}>
                      Excellent driver. Punctual, professional, and very familiar with the area. Would definitely book again.
                    </Text>
                  </View>
                </CardContent>
              </Card>
              <Card style={styles.reviewCard}>
                <CardContent>
                  <View style={styles.reviewContent}>
                    <View style={styles.reviewHeader}>
                      <Avatar
                        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
                        fallback="C"
                        size="sm"
                      />
                      <View style={styles.reviewHeaderText}>
                        <Text style={styles.reviewName}>Client</Text>
                        <View style={styles.reviewStars}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Ionicons key={star} name="star" size={14} color="#FFB800" />
                          ))}
                        </View>
                      </View>
                      <Text style={styles.reviewDate}>15 Jul 2026</Text>
                    </View>
                    <Text style={styles.reviewText}>
                      Great communication and arrived on time. The vehicle was clean and the ride was smooth.
                    </Text>
                  </View>
                </CardContent>
              </Card>
            </ScrollView>
          </View>

          {/* Other Drivers */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Other drivers you may like</Text>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              ref={relatedScrollRef}
              style={styles.relatedScroll}
            >
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
        <View style={styles.bottomRating}>
          <Ionicons name="star" size={16} color="#FFB800" />
          <Text style={styles.bottomRatingValue}>{driver.rating}</Text>
          <Text style={styles.bottomRatingLabel}>Avg rating</Text>
        </View>
        <Button onPress={protectedHire} className="rounded-xl px-8 py-3">
          <Text className="text-sm font-bold text-white">Hire</Text>
        </Button>
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
            <View style={styles.fullscreenCounterPill}>
              <Text style={styles.fullscreenCounterText}>
                1 / 1
              </Text>
            </View>
          </View>
        </Animated.View>
      )}
      {authVisible && <WelcomeAuthScreen onDismiss={handleAuthDismiss} />}

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
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
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
  verifiedBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#10B981",
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
  reviewsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  reviewsAllLink: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  reviewsAllText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#EF4444",
    textDecorationLine: "underline",
  },
  reviewsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  reviewsScrollContent: {
    gap: 12,
  },
  reviewCard: {
    width: 280,
    marginRight: 12,
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
  reviewHeaderText: {
    flex: 1,
    gap: 2,
  },
  reviewName: {
    fontSize: 13,
    fontWeight: "700",
    color: NAVY,
  },
  reviewStars: {
    flexDirection: "row",
    gap: 2,
  },
  reviewDate: {
    fontSize: 11,
    fontWeight: "500",
    color: "#9CA3AF",
    marginLeft: "auto",
  },
  reviewText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#4B5563",
    lineHeight: 18,
  },
  cancellationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
  bottomRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  bottomRatingValue: {
    fontSize: 16,
    fontWeight: "800",
    color: NAVY,
  },
  bottomRatingLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
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
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1001,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.1)",
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
  fullscreenCounterPill: {
    backgroundColor: "rgba(0,0,0,0.05)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.08)",
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailsIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  detailsValue: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
  },
  contactNumber: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
    textAlign: "center",
  },
  availableScroll: {
    gap: 10,
    paddingRight: 20,
  },
  timeSlot: {
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 4,
  },
  timeSlotText: {
    fontSize: 13,
    fontWeight: "700",
    color: NAVY,
  },
  timeSlotRange: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
  },
  timeSlotButton: {
    fontSize: 11,
    fontWeight: "700",
    color: "#10B981",
    marginTop: 4,
  },
  timeSlotBooked: {
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    gap: 4,
  },
  timeSlotTextBooked: {
    fontSize: 13,
    fontWeight: "700",
    color: "#B91C1C",
  },
  timeSlotPartial: {
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    gap: 4,
  },
  timeSlotTextPartial: {
    fontSize: 13,
    fontWeight: "700",
    color: "#D97706",
  },
  timeSlotButtonBooked: {
    fontSize: 11,
    fontWeight: "700",
    color: "#B91C1C",
    marginTop: 4,
  },
  assignmentCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
});
