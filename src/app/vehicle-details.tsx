import { useState, useRef, useEffect } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable, Dimensions, PanResponder, Alert, Modal, TextInput } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Animated } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/contexts/AuthProvider";
import { useQuery } from "convex/react";
import { api } from "@/lib/convexApi";
import WelcomeAuthScreen from "@/components/WelcomeAuthScreen";
import Toast from "@/components/Toast";

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
  {
    id: "v1",
    title: "Toyota Hilux 2022",
    subtitle: "Double Cab · 4x4 · Ashanti",
    images: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
      "https://images.unsplash.com/photo-1507133750069-b736b0a46290?w=800&q=80",
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80",
    ],
    price: "GH₵ 169",
    originalPrice: "GH₵ 182",
    rating: 4.9,
    trips: 42,
    seats: "5 seats",
    fuel: "Gas (Regular)",
    mpg: "22 MPG",
    transmission: "Automatic transmission",
    location: "Kumasi, Ashanti",
    hostName: "Rochelle",
    hostAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    hostRating: 4.9,
    hostTrips: 3785,
    joinedDate: "Apr 2021",
  },
  {
    id: "v2",
    title: "Mercedes-Benz C300",
    subtitle: "Luxury sedan · Greater Accra",
    images: [
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
      "https://images.unsplash.com/photo-1617447278431-e1e96c2bff8e?w=800&q=80",
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80",
    ],
    price: "GH₵ 220",
    originalPrice: "GH₵ 240",
    rating: 5.0,
    trips: 28,
    seats: "5 seats",
    fuel: "Petrol",
    mpg: "25 MPG",
    transmission: "Automatic transmission",
    location: "Accra, Greater Accra",
    hostName: "Rochelle",
    hostAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    hostRating: 4.9,
    hostTrips: 3785,
    joinedDate: "Apr 2021",
  },
  {
    id: "v3",
    title: "Toyota Hiace 2021",
    subtitle: "14-seater bus · Central Region",
    images: [
      "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&q=80",
      "https://images.unsplash.com/photo-1557223562-6c77ef16210f?w=800&q=80",
    ],
    price: "GH₵ 180",
    rating: 4.8,
    trips: 56,
    seats: "14 seats",
    fuel: "Diesel",
    mpg: "18 MPG",
    transmission: "Manual",
    location: "Cape Coast, Central",
    hostName: "Rochelle",
    hostAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    hostRating: 4.9,
    hostTrips: 3785,
    joinedDate: "Apr 2021",
  },
  {
    id: "v4",
    title: "Yamaha YZF-R3",
    subtitle: "Sport motorcycle · Accra",
    images: [
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80",
      "https://images.unsplash.com/photo-1558981397-1c40b4d9a057?w=800&q=80",
    ],
    price: "GH₵ 85",
    rating: 4.95,
    trips: 18,
    seats: "2 seats",
    fuel: "Petrol",
    mpg: "45 MPG",
    transmission: "Manual",
    location: "Accra, Greater Accra",
    hostName: "Rochelle",
    hostAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    hostRating: 4.9,
    hostTrips: 3785,
    joinedDate: "Apr 2021",
  },
  {
    id: "f1",
    title: "Toyota Hilux 2022",
    subtitle: "Double Cab · 4x4 · Ashanti",
    images: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
      "https://images.unsplash.com/photo-1507133750069-b736b0a46290?w=800&q=80",
    ],
    price: "GH₵ 169",
    originalPrice: "GH₵ 182",
    rating: 4.9,
    trips: 42,
    seats: "5 seats",
    fuel: "Gas (Regular)",
    mpg: "22 MPG",
    transmission: "Automatic transmission",
    location: "Kumasi, Ashanti",
    hostName: "Rochelle",
    hostAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    hostRating: 4.9,
    hostTrips: 3785,
    joinedDate: "Apr 2021",
  },
  {
    id: "f2",
    title: "Mercedes-Benz C300",
    subtitle: "Luxury sedan · Greater Accra",
    images: [
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
      "https://images.unsplash.com/photo-1617447278431-e1e96c2bff8e?w=800&q=80",
    ],
    price: "GH₵ 220",
    rating: 5.0,
    trips: 28,
    seats: "5 seats",
    fuel: "Petrol",
    mpg: "25 MPG",
    transmission: "Automatic transmission",
    location: "Accra, Greater Accra",
    hostName: "Rochelle",
    hostAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    hostRating: 4.9,
    hostTrips: 3785,
    joinedDate: "Apr 2021",
  },
  {
    id: "f3",
    title: "Toyota Hiace 2021",
    subtitle: "14-seater bus · Central Region",
    images: [
      "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&q=80",
      "https://images.unsplash.com/photo-1557223562-6c77ef16210f?w=800&q=80",
    ],
    price: "GH₵ 180",
    rating: 4.8,
    trips: 56,
    seats: "14 seats",
    fuel: "Diesel",
    mpg: "18 MPG",
    transmission: "Manual",
    location: "Cape Coast, Central",
    hostName: "Rochelle",
    hostAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    hostRating: 4.9,
    hostTrips: 3785,
    joinedDate: "Apr 2021",
  },
  {
    id: "f4",
    title: "Yamaha YZF-R3",
    subtitle: "Sport motorcycle · Accra",
    images: [
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80",
      "https://images.unsplash.com/photo-1558981397-1c40b4d9a057?w=800&q=80",
    ],
    price: "GH₵ 85",
    rating: 4.95,
    trips: 18,
    seats: "2 seats",
    fuel: "Petrol",
    mpg: "45 MPG",
    transmission: "Manual",
    location: "Accra, Greater Accra",
    hostName: "Rochelle",
    hostAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    hostRating: 4.9,
    hostTrips: 3785,
    joinedDate: "Apr 2021",
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function VehicleDetailsScreen() {
  const params = useLocalSearchParams();
  const rawId = params.id;
  const vehicleId = Array.isArray(rawId) ? rawId[0] : typeof rawId === "string" ? rawId : "v1";
  const staticVehicle = VEHICLES.find((v) => v.id === vehicleId);
  const looksLikeConvexId = vehicleId.length > 8;
  const convexVehicle = useQuery(
    api.jobs.getVehicle,
    staticVehicle || !looksLikeConvexId ? "skip" : { id: vehicleId as any }
  );
  const rawVehicle = (convexVehicle ?? staticVehicle) || VEHICLES[0];
  const anyVehicle = rawVehicle as any;
  const vehicle = (anyVehicle
    ? {
        ...anyVehicle,
        id: anyVehicle._id || anyVehicle.id,
        price: anyVehicle.price ?? `GH₵ ${anyVehicle.pricePerDay}`,
        originalPrice: anyVehicle.pricePerWeek ? `GH₵ ${anyVehicle.pricePerWeek}` : anyVehicle.originalPrice,
        location: anyVehicle.location ?? anyVehicle.city,
        image: anyVehicle.image || anyVehicle.images?.[0] || "",
        subtitle: anyVehicle.subtitle || `${anyVehicle.make} ${anyVehicle.model}`,
        trips: anyVehicle.trips ?? anyVehicle.reviewCount ?? 0,
        fuel: anyVehicle.fuel || anyVehicle.fuelType || "",
        mpg: anyVehicle.mpg || "",
        hostName: anyVehicle.hostName || anyVehicle.ownerId || "",
        hostAvatar: anyVehicle.hostAvatar || "",
        hostTrips: anyVehicle.hostTrips || 0,
        joinedDate: anyVehicle.joinedDate || "",
        hostRating: anyVehicle.hostRating || anyVehicle.rating || 0,
      }
    : VEHICLES[0]) as any;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFullscreenImage, setShowFullscreenImage] = useState(false);
  const [authVisible, setAuthVisible] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: "success" | "error" | "info" | "warning" }>({ visible: false, message: "", type: "success" });
  const heartScale = useRef(new Animated.Value(1)).current;
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState<Record<number, boolean>>({});
  const reviewsScrollRef = useRef<ScrollView>(null);
  const swipeY = useRef(new Animated.Value(0)).current;
  const [editTripVisible, setEditTripVisible] = useState(false);
  const [editTripType, setEditTripType] = useState<"pickup" | "return">("pickup");
  const [pickupDate, setPickupDate] = useState("Sat, 26 Sep");
  const [returnDate, setReturnDate] = useState("Tue, 29 Sep");

  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: "", type: "success" }), 2500);
  };

  // Fullscreen gallery state
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const fullscreenScrollRef = useRef<ScrollView>(null);
  const fullscreenAnim = useRef(new Animated.Value(0)).current;

  const { signedIn } = useAuth();

  useEffect(() => {
    setCurrentImageIndex(0);
    scrollRef.current?.scrollTo({ x: 0, animated: false });
  }, [vehicleId]);

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
      id: vehicle.id,
      title: vehicle.title,
      image: vehicle.images?.[0] || "",
      price: vehicle.price,
      location: vehicle.location,
      rating: vehicle.rating,
    }))}` as any);
  };

  const handleAuthDismiss = () => {
    setAuthVisible(false);
  };

  const handleEditTrip = (type: "pickup" | "return") => {
    setEditTripType(type);
    setEditTripVisible(true);
  };

  const handleSaveTripEdit = () => {
    if (editTripType === "pickup") {
      setPickupDate(pickupDate);
    } else {
      setReturnDate(returnDate);
    }
    setEditTripVisible(false);
    showToast("Trip dates updated", "success");
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 10 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          swipeY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150) {
          Animated.timing(swipeY, {
            toValue: SCREEN_HEIGHT,
            duration: 200,
            useNativeDriver: true,
          }).start(() => router.back());
        } else {
          Animated.spring(swipeY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 180,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  const handleBook = () => {
    showToast(`Booking ${vehicle.title}...`, "success");
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
    <Animated.View
      key={vehicleId}
      style={[
        styles.safeArea,
        {
          transform: [{ translateY: swipeY }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      {/* Hero Image Gallery */}
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
          {vehicle.images.map((image: string, index: number) => (
            <Pressable key={index} onPress={openFullscreenImage}>
              <Image source={{ uri: image }} style={styles.heroImage} contentFit="cover" />
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.imageCounter}>
          <Text style={styles.imageCounterText}>
            {currentImageIndex + 1} / {vehicle.images.length}
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

      <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
        {/* Title & Rating */}
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
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={16} color="#FFB800" />
              <Text style={styles.ratingText}>{vehicle.rating}</Text>
            </View>
            <Text style={styles.tripsText}>({vehicle.trips} trips)</Text>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={GREEN} />
              <Text style={styles.verifiedBadgeText}>Verified</Text>
            </View>
          </View>

          {/* Tags */}
          <View style={styles.tagsRow}>
            {vehicle.seats && (
              <View style={styles.tag}>
                <Ionicons name="people-outline" size={14} color={NAVY} />
                <Text style={styles.tagText}>{vehicle.seats}</Text>
              </View>
            )}
            {vehicle.fuel && (
              <View style={styles.tag}>
                <Ionicons name="car-sport-outline" size={14} color={NAVY} />
                <Text style={styles.tagText}>{vehicle.fuel}</Text>
              </View>
            )}
            {vehicle.mpg && (
              <View style={styles.tag}>
                <Ionicons name="speedometer-outline" size={14} color={NAVY} />
                <Text style={styles.tagText}>{vehicle.mpg}</Text>
              </View>
            )}
            {vehicle.transmission && (
              <View style={styles.tag}>
                <Ionicons name="settings-outline" size={14} color={NAVY} />
                <Text style={styles.tagText}>{vehicle.transmission}</Text>
              </View>
            )}
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
                <Text style={styles.tripValue}>{pickupDate} · 10:00 am</Text>
              </View>
              <Pressable style={styles.editButton} onPress={() => handleEditTrip("pickup")}>
                <Ionicons name="pencil-outline" size={18} color={NAVY} />
              </Pressable>
            </View>
            <View style={[styles.tripRow, { marginTop: 16 }]}>
              <View style={styles.tripIcon}>
                <Ionicons name="location-outline" size={20} color={NAVY} />
              </View>
              <View style={styles.tripInfo}>
                <Text style={styles.tripLabel}>Return</Text>
                <Text style={styles.tripValue}>{returnDate} · 10:00 am</Text>
              </View>
              <Pressable style={styles.editButton} onPress={() => handleEditTrip("return")}>
                <Ionicons name="pencil-outline" size={18} color={NAVY} />
              </Pressable>
            </View>
          </View>

          {/* Vehicle Overview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vehicle Overview</Text>
            <View style={styles.overviewGrid}>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewValue}>4x4</Text>
                <Text style={styles.overviewLabel}>Drive type</Text>
              </View>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewValue}>{vehicle.seats}</Text>
                <Text style={styles.overviewLabel}>Seats</Text>
              </View>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewValue}>{vehicle.mpg}</Text>
                <Text style={styles.overviewLabel}>Fuel economy</Text>
              </View>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewValue}>{vehicle.transmission}</Text>
                <Text style={styles.overviewLabel}>Transmission</Text>
              </View>
            </View>
          </View>

          {/* Vehicle Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What this vehicle offers</Text>
            <View style={styles.featuresList}>
              {(showAllFeatures ? VEHICLE_FEATURES : VEHICLE_FEATURES.slice(0, 4)).map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <View style={styles.featureIcon}>
                    <Ionicons name={feature.icon as any} size={18} color={NAVY} />
                  </View>
                  <Text style={styles.featureText}>{feature.label}</Text>
                </View>
              ))}
            </View>
            <Pressable style={styles.seeAllButton} onPress={() => setShowAllFeatures((prev) => !prev)}>
              <Text style={styles.seeAllText}>{showAllFeatures ? "Show less" : `See all ${VEHICLE_FEATURES.length} features`}</Text>
              <Ionicons name={showAllFeatures ? "chevron-up" : "chevron-forward"} size={18} color={NAVY} />
            </Pressable>
          </View>

          {/* Host Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Host</Text>
            <Pressable style={styles.hostCard}>
              <Image
                source={{ uri: vehicle.hostAvatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80" }}
                style={styles.hostAvatar}
                contentFit="cover"
              />
              <View style={styles.hostInfo}>
                <Text style={styles.hostName}>{vehicle.hostName || "Rochelle"}</Text>
                <Text style={styles.hostMeta}>
                  {vehicle.hostTrips || 3785} trips · Joined {vehicle.joinedDate || "Apr 2021"}
                </Text>
              </View>
              <View style={styles.hostRatingBadge}>
                <Text style={styles.hostRatingText}>{vehicle.hostRating || 4.9}</Text>
                <Ionicons name="star" size={12} color="#FFB800" />
              </View>
            </Pressable>
          </View>

          {/* Reviews */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <View style={styles.reviewsHeader}>
              <Text style={styles.reviewsOverall}>5.0</Text>
              <Ionicons name="star" size={16} color="#FFB800" />
              <Text style={styles.reviewsCount}>({vehicle.trips} ratings)</Text>
            </View>

            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              ref={reviewsScrollRef}
            >
              {REVIEWS.map((review) => {
                const isExpanded = !!expandedReviews[review.id];
                const displayText = isExpanded ? review.text : `${review.text.slice(0, 120)}...`;
                return (
                  <View key={review.id} style={styles.reviewCard}>
                    <Image source={{ uri: review.avatar }} style={styles.reviewAvatar} contentFit="cover" />
                    <View style={styles.reviewContent}>
                      <View style={styles.reviewHeader}>
                        <Text style={styles.reviewName}>{review.name}</Text>
                        <View style={styles.reviewStars}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Ionicons key={star} name="star" size={14} color="#FFB800" />
                          ))}
                        </View>
                        <Text style={styles.reviewDate}>{review.date}</Text>
                      </View>
                      <Text style={styles.reviewText}>{displayText}</Text>
                      {review.text.length > 120 && (
                        <Pressable onPress={() => setExpandedReviews((prev) => ({ ...prev, [review.id]: !prev[review.id] }))}>
                          <Text style={styles.readMore}>{isExpanded ? "Show less" : "Read more"}</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            <View style={styles.reviewDots}>
              {REVIEWS.map((_, index) => (
                <View key={index} style={[styles.reviewDot, index === 0 && styles.reviewDotActive]} />
              ))}
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
                  Full refund within 24 hours of booking.
                </Text>
              </View>
            </View>
          </View>

          {/* Bottom spacing for book button */}
          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceInfo}>
          <Text style={styles.originalPrice}>{vehicle.originalPrice || vehicle.price}</Text>
          <Text style={styles.totalPrice}>{vehicle.price}</Text>
          <Text style={styles.priceNote}>Total before taxes</Text>
        </View>
        <Pressable style={styles.bookButton} onPress={handleBook}>
          <Text style={styles.bookButtonText}>Reserve</Text>
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
            {vehicle.images.map((image: string, index: number) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.fullscreenImage}
                contentFit="contain"
              />
            ))}
          </ScrollView>

          <View style={styles.fullscreenCounter}>
            <Text style={styles.fullscreenCounterText}>
              {fullscreenIndex + 1} / {vehicle.images.length}
            </Text>
          </View>

          <View style={styles.fullscreenDots}>
            {vehicle.images.map((_: string, index: number) => (
              <View
                key={index}
                style={[
                  styles.fullscreenDot,
                  index === fullscreenIndex && styles.fullscreenDotActive,
                ]}
              />
            ))}
          </View>
        </Animated.View>
      )}
      {authVisible && <WelcomeAuthScreen onDismiss={handleAuthDismiss} />}

      {/* Trip Edit Modal */}
      <Modal visible={editTripVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editTripType === "pickup" ? "Edit Pick-up" : "Edit Return"}</Text>
              <Pressable onPress={() => setEditTripVisible(false)}>
                <Ionicons name="close" size={24} color={NAVY} />
              </Pressable>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Date</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Sat, 26 Sep"
                placeholderTextColor="#9CA3AF"
                value={editTripType === "pickup" ? pickupDate : returnDate}
                onChangeText={editTripType === "pickup" ? setPickupDate : setReturnDate}
              />
              <Pressable style={styles.confirmButton} onPress={handleSaveTripEdit}>
                <Text style={styles.confirmButtonText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ visible: false, message: "", type: "success" })}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  contentScroll: {
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
  priceBadge: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#D1FAE5",
    alignItems: "center",
  },
  priceBadgeText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#10B981",
  },
  priceBadgeSub: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
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
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tagText: {
    fontSize: 13,
    fontWeight: "600",
    color: NAVY,
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
  tripRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tripIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tripInfo: {
    flex: 1,
  },
  tripLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: NAVY,
    marginBottom: 2,
  },
  tripValue: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  overviewItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  overviewValue: {
    fontSize: 15,
    fontWeight: "800",
    color: NAVY,
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  featuresList: {
    gap: 12,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  featureText: {
    fontSize: 14,
    fontWeight: "600",
    color: NAVY,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "700",
    color: NAVY,
  },
  hostCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  hostAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  hostInfo: {
    flex: 1,
  },
  hostName: {
    fontSize: 16,
    fontWeight: "700",
    color: NAVY,
    marginBottom: 2,
  },
  hostMeta: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  hostRatingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  hostRatingText: {
    fontSize: 14,
    fontWeight: "700",
    color: NAVY,
  },
  reviewsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  reviewsOverall: {
    fontSize: 24,
    fontWeight: "800",
    color: NAVY,
  },
  reviewsCount: {
    fontSize: 14,
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
    width: SCREEN_WIDTH - 40,
    marginRight: 12,
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
  readMore: {
    fontSize: 13,
    fontWeight: "700",
    color: GREEN,
    marginTop: 8,
  },
  reviewDots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },
  reviewDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D1D5DB",
  },
  reviewDotActive: {
    backgroundColor: NAVY,
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
  originalPrice: {
    fontSize: 14,
    fontWeight: "500",
    color: "#9CA3AF",
    textDecorationLine: "line-through",
  },
  totalPrice: {
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
  bookButton: {
    backgroundColor: NAVY,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  bookButtonText: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
    flexDirection: "column",
    gap: 14,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: NAVY,
    letterSpacing: -0.3,
  },
  modalBody: {
    flexDirection: "column",
    gap: 12,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: NAVY,
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: NAVY,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  confirmButton: {
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: NAVY,
    alignItems: "center",
    marginTop: 8,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
