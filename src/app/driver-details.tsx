import { useState, useRef, useEffect } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable, Alert, Dimensions } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Animated } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

const NAVY = "#2C3E5B";
const GREEN = "#10B981";

const DRIVERS = [
  {
    id: "d1",
    name: "Kwame Asante",
    location: "Kumasi, Ashanti",
    rating: 4.98,
    trips: 342,
    hourlyRate: "GH₵ 35",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    isVerified: true,
    yearsOnPlatform: "5+ years",
    vehicleType: "Sedan, SUV",
    languages: "English, Twi",
    about: "Professional driver with 5+ years of experience. Specializes in Sedan and SUV trips across Ashanti and beyond. Known for punctuality, clean vehicles, and local route expertise.",
  },
  {
    id: "d2",
    name: "Ama Serwaa",
    location: "Accra, Greater Accra",
    rating: 4.95,
    trips: 518,
    hourlyRate: "GH₵ 45",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80",
    isVerified: true,
    yearsOnPlatform: "6+ years",
    vehicleType: "Luxury, SUV",
    languages: "English, Ga, Twi",
    about: "Experienced luxury transport specialist with 6+ years on the road. Frequently hired for airport transfers, corporate events, and premium city travel across Greater Accra.",
  },
  {
    id: "d3",
    name: "Kofi Mensah",
    location: "Tema, Greater Accra",
    rating: 4.88,
    trips: 215,
    hourlyRate: "GH₵ 30",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80",
    isVerified: true,
    yearsOnPlatform: "4+ years",
    vehicleType: "Van, Bus",
    languages: "English, Twi",
    about: "Group and fleet specialist with 4+ years of experience. Comfortable with vans, buses, and larger vehicles for family trips, tours, and scheduled transfers.",
  },
  {
    id: "d4",
    name: "Abena Osei",
    location: "Cape Coast, Central",
    rating: 4.92,
    trips: 289,
    hourlyRate: "GH₵ 40",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80",
    isVerified: true,
    yearsOnPlatform: "5+ years",
    vehicleType: "Sedan, Truck",
    languages: "English, Fante",
    about: "Versatile driver with 5+ years of experience handling sedan and truck jobs across Central Region. Strong track record for long-distance trips and reliable return journeys.",
  },
];

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
  const heartScale = useRef(new Animated.Value(1)).current;

  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const fullscreenScrollRef = useRef<ScrollView>(null);
  const fullscreenAnim = useRef(new Animated.Value(0)).current;

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
    setIsFavorite((prev) => !prev);
    Alert.alert(
      isFavorite ? "Removed from favorites" : "Added to favorites",
      isFavorite ? "" : `${driver.name} has been added to your favorites`
    );
  };

  const handleHire = () => {
    Alert.alert("Hire", `Hire request sent to ${driver.name}...`);
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
              <Text style={styles.statValue}>{driver.yearsOnPlatform}</Text>
              <Text style={styles.statLabel}>Experience</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{driver.vehicleType}</Text>
              <Text style={styles.statLabel}>Vehicle types</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{driver.languages}</Text>
              <Text style={styles.statLabel}>Languages</Text>
            </View>
          </View>

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
            <Ionicons name="close" size={24} color="#FFFFFF" />
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
    color: GREEN,
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
    color: GREEN,
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
    backgroundColor: "#000000",
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
    backgroundColor: "rgba(0,0,0,0.5)",
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
    color: "#FFFFFF",
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
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  fullscreenDotActive: {
    backgroundColor: "#FFFFFF",
    width: 24,
  },
});
