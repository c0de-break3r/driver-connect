import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convexApi";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";

const NAVY = "#2C3E5B";
const GREEN = "#10B981";
const YELLOW = "#F59E0B";
const RED = "#EF4444";
const GRAY = "#6B7280";

function statusColor(status: string) {
  switch (status) {
    case "confirmed":
      return GREEN;
    case "pending":
      return YELLOW;
    case "cancelled":
      return RED;
    default:
      return GRAY;
  }
}

function formatDate(iso: string) {
  const date = new Date(iso + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BookingDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const bookingId = params.id;

  const booking = useQuery(
    api.jobs.getBooking,
    bookingId ? { bookingId: bookingId as any } : "skip"
  );

  const changeRequests = useQuery(
    api.jobs.getBookingChangeRequests,
    bookingId ? { bookingId: bookingId as any } : "skip"
  );

  const approveChange = useMutation(api.jobs.approveTripChangeRequest);
  const declineChange = useMutation(api.jobs.declineTripChangeRequest);

  const pendingRequests = changeRequests?.filter(
    (req) => req.status === "pending"
  ) ?? [];

  const handleApprove = async (requestId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await approveChange({ requestId: requestId as any });
      Alert.alert("Approved", "The change request has been approved.");
    } catch {
      Alert.alert("Error", "Unable to approve request. Please try again.");
    }
  };

  const handleDecline = async (requestId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await declineChange({ requestId: requestId as any });
      Alert.alert("Declined", "The change request has been declined.");
    } catch {
      Alert.alert("Error", "Unable to decline request. Please try again.");
    }
  };

  if (!bookingId) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Booking not found.</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading booking...</Text>
      </View>
    );
  }

  const color = statusColor(booking.status);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={NAVY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.statusRow}>
        <View style={[styles.statusBadge, { backgroundColor: color + "20" }]}>
          <Text style={[styles.statusText, { color }]}>
            {booking.status}
          </Text>
        </View>
        <Text style={styles.paymentStatus}>{booking.paymentStatus}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trip Dates</Text>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={18} color={NAVY} />
          <Text style={styles.detailText}>
            {formatDate(booking.startDate)} — {formatDate(booking.endDate)}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Locations</Text>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={18} color={NAVY} />
          <Text style={styles.detailText}>
            {booking.pickupLocation} → {booking.dropoffLocation}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Amount</Text>
        <Text style={styles.amountText}>
          {booking.currency} {booking.totalAmount.toLocaleString()}
        </Text>
        <Text style={styles.amountBreakdown}>
          Subtotal: {booking.currency} {booking.subtotal.toLocaleString()} | Service: {booking.currency} {booking.serviceFee.toLocaleString()}
        </Text>
      </View>

      {booking.specialRequests ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Requests</Text>
          <Text style={styles.specialRequestsText}>{booking.specialRequests}</Text>
        </View>
      ) : null}

      {pendingRequests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pending Change Requests</Text>
          {pendingRequests.map((req) => (
            <View key={req._id} style={styles.requestCard}>
              <Text style={styles.requestType}>
                {req.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </Text>
              {req.requestedEndDate ? (
                <Text style={styles.requestDetail}>
                  New end date: {formatDate(req.requestedEndDate)}
                </Text>
              ) : null}
              {req.requestedPickupLocation ? (
                <Text style={styles.requestDetail}>
                  New pickup: {req.requestedPickupLocation}
                </Text>
              ) : null}
              {req.requestedDropoffLocation ? (
                <Text style={styles.requestDetail}>
                  New dropoff: {req.requestedDropoffLocation}
                </Text>
              ) : null}
              {req.additionalDriverId ? (
                <Text style={styles.requestDetail}>
                  Additional driver ID: {req.additionalDriverId}
                </Text>
              ) : null}
              <View style={styles.requestActions}>
                <TouchableOpacity
                  style={styles.approveButton}
                  onPress={() => handleApprove(req._id)}
                >
                  <Text style={styles.approveButtonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.declineButton}
                  onPress={() => handleDecline(req._id)}
                >
                  <Text style={styles.declineButtonText}>Decline</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.requestChangeButton}
        onPress={() =>
          router.push({
            pathname: "/trip-change-request",
            params: { bookingId: booking._id },
          } as any)
        }
      >
        <Ionicons name="create-outline" size={18} color="#FFFFFF" />
        <Text style={styles.requestChangeButtonText}>Request Change</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  paymentStatus: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "capitalize",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    lineHeight: 22,
  },
  amountText: {
    fontSize: 22,
    fontWeight: "800",
    color: NAVY,
    marginBottom: 4,
  },
  amountBreakdown: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  specialRequestsText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    lineHeight: 22,
  },
  requestCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 8,
    marginBottom: 12,
  },
  requestType: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
    textTransform: "capitalize",
  },
  requestDetail: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  requestActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  approveButton: {
    flex: 1,
    backgroundColor: GREEN,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  approveButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  declineButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  declineButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: RED,
  },
  requestChangeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: NAVY,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
  },
  requestChangeButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  errorText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
    marginTop: 60,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
    marginTop: 60,
  },
});
