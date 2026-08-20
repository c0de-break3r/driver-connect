import { useState, useCallback } from "react";
import {
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthProvider";
import { useQuery } from "convex/react";
import { api } from "@/lib/convexApi";
import * as Haptics from "expo-haptics";
import { createCardStyle, StatusBadge, SectionHeader, Divider } from "@/components/DesignSystem";
import EmptyState from "@/components/EmptyState";

const NAVY = "#2C3E5B";

function formatDate(iso: string) {
  const date = new Date(iso + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusTone(status: string): "success" | "warning" | "danger" | "info" | "neutral" {
  switch (status) {
    case "confirmed": return "success";
    case "pending": return "warning";
    case "in_progress": return "info";
    case "cancelled": return "danger";
    case "completed": return "neutral";
    default: return "neutral";
  }
}

function isUpcoming(status: string): boolean {
  return ["pending", "confirmed", "in_progress"].includes(status);
}

export default function TripsScreen({ signedIn, openAuth }: { signedIn: boolean; openAuth?: () => void }) {
  const router = useRouter();
  const { userId } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const convexUser = useQuery(
    api.users.getByUserId,
    userId ? { userId } : "skip"
  );

  const bookings = useQuery(
    api.jobs.getRenterBookings,
    convexUser?._id ? { renterId: convexUser._id } : "skip"
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  }, []);

  const handleBookingPress = useCallback(
    (bookingId: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push(`/booking/${bookingId}`);
    },
    [router]
  );

  const handleCancel = useCallback(
    (bookingId: string) => {
      Alert.alert("Cancel booking", "Are you sure you want to cancel this booking?", [
        { text: "Keep booking", style: "cancel" },
        {
          text: "Cancel booking",
          style: "destructive",
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Alert.alert("Cancelled", "Your booking has been cancelled.");
          },
        },
      ]);
    },
    []
  );

  if (!signedIn) {
    return (
      <View style={styles.centerContent}>
        <View style={styles.iconCircle}>
          <Ionicons name="calendar-outline" size={48} color={NAVY} />
        </View>
        <Text style={styles.emptyTitle}>No trips yet</Text>
        <Text style={styles.emptySubtitle}>
          Your upcoming vehicle bookings and driver hires will appear here once you confirm a booking.
        </Text>
        <TouchableOpacity style={styles.emptyCta} onPress={openAuth}>
          <Text style={styles.emptyCtaText}>Log in</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!bookings) {
    return (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={NAVY} />
        }
      >
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingText}>Loading your trips...</Text>
        </View>
      </ScrollView>
    );
  }

  const upcoming = bookings.filter((b) => isUpcoming(b.status));
  const past = bookings.filter((b) => !isUpcoming(b.status));

  const renderBookingCard = (booking: typeof bookings[number]) => {
    const vehicle = booking.vehicle;
    const tone = statusTone(booking.status);
    const isPending = booking.status === "pending";
    const isConfirmed = booking.status === "confirmed";
    const isInProgress = booking.status === "in_progress";
    const isCompleted = booking.status === "completed";
    const isCancelled = booking.status === "cancelled";

    return (
      <TouchableOpacity
        key={booking._id}
        activeOpacity={0.85}
        onPress={() => handleBookingPress(booking._id)}
        style={styles.cardPressable}
      >
        <View style={createCardStyle()}>
          <View style={styles.vehicleRow}>
            <View style={styles.vehicleImageWrap}>
              {vehicle.images?.[0] ? (
                <Image
                  source={{ uri: vehicle.images[0] }}
                  style={styles.vehicleImage}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.vehicleImageFallback}>
                  <Ionicons name="car-outline" size={24} color="#9CA3AF" />
                </View>
              )}
            </View>
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleTitle} numberOfLines={1}>
                {vehicle.title}
              </Text>
              <Text style={styles.vehicleCategory} numberOfLines={1}>
                {vehicle.category} • {vehicle.city}
              </Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color="#FFB800" />
                <Text style={styles.ratingText}>{vehicle.rating}</Text>
                <Text style={styles.reviewCountText}>
                  ({vehicle.reviewCount})
                </Text>
              </View>
            </View>
            <StatusBadge label={booking.status.replace(/_/g, " ")} tone={tone} />
          </View>

          <Divider />

          <View style={styles.detailRow}>
            <View style={styles.detailIconWrap}>
              <Ionicons name="calendar-outline" size={16} color={NAVY} />
            </View>
            <Text style={styles.detailText}>
              {formatDate(booking.startDate)} — {formatDate(booking.endDate)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIconWrap}>
              <Ionicons name="location-outline" size={16} color={NAVY} />
            </View>
            <Text style={styles.detailText} numberOfLines={1}>
              {booking.pickupLocation} → {booking.dropoffLocation}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Total</Text>
            <Text style={styles.priceValue}>
              {booking.currency} {booking.totalAmount.toLocaleString()}
            </Text>
          </View>

          <View style={styles.actionsRow}>
            {(isPending || isConfirmed) && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleCancel(booking._id);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
            {(isConfirmed || isInProgress) && (
              <TouchableOpacity
                style={styles.messageButton}
                onPress={(e) => {
                  e.stopPropagation();
                  router.push(`/booking/${booking._id}`);
                }}
              >
                <Ionicons name="chatbubble-outline" size={16} color="#FFFFFF" />
                <Text style={styles.messageButtonText}>Message</Text>
              </TouchableOpacity>
            )}
            {isCompleted && (
              <>
                <TouchableOpacity
                  style={styles.primaryActionButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    router.push(`/booking/${booking._id}`);
                  }}
                >
                  <Ionicons name="star-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.primaryActionButtonText}>Rate & Review</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryActionButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    router.push(`/booking/${booking._id}`);
                  }}
                >
                  <Text style={styles.secondaryActionButtonText}>Rebook</Text>
                </TouchableOpacity>
              </>
            )}
            {isCancelled && (
              <TouchableOpacity
                style={styles.secondaryActionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  router.push(`/booking/${booking._id}`);
                }}
              >
                <Text style={styles.secondaryActionButtonText}>Rebook</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={NAVY} />
      }
    >
      {upcoming.length === 0 && past.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            title="No trips yet"
            subtitle="Your upcoming vehicle bookings and driver hires will appear here once you confirm a booking."
            ctaText="Explore vehicles"
            onCtaPress={() => {}}
          />
        </View>
      ) : (
        <>
          {upcoming.length > 0 && (
            <View style={styles.section}>
              <SectionHeader
                title="Upcoming"
                subtitle={`${upcoming.length} trip${upcoming.length !== 1 ? "s" : ""}`}
              />
              <View style={styles.cardStack}>{upcoming.map(renderBookingCard)}</View>
            </View>
          )}

          {past.length > 0 && (
            <View style={styles.section}>
              <SectionHeader
                title="Past"
                subtitle={`${past.length} trip${past.length !== 1 ? "s" : ""}`}
              />
              <View style={styles.cardStack}>{past.map(renderBookingCard)}</View>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 0,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 60,
    gap: 16,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: NAVY,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  emptyCta: {
    marginTop: 16,
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  emptyCtaText: {
    color: NAVY,
    fontSize: 15,
    fontWeight: "700",
  },
  emptyWrap: {
    paddingVertical: 40,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },
  section: {
    marginBottom: 24,
  },
  cardStack: {
    gap: 12,
  },
  cardPressable: {
    marginBottom: 2,
  },
  vehicleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  vehicleImageWrap: {
    width: 64,
    height: 64,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
    flexShrink: 0,
  },
  vehicleImage: {
    width: "100%",
    height: "100%",
  },
  vehicleImageFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  vehicleInfo: {
    flex: 1,
    minWidth: 0,
  },
  vehicleTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
  },
  vehicleCategory: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "700",
    color: NAVY,
  },
  reviewCountText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  detailText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  priceLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "800",
    color: NAVY,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
    flexWrap: "wrap",
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#EF4444",
  },
  messageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: NAVY,
  },
  messageButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  primaryActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: "#F59E0B",
  },
  primaryActionButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  secondaryActionButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  secondaryActionButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: NAVY,
  },
});
