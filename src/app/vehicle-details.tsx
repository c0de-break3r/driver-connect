import { useState, useRef, useEffect } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable, Dimensions, PanResponder, Linking } from "react-native";
import { Image } from "expo-image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Animated } from "react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useAuth } from "@/contexts/AuthProvider";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import { useQuery } from "convex/react";
import { api } from "@/lib/convexApi";
import WelcomeAuthScreen from "@/components/WelcomeAuthScreen";
import Toast from "@/components/Toast";
import { getPendingVehicleTripDates, clearPendingVehicleTripDates } from "@/lib/tripDateBridge";
import { useCallback } from "react";
import { useDoubleTap } from "@/hooks/useDoubleTap";
import { useToast } from "@/hooks/useToast";
import { useAvailabilityStore, DEFAULT_TIME_SLOTS, SlotStatus } from "@/store/useAvailabilityStore";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Chip } from "@/components/ui/chip";
import { Rating } from "@/components/ui/rating";
import { Avatar } from "@/components/ui/avatar";

const NAVY = "#2C3E5B";
const GREEN = "#10B981";

const VEHICLE_FEATURES = [
  { icon: "car-outline", label: "All-wheel drive" },
  { icon: "tv-outline", label: "Backup camera" },
  { icon: "radio-outline", label: "Bluetooth" },
  { icon: "musical-notes-outline", label: "Apple CarPlay" },
  { icon: "snow-outline", label: "Heated seats" },
  { icon: "shield-checkmark-outline", label: "ABS" },
  { icon: "navigate-outline", label: "GPS navigation" },
  { icon: "sun-outline", label: "Sunroof" },
  { icon: "wifi-outline", label: "WiFi hotspot" },
  { icon: "videocam-outline", label: "Dashcam" },
  { icon: "car-sport-outline", label: "Sport mode" },
];

const REVIEWS = [
  { id: 1, name: "Ingrid", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80", rating: 5, date: "28 Jul 2026", text: "Vehicle worked perfectly. Owner was totally flexible and communicative with me. Vehicle handles the driving through various terrains beautifully." },
  { id: 2, name: "Kwame", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80", rating: 5, date: "15 Jul 2026", text: "Excellent service. The car was clean and well-maintained. Pickup was smooth and the owner was very professional." },
  { id: 3, name: "Ama", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80", rating: 4, date: "02 Jul 2026", text: "Great experience overall. Would definitely book again. The vehicle had all the features promised and more." },
  { id: 4, name: "Kofi", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80", rating: 5, date: "20 Jun 2026", text: "Amazing vehicle and even better service. The owner went above and beyond to make sure everything was perfect for our trip." },
];

const VEHICLES = [
  { id: "v1", title: "Toyota Hilux 2022", subtitle: "Double Cab · 4x4 · Ashanti", images: ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80", "https://images.unsplash.com/photo-1507133750069-b736b0a46290?w=800&q=80", "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80"], price: "GH₵ 169", originalPrice: "GH₵ 182", rating: 4.9, trips: 42, seats: "5 seats", fuel: "Gas (Regular)", mpg: "22 MPG", transmission: "Automatic transmission", location: "Kumasi, Ashanti", hostName: "Rochelle", hostAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80", hostRating: 4.9, hostTrips: 3785, joinedDate: "Apr 2021" },
  { id: "v2", title: "Mercedes-Benz C300", subtitle: "Luxury sedan · Greater Accra", images: ["https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80", "https://images.unsplash.com/photo-1617447278431-e1e96c2bff8e?w=800&q=80", "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80"], price: "GH₵ 220", originalPrice: "GH₵ 240", rating: 5.0, trips: 28, seats: "5 seats", fuel: "Petrol", mpg: "25 MPG", transmission: "Automatic transmission", location: "Accra, Greater Accra", hostName: "Rochelle", hostAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80", hostRating: 4.9, hostTrips: 3785, joinedDate: "Apr 2021" },
  { id: "v3", title: "Toyota Hiace 2021", subtitle: "14-seater bus · Central Region", images: ["https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&q=80", "https://images.unsplash.com/photo-1557223562-6c77ef16210f?w=800&q=80"], price: "GH₵ 180", rating: 4.8, trips: 56, seats: "14 seats", fuel: "Diesel", mpg: "18 MPG", transmission: "Manual", location: "Cape Coast, Central", hostName: "Rochelle", hostAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80", hostRating: 4.9, hostTrips: 3785, joinedDate: "Apr 2021" },
  { id: "v4", title: "Yamaha YZF-R3", subtitle: "Sport motorcycle · Accra", images: ["https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80", "https://images.unsplash.com/photo-1558981397-1c40b4d9a057?w=800&q=80"], price: "GH₵ 85", rating: 4.95, trips: 18, seats: "2 seats", fuel: "Petrol", mpg: "45 MPG", transmission: "Manual", location: "Accra, Greater Accra", hostName: "Rochelle", hostAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80", hostRating: 4.9, hostTrips: 3785, joinedDate: "Apr 2021" },
  { id: "f1", title: "Toyota Hilux 2022", subtitle: "Double Cab · 4x4 · Ashanti", images: ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80", "https://images.unsplash.com/photo-1507133750069-b736b0a46290?w=800&q=80"], price: "GH₵ 169", originalPrice: "GH₵ 182", rating: 4.9, trips: 42, seats: "5 seats", fuel: "Gas (Regular)", mpg: "22 MPG", transmission: "Automatic transmission", location: "Kumasi, Ashanti", hostName: "Rochelle", hostAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80", hostRating: 4.9, hostTrips: 3785, joinedDate: "Apr 2021" },
  { id: "f2", title: "Mercedes-Benz C300", subtitle: "Luxury sedan · Greater Accra", images: ["https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80", "https://images.unsplash.com/photo-1617447278431-e1e96c2bff8e?w=800&q=80"], price: "GH₵ 220", rating: 5.0, trips: 28, seats: "5 seats", fuel: "Petrol", mpg: "25 MPG", transmission: "Automatic transmission", location: "Accra, Greater Accra", hostName: "Rochelle", hostAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80", hostRating: 4.9, hostTrips: 3785, joinedDate: "Apr 2021" },
  { id: "f3", title: "Toyota Hiace 2021", subtitle: "14-seater bus · Central Region", images: ["https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&q=80", "https://images.unsplash.com/photo-1557223562-6c77ef16210f?w=800&q=80"], price: "GH₵ 180", rating: 4.8, trips: 56, seats: "14 seats", fuel: "Diesel", mpg: "18 MPG", transmission: "Manual", location: "Cape Coast, Central", hostName: "Rochelle", hostAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80", hostRating: 4.9, hostTrips: 3785, joinedDate: "Apr 2021" },
  { id: "f4", title: "Yamaha YZF-R3", subtitle: "Sport motorcycle · Accra", images: ["https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80", "https://images.unsplash.com/photo-1558981397-1c40b4d9a057?w=800&q=80"], price: "GH₵ 85", rating: 4.95, trips: 18, seats: "2 seats", fuel: "Petrol", mpg: "45 MPG", transmission: "Manual", location: "Accra, Greater Accra", hostName: "Rochelle", hostAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80", hostRating: 4.9, hostTrips: 3785, joinedDate: "Apr 2021" },
];

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function VehicleDetailsScreen() {
  const params = useLocalSearchParams();
  const rawId = params.id;
  const vehicleId = Array.isArray(rawId) ? rawId[0] : typeof rawId === "string" ? rawId : "v1";
  const staticVehicle = VEHICLES.find((v) => v.id === vehicleId);
  const looksLikeConvexId = vehicleId.length > 8;
  const convexVehicle = useQuery(api.jobs.getVehicle, staticVehicle || !looksLikeConvexId ? "skip" : { id: vehicleId as any });
  const rawVehicleParam = params.vehicle;
  const vehicleParam = typeof rawVehicleParam === "string" ? JSON.parse(rawVehicleParam) : Array.isArray(rawVehicleParam) ? JSON.parse(rawVehicleParam[0]) : null;
  const rawVehicle = (vehicleParam || (convexVehicle ?? staticVehicle)) || VEHICLES[0];
  const anyVehicle = rawVehicle as any;
  const vehicle = (anyVehicle ? { ...anyVehicle, id: anyVehicle._id || anyVehicle.id, price: anyVehicle.price ?? `GH₵ ${anyVehicle.pricePerDay}`, originalPrice: anyVehicle.pricePerWeek ? `GH₵ ${anyVehicle.pricePerWeek}` : anyVehicle.originalPrice, location: anyVehicle.location ?? anyVehicle.city, image: anyVehicle.image || anyVehicle.images?.[0] || "", images: Array.isArray(anyVehicle.images) ? anyVehicle.images : anyVehicle.images ? [anyVehicle.images] : [], subtitle: anyVehicle.subtitle || `${anyVehicle.make} ${anyVehicle.model}`, trips: anyVehicle.trips ?? anyVehicle.reviewCount ?? 0, fuel: anyVehicle.fuel || anyVehicle.fuelType || "", mpg: anyVehicle.mpg || "", hostName: anyVehicle.hostName || anyVehicle.ownerId || "", hostAvatar: anyVehicle.hostAvatar || "", hostTrips: anyVehicle.hostTrips || 0, joinedDate: anyVehicle.joinedDate || "", hostRating: anyVehicle.hostRating || anyVehicle.rating || 0 } : VEHICLES[0]) as any;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const [showFullscreenImage, setShowFullscreenImage] = useState(false);
  const [authVisible, setAuthVisible] = useState(false);
  const { toast, showToast, hideToast } = useToast();
  const heartScale = useRef(new Animated.Value(1)).current;
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState<Record<number, boolean>>({});
  const reviewsScrollRef = useRef<ScrollView>(null);
  const reviewsAutoSwipeRef = useRef<NodeJS.Timeout | null>(null);
  const swipeY = useRef(new Animated.Value(0)).current;
  const [pickupDate, setPickupDate] = useState("Sat, 26 Sep");
  const [returnDate, setReturnDate] = useState("Tue, 29 Sep");
  const [pickupTime, setPickupTime] = useState("10:00 am");
  const [returnTime, setReturnTime] = useState("10:00 am");
  const [assignedDriver, setAssignedDriver] = useState<{ id?: string; name?: string } | null>(null);

  const handleRelatedVehiclePress = useDoubleTap((relatedId: string) => { router.push(`/vehicle-details?id=${relatedId}`); });

  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const fullscreenScrollRef = useRef<ScrollView>(null);
  const fullscreenAnim = useRef(new Animated.Value(0)).current;

  const { signedIn, userId } = useAuth();
  const isFavorited = useFavoritesStore((state) => state.isFavorite(vehicle.id));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const availability = useAvailabilityStore();
  const today = new Date().toISOString().split("T")[0];
  const currentUserId = userId || "guest";

  useEffect(() => { availability.load(); if (availability.bookings.length === 0) availability.seedDemo(); }, [availability]);

  const getVehicleSlotStatus = (slotStart: string, slotEnd: string) => availability.getSlotStatus(today, slotStart, slotEnd, vehicle.id, "vehicle");

  const handleBookVehicleSlot = (slotStart: string, slotEnd: string) => {
    if (!signedIn) { setAuthVisible(true); return; }
    const status = getVehicleSlotStatus(slotStart, slotEnd);
    if (status === "booked") { showToast("This slot is already booked. Join the waitlist?", "warning"); return; }
    if (status === "partial") { showToast("This slot partially overlaps with an existing booking.", "warning"); return; }
    availability.addBooking({ vehicleId: vehicle.id, date: today, slotStart, slotEnd, status: "pending", userId: currentUserId, renterName: "You" });
    showToast("Booking requested! Waiting for confirmation.", "success");
  };

  const handleJoinVehicleWaitlist = (slotStart: string, slotEnd: string) => {
    if (!signedIn) { setAuthVisible(true); return; }
    const alreadyOnWaitlist = availability.isOnWaitlist(today, slotStart, currentUserId, vehicle.id, "vehicle");
    if (alreadyOnWaitlist) { showToast("You are already on the waitlist for this slot.", "info"); return; }
    availability.joinWaitlist({ vehicleId: vehicle.id, date: today, slotStart, slotEnd, userId: currentUserId });
    const position = availability.getWaitlistPosition(today, slotStart, currentUserId, vehicle.id, "vehicle");
    showToast(`Joined waitlist. Position: #${position}`, "success");
  };

  const handleLeaveVehicleWaitlist = (slotStart: string, slotEnd: string) => {
    const entry = availability.waitlist.find((w) => w.date === today && w.slotStart === slotStart && w.userId === currentUserId && w.vehicleId === vehicle.id);
    if (entry) { availability.leaveWaitlist(entry.id); showToast("Left waitlist.", "info"); }
  };

  useEffect(() => { setCurrentImageIndex(0); scrollRef.current?.scrollTo({ x: 0, animated: false }); }, [vehicleId]);

  useEffect(() => {
    const reviewCards = 2;
    if (reviewCards <= 1) return;
    reviewsAutoSwipeRef.current = setInterval(() => {
      reviewsScrollRef.current?.scrollTo({ x: 0, animated: true });
      setTimeout(() => { reviewsScrollRef.current?.scrollTo({ x: SCREEN_WIDTH - 40, animated: true }); }, 300);
    }, 4000);
    return () => { if (reviewsAutoSwipeRef.current) clearInterval(reviewsAutoSwipeRef.current); };
  }, [vehicleId]);

  useEffect(() => {
    if (showFullscreenImage) {
      fullscreenAnim.setValue(0);
      Animated.timing(fullscreenAnim, { toValue: 1, duration: 280, useNativeDriver: true }).start();
      setFullscreenIndex(0);
      fullscreenScrollRef.current?.scrollTo({ x: 0, animated: false });
    }
  }, [showFullscreenImage]);

  useFocusEffect(useCallback(() => {
    const pending = getPendingVehicleTripDates();
    if (pending) {
      setPickupDate(pending.pickupDate); setReturnDate(pending.returnDate);
      setPickupTime(pending.pickupTime); setReturnTime(pending.returnTime);
      if (pending.driverId) setAssignedDriver({ id: pending.driverId, name: pending.driverName });
      clearPendingVehicleTripDates();
    }
  }, []));

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
    if (!signedIn) { setAuthVisible(true); return; }
    toggleFavorite(vehicle.id);
    showToast(isFavorited ? "Removed from favorites" : "Added to favorites", "success");
  };

  const handleAuthDismiss = () => { setAuthVisible(false); };

  const handleAddTrips = () => {
    router.push({ pathname: "/favorites/trip-dates", params: { source: "vehicle", defaultPickupDate: pickupDate, defaultReturnDate: returnDate, defaultPickupTime: pickupTime, defaultReturnTime: returnTime, vehicleTitle: vehicle.title } } as any);
  };

  const handleContactHost = () => { showToast("Opening chat with host...", "info"); };
  const handlePayHost = () => { showToast("Payment options: Online (Mobile Money/Card) or Cash on pickup", "info"); };

  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 10 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
    onPanResponderMove: (_, gestureState) => { if (gestureState.dy > 0) swipeY.setValue(gestureState.dy); },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 150) { Animated.timing(swipeY, { toValue: SCREEN_HEIGHT, duration: 200, useNativeDriver: true }).start(() => router.back()); }
      else { Animated.spring(swipeY, { toValue: 0, useNativeDriver: true, tension: 180, friction: 8 }).start(); }
    },
  })).current;

  const handleBook = () => { router.push(`/(client)/book-now?vehicleId=${vehicle.id}` as any); };
  const handleCall = () => { Linking.openURL("tel:+233241234567"); };
  const handleMessage = () => { Linking.openURL("sms:+233241234567"); };

  const protectedBook = useDoubleTap(handleBook, { cooldownMs: 800 });
  const protectedCall = useDoubleTap(handleCall, { cooldownMs: 800 });
  const protectedMessage = useDoubleTap(handleMessage, { cooldownMs: 800 });

  const openFullscreenImage = () => { setShowFullscreenImage(true); };
  const closeFullscreenImage = () => { setShowFullscreenImage(false); };
  const handleFullscreenMomentum = (e: any) => { const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH); setFullscreenIndex(index); };

  return (
    <Animated.View key={vehicleId} style={[styles.safeArea, { transform: [{ translateY: swipeY }] }]} {...panResponder.panHandlers}>
      <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.imageWrap}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} ref={scrollRef} onMomentumScrollEnd={(e) => { const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH); setCurrentImageIndex(index); }}>
            {vehicle.images.map((image: string, index: number) => (
              <Pressable key={index} onPress={openFullscreenImage}>
                <Image source={{ uri: image }} style={styles.heroImage} contentFit="cover" />
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>{currentImageIndex + 1} / {vehicle.images.length}</Text>
          </View>

          <View style={styles.topActions}>
            <Button variant="ghost" size="icon" onPress={() => router.back()} className="w-10 h-10 rounded-full bg-black/30 border border-white/20">
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </Button>
            <View style={styles.topRightActions}>
              <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full bg-black/30 border border-white/20">
                <Ionicons name="share-outline" size={22} color="#FFFFFF" />
              </Button>
              <Button variant="ghost" size="icon" onPress={handleFavorite} className="w-10 h-10 rounded-full bg-black/30 border border-white/20">
                <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                  <Ionicons name={isFavorited ? "heart" : "heart-outline"} size={22} color={isFavorited ? "#E74C3C" : "#FFFFFF"} />
                </Animated.View>
              </Button>
            </View>
          </View>

          <View style={styles.expandHint}>
            <Ionicons name="expand-outline" size={18} color="#FFFFFF" />
            <Text style={styles.expandHintText}>Tap to expand</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View style={styles.titleWrap}>
              <Text style={styles.title}>{vehicle.title}</Text>
              <Text style={styles.subtitle}>{vehicle.subtitle}</Text>
            </View>
            <View style={styles.priceBadge}>
              <Text style={styles.priceBadgeText}>{vehicle.price}</Text>
              <Text style={styles.priceBadgeSub}>/day</Text>
            </View>
          </View>

          <View style={styles.ratingRow}>
            <Badge variant="secondary" className="flex-row items-center gap-1 bg-amber-50 border-amber-200">
              <Ionicons name="star" size={14} color="#FFB800" />
              <Text className="text-xs font-bold text-amber-700">{vehicle.rating}</Text>
            </Badge>
            <Text style={styles.tripsText}>({vehicle.trips} trips)</Text>
            <Badge variant="secondary" className="flex-row items-center gap-1 bg-emerald-50 border-emerald-200">
              <Ionicons name="checkmark-circle" size={12} color="#10B981" />
              <Text className="text-xs font-bold text-emerald-600">Verified</Text>
            </Badge>
          </View>

          <View style={styles.tagsRow}>
            {vehicle.seats && (
              <Chip variant="outline" size="sm" className="flex-row items-center gap-1 border-gray-200 bg-gray-50">
                <MaterialCommunityIcons name="car-seat" size={14} color={NAVY} />
                <Text className="text-xs font-semibold" style={{ color: NAVY }}>{vehicle.seats}</Text>
              </Chip>
            )}
            {vehicle.fuel && (
              <Chip variant="outline" size="sm" className="flex-row items-center gap-1 border-gray-200 bg-gray-50">
                <MaterialCommunityIcons name="fuel" size={14} color={NAVY} />
                <Text className="text-xs font-semibold" style={{ color: NAVY }}>{vehicle.fuel}</Text>
              </Chip>
            )}
            {vehicle.mpg && (
              <Chip variant="outline" size="sm" className="flex-row items-center gap-1 border-gray-200 bg-gray-50">
                <Ionicons name="speedometer-outline" size={14} color={NAVY} />
                <Text className="text-xs font-semibold" style={{ color: NAVY }}>{vehicle.mpg}</Text>
              </Chip>
            )}
            {vehicle.transmission && (
              <Chip variant="outline" size="sm" className="flex-row items-center gap-1 border-gray-200 bg-gray-50">
                <Ionicons name="settings-outline" size={14} color={NAVY} />
                <Text className="text-xs font-semibold" style={{ color: NAVY }}>{vehicle.transmission}</Text>
              </Chip>
            )}
          </View>

          <View style={styles.section}>
            <Text className="text-base font-extrabold mb-3" style={{ color: NAVY }}>Details</Text>
            <Card className="bg-gray-50 border-gray-200 gap-4">
              <View className="flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-full bg-gray-200 items-center justify-center border border-gray-300">
                  <Ionicons name="location-outline" size={20} color={NAVY} />
                </View>
                <Text className="text-sm font-bold" style={{ color: NAVY }}>{vehicle.location || "Accra, Ghana"}</Text>
              </View>
              <View className="flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-full bg-gray-200 items-center justify-center border border-gray-300">
                  <Ionicons name="time-outline" size={20} color={NAVY} />
                </View>
                <Text className="text-sm font-bold" style={{ color: NAVY }}>Morning · 7:00 am - 12:30 pm</Text>
              </View>
              <View className="flex-row items-center gap-3">
                <Button variant="ghost" size="icon" onPress={protectedCall} className="w-9 h-9 rounded-full bg-gray-200 items-center justify-center border border-gray-300">
                  <Ionicons name="call-outline" size={20} color={NAVY} />
                </Button>
                <Text style={styles.contactNumber}>+233 24 123 4567</Text>
                <Button variant="ghost" size="icon" onPress={protectedMessage} className="w-9 h-9 rounded-full bg-gray-200 items-center justify-center border border-gray-300">
                  <Ionicons name="chatbubble-outline" size={20} color={NAVY} />
                </Button>
              </View>
            </Card>
          </View>

          <View style={styles.section}>
            <Text className="text-base font-extrabold mb-3" style={{ color: NAVY }}>Available today</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.availableScroll}>
              {DEFAULT_TIME_SLOTS.map((slot) => {
                const status = getVehicleSlotStatus(slot.start, slot.end);
                const waitlistPosition = availability.getWaitlistPosition(today, slot.start, currentUserId, vehicle.id, "vehicle");
                const onWaitlist = waitlistPosition > 0;
                const isBooked = status === "booked";
                const isPartial = status === "partial";

                let slotBg = "bg-gray-100 border-gray-200";
                let textColor = NAVY;
                let rangeColor = "#6B7280";
                let btnColor = "#10B981";
                let buttonText = "Book";
                let onPress = () => handleBookVehicleSlot(slot.start, slot.end);

                if (isBooked) {
                  slotBg = "bg-red-50 border-red-200";
                  textColor = "#B91C1C";
                  rangeColor = "#B91C1C";
                  btnColor = "#B91C1C";
                  buttonText = onWaitlist ? `Waitlist #${waitlistPosition}` : "Waitlist";
                  onPress = onWaitlist ? () => handleLeaveVehicleWaitlist(slot.start, slot.end) : () => handleJoinVehicleWaitlist(slot.start, slot.end);
                } else if (isPartial) {
                  slotBg = "bg-amber-50 border-amber-200";
                  textColor = "#D97706";
                  rangeColor = "#D97706";
                  btnColor = "#D97706";
                  buttonText = "Partial";
                  onPress = () => {};
                }

                return (
                  <Pressable key={slot.label} style={[styles.timeSlot, { backgroundColor: slotBg === "bg-gray-100 border-gray-200" ? "#F3F4F6" : isBooked ? "#FEF2F2" : "#FFFBEB" }]} onPress={onPress}>
                    <Text className="text-xs font-bold" style={{ color: textColor }}>{slot.label}</Text>
                    <Text className="text-[11px] font-semibold" style={{ color: rangeColor }}>{slot.start} - {slot.end}</Text>
                    <Text className="text-[11px] font-bold mt-1" style={{ color: btnColor }}>{buttonText}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text className="text-base font-extrabold mb-3" style={{ color: NAVY }}>Vehicle Overview</Text>
            <View style={styles.overviewGrid}>
              <Card className="bg-gray-50 border-gray-200 flex-1 min-w-[45%]">
                <Text className="text-sm font-extrabold" style={{ color: NAVY }}>4x4</Text>
                <Text className="text-xs font-medium text-gray-500 mt-1">Drive type</Text>
              </Card>
              <Card className="bg-gray-50 border-gray-200 flex-1 min-w-[45%]">
                <Text className="text-sm font-extrabold" style={{ color: NAVY }}>{vehicle.seats}</Text>
                <Text className="text-xs font-medium text-gray-500 mt-1">Seats</Text>
              </Card>
              <Card className="bg-gray-50 border-gray-200 flex-1 min-w-[45%]">
                <Text className="text-sm font-extrabold" style={{ color: NAVY }}>{vehicle.mpg}</Text>
                <Text className="text-xs font-medium text-gray-500 mt-1">Fuel economy</Text>
              </Card>
              <Card className="bg-gray-50 border-gray-200 flex-1 min-w-[45%]">
                <Text className="text-sm font-extrabold" style={{ color: NAVY }}>{vehicle.transmission}</Text>
                <Text className="text-xs font-medium text-gray-500 mt-1">Transmission</Text>
              </Card>
            </View>
          </View>

          <View style={styles.section}>
            <Text className="text-base font-extrabold mb-3" style={{ color: NAVY }}>What this vehicle offers</Text>
            <Card className="bg-gray-50 border-gray-200 gap-3">
              {(showAllFeatures ? VEHICLE_FEATURES : VEHICLE_FEATURES.slice(0, 4)).map((feature, index) => (
                <View key={index} className="flex-row items-center gap-3">
                  <View className="w-9 h-9 rounded-full bg-gray-200 items-center justify-center border border-gray-300">
                    <Ionicons name={feature.icon as any} size={18} color={NAVY} />
                  </View>
                  <Text className="text-sm font-semibold" style={{ color: NAVY }}>{feature.label}</Text>
                </View>
              ))}
            </Card>
            <Button variant="outline" onPress={() => setShowAllFeatures((prev) => !prev)} className="mt-3 rounded-xl py-3 border-gray-200 bg-gray-50">
              <Text className="text-sm font-bold" style={{ color: NAVY }}>{showAllFeatures ? "Show less" : `See all ${VEHICLE_FEATURES.length} features`}</Text>
              <Ionicons name={showAllFeatures ? "chevron-up" : "chevron-forward"} size={18} color={NAVY} />
            </Button>
          </View>

          <View style={styles.section}>
            <Text className="text-base font-extrabold mb-3" style={{ color: NAVY }}>Your Host</Text>
            <Pressable style={styles.hostCard}>
              <Image source={{ uri: vehicle.hostAvatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80" }} style={styles.hostAvatar} contentFit="cover" />
              <View style={styles.hostInfo}>
                <Text style={styles.hostName}>{vehicle.hostName || "Rochelle"}</Text>
                <Text style={styles.hostMeta}>{vehicle.hostTrips || 3785} trips · Joined {vehicle.joinedDate || "Apr 2021"}</Text>
              </View>
              <View style={styles.hostRatingBadge}>
                <Text style={styles.hostRatingText}>{vehicle.hostRating || 4.9}</Text>
                <Ionicons name="star" size={12} color="#FFB800" />
              </View>
            </Pressable>
          </View>

          <View style={styles.section}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-base font-extrabold" style={{ color: NAVY }}>Reviews</Text>
              <Button variant="ghost" onPress={() => router.push(`/(driver)/reviews?vehicleId=${vehicle.id}` as any)} className="px-2 py-1">
                <Text className="text-sm font-bold text-red-500">All</Text>
              </Button>
            </View>
            <View className="flex-row items-center gap-2 mb-4">
              <Text className="text-2xl font-extrabold" style={{ color: NAVY }}>5.0</Text>
              <Ionicons name="star" size={16} color="#FFB800" />
              <Text className="text-sm font-medium text-gray-500">({vehicle.trips} ratings)</Text>
            </View>

            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} ref={reviewsScrollRef}>
              {REVIEWS.map((review) => {
                const isExpanded = !!expandedReviews[review.id];
                const displayText = isExpanded ? review.text : `${review.text.slice(0, 120)}...`;
                return (
                  <Card key={review.id} className="bg-gray-50 border-gray-200 mr-3 w-[SCREEN_WIDTH - 80]">
                    <View className="flex-row gap-3">
                      <Avatar source={{ uri: review.avatar }} size="md" />
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2 mb-2">
                          <Text className="text-sm font-bold" style={{ color: NAVY }}>{review.name}</Text>
                          <View className="flex-row gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => <Ionicons key={star} name="star" size={12} color="#FFB800" />)}
                          </View>
                          <Text className="text-xs font-medium text-gray-400 ml-auto">{review.date}</Text>
                        </View>
                        <Text className="text-xs font-medium text-gray-500 leading-5">{displayText}</Text>
                        {review.text.length > 120 && (
                          <Button variant="ghost" onPress={() => setExpandedReviews((prev) => ({ ...prev, [review.id]: !prev[review.id] }))} className="px-0 py-2 self-start">
                            <Text className="text-xs font-bold text-emerald-600">{isExpanded ? "Show less" : "Read more"}</Text>
                          </Button>
                        )}
                      </View>
                    </View>
                  </Card>
                );
              })}
            </ScrollView>

            <View style={styles.reviewDots}>
              {REVIEWS.map((_, index) => (
                <View key={index} style={[styles.reviewDot, index === 0 && styles.reviewDotActive]} />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text className="text-base font-extrabold mb-3" style={{ color: NAVY }}>Cancellation Policy</Text>
            <Card className="bg-gray-50 border-gray-200 flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center border border-gray-300">
                <Ionicons name="shield-checkmark-outline" size={22} color={NAVY} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold" style={{ color: NAVY }}>Free cancellation</Text>
                <Text className="text-xs font-medium text-gray-500 mt-1">Full refund within 24 hours of booking.</Text>
              </View>
            </Card>
          </View>

          <View style={styles.section}>
            <Text className="text-base font-extrabold mb-3" style={{ color: NAVY }}>You may also like</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.relatedScroll}>
              {VEHICLES.filter((v) => v.id !== vehicle.id).slice(0, 5).map((related) => (
                <Pressable key={related.id} style={styles.relatedCard} onPress={() => handleRelatedVehiclePress(related.id)}>
                  <Image source={{ uri: related.images[0] }} style={styles.relatedImage} contentFit="cover" />
                  <View style={styles.relatedBody}>
                    <Text style={styles.relatedTitle} numberOfLines={1}>{related.title}</Text>
                    <Text style={styles.relatedPrice}>{related.price}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.bottomRating}>
          <Ionicons name="star" size={16} color="#FFB800" />
          <Text style={styles.bottomRatingValue}>{vehicle.rating}</Text>
          <Text style={styles.bottomRatingLabel}>Avg rating</Text>
        </View>
        <Button onPress={protectedBook} className="rounded-xl px-8 py-3">
          <Text className="text-sm font-bold text-white">Book</Text>
        </Button>
      </View>

      {showFullscreenImage && (
        <Animated.View style={[styles.fullscreenOverlay, { opacity: fullscreenAnim }]}>
          <Button variant="ghost" size="icon" onPress={closeFullscreenImage} className="absolute top-12 right-4 w-10 h-10 rounded-full bg-black/5 items-center justify-center z-50">
            <Ionicons name="close" size={24} color={NAVY} />
          </Button>

          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} ref={fullscreenScrollRef} onMomentumScrollEnd={handleFullscreenMomentum}>
            {vehicle.images.map((image: string, index: number) => (
              <Image key={index} source={{ uri: image }} style={styles.fullscreenImage} contentFit="contain" />
            ))}
          </ScrollView>

          <View style={styles.fullscreenCounter}>
            <Text style={styles.fullscreenCounterText}>{fullscreenIndex + 1} / {vehicle.images.length}</Text>
          </View>
        </Animated.View>
      )}
      {authVisible && <WelcomeAuthScreen onDismiss={handleAuthDismiss} />}
      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  contentScroll: { flex: 1, backgroundColor: "#FFFFFF" },
  imageWrap: { position: "relative", width: "100%", height: 300 },
  heroImage: { width: SCREEN_WIDTH, height: 300 },
  imageCounter: { position: "absolute", bottom: 16, left: 16, backgroundColor: "rgba(0,0,0,0.55)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  imageCounterText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600" },
  topActions: { position: "absolute", top: 48, left: 16, right: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  topRightActions: { flexDirection: "row", gap: 12 },
  expandHint: { position: "absolute", bottom: 16, right: 16, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(0,0,0,0.45)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  expandHintText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600" },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },
  titleRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12, gap: 12 },
  titleWrap: { flex: 1 },
  title: { fontSize: 24, fontWeight: "800", color: NAVY, marginBottom: 4 },
  subtitle: { fontSize: 14, fontWeight: "500", color: "#6B7280" },
  priceBadge: { backgroundColor: "#F0FDF4", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: "#D1FAE5", alignItems: "center" },
  priceBadgeText: { fontSize: 16, fontWeight: "800", color: "#10B981" },
  priceBadgeSub: { fontSize: 11, fontWeight: "600", color: "#6B7280" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  tripsText: { fontSize: 14, fontWeight: "500", color: "#6B7280" },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 },
  section: { marginBottom: 28 },
  contactNumber: { flex: 1, fontSize: 15, fontWeight: "700", color: NAVY, textAlign: "center" },
  availableScroll: { gap: 10, paddingRight: 20 },
  timeSlot: { alignItems: "center", paddingHorizontal: 18, paddingVertical: 14, borderRadius: 20, borderWidth: 1, gap: 4 },
  overviewGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  hostCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#F9FAFB", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#E5E7EB" },
  hostAvatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: "#E5E7EB" },
  hostInfo: { flex: 1 },
  hostName: { fontSize: 16, fontWeight: "700", color: NAVY, marginBottom: 2 },
  hostMeta: { fontSize: 13, fontWeight: "500", color: "#6B7280" },
  hostRatingBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FEF3C7", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: "#FDE68A" },
  hostRatingText: { fontSize: 14, fontWeight: "700", color: NAVY },
  reviewDots: { flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 16 },
  reviewDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#D1D5DB" },
  reviewDotActive: { backgroundColor: NAVY },
  relatedScroll: { marginHorizontal: -4 },
  relatedCard: { width: 160, backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#E5E7EB", overflow: "hidden", marginHorizontal: 4 },
  relatedImage: { width: "100%", height: 110 },
  relatedBody: { padding: 10, gap: 4 },
  relatedTitle: { fontSize: 13, fontWeight: "700", color: NAVY },
  relatedPrice: { fontSize: 13, fontWeight: "700", color: GREEN },
  bottomSpacer: { height: 20 },
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: "#E5E7EB" },
  bottomRating: { flexDirection: "row", alignItems: "center", gap: 6 },
  bottomRatingValue: { fontSize: 16, fontWeight: "700", color: NAVY },
  bottomRatingLabel: { fontSize: 13, fontWeight: "500", color: "#6B7280" },
  fullscreenOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#FFFFFF", zIndex: 1000, justifyContent: "center", alignItems: "center" },
  fullscreenImage: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
  fullscreenCounter: { position: "absolute", bottom: 32, left: 0, right: 0, alignItems: "center" },
  fullscreenCounterText: { color: NAVY, fontSize: 14, fontWeight: "600" },
});
