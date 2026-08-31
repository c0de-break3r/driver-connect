import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convexApi";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthProvider";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const NAVY = "#2C3E5B";
const GREEN = "#10B981";
const YELLOW = "#F59E0B";
const RED = "#EF4444";
const GRAY = "#6B7280";

function statusColor(status: string) {
  switch (status) {
    case "confirmed": return GREEN;
    case "pending": return YELLOW;
    case "cancelled": return RED;
    default: return GRAY;
  }
}

function formatDate(iso: string) {
  const date = new Date(iso + "T00:00:00");
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

export default function BookingDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const bookingId = params.id;

  const { userId } = useAuth();
  const convexUser = useQuery(api.users.getByUserId, userId ? { userId } : "skip");
  const booking = useQuery(api.jobs.getBooking, bookingId ? { bookingId: bookingId as any } : "skip");
  const vehicle = useQuery(api.jobs.getVehicle, booking ? { id: booking.vehicleId } : "skip");
  const changeRequests = useQuery(api.jobs.getBookingChangeRequests, bookingId ? { bookingId: bookingId as any } : "skip");
  const approveChange = useMutation(api.jobs.approveTripChangeRequest);
  const declineChange = useMutation(api.jobs.declineTripChangeRequest);
  const acceptBooking = useMutation(api.jobs.acceptBooking);
  const declineBooking = useMutation(api.jobs.declineBooking);
  const completeBooking = useMutation(api.jobs.completeBooking);

  const pendingRequests = changeRequests?.filter((req) => req.status === "pending") ?? [];

  const handleApprove = async (requestId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try { await approveChange({ requestId: requestId as any }); alert("Approved", "The change request has been approved."); }
    catch { alert("Error", "Unable to approve request. Please try again."); }
  };

  const handleDecline = async (requestId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try { await declineChange({ requestId: requestId as any }); alert("Declined", "The change request has been declined."); }
    catch { alert("Error", "Unable to decline request. Please try again."); }
  };

  const handleAcceptBooking = async () => {
    if (!booking) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await acceptBooking({ bookingId: booking._id });
      Alert.alert("Accepted", "This booking is now confirmed.");
    } catch {
      Alert.alert("Error", "Unable to accept this booking.");
    }
  };

  const handleDeclineBooking = async () => {
    if (!booking) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await declineBooking({ bookingId: booking._id });
      Alert.alert("Declined", "This booking has been declined.");
    } catch {
      Alert.alert("Error", "Unable to decline this booking.");
    }
  };

  const handleCompleteBooking = async () => {
    if (!booking) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await completeBooking({ bookingId: booking._id });
      Alert.alert("Completed", "This trip has been marked complete.");
    } catch {
      Alert.alert("Error", "Unable to complete this booking.");
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
  const isRenter =
    !!convexUser &&
    (booking.renterId === convexUser._id || booking.renterId === userId);
  const isOwner =
    !!convexUser &&
    !!vehicle &&
    (vehicle.ownerId === convexUser._id || vehicle.ownerId === userId);
  const canAccept =
    isOwner && booking.status === "pending" && !booking.instantBook;
  const canComplete =
    (isOwner || isRenter) && booking.status === "confirmed";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.headerRow}>
        <Button variant="ghost" size="icon" onPress={() => router.back()} hitSlop={8} className="w-6 h-6">
          <Ionicons name="chevron-back" size={24} color={NAVY} />
        </Button>
        <Text className="text-lg font-extrabold flex-1 text-center" style={{ color: "#111827" }}>Booking Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.statusRow}>
        <Badge variant="secondary" className="flex-row items-center" style={{ backgroundColor: color + "20" }}>
          <Text className="text-xs font-bold capitalize" style={{ color }}>{booking.status}</Text>
        </Badge>
        <Text className="text-xs font-semibold text-gray-500 capitalize">{booking.paymentStatus}</Text>
      </View>

      <View style={styles.section}>
        <Text className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Trip Dates</Text>
        <View className="flex-row items-center gap-2.5">
          <Ionicons name="calendar-outline" size={18} color={NAVY} />
          <Text style={styles.detailText}>{formatDate(booking.startDate)} — {formatDate(booking.endDate)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Locations</Text>
        <View className="flex-row items-center gap-2.5">
          <Ionicons name="location-outline" size={18} color={NAVY} />
          <Text style={styles.detailText}>{booking.pickupLocation} → {booking.dropoffLocation}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Amount</Text>
        <Text style={styles.amountText}>{booking.currency} {booking.totalAmount.toLocaleString()}</Text>
        <Text style={styles.amountBreakdown}>Subtotal: {booking.currency} {booking.subtotal.toLocaleString()} | Service: {booking.currency} {booking.serviceFee.toLocaleString()}</Text>
      </View>

      {booking.specialRequests ? (
        <View style={styles.section}>
          <Text className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Special Requests</Text>
          <Text style={styles.specialRequestsText}>{booking.specialRequests}</Text>
        </View>
      ) : null}

      {pendingRequests.length > 0 && (
        <View style={styles.section}>
          <Text className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Pending Change Requests</Text>
          {pendingRequests.map((req) => (
            <Card key={req._id} className="bg-gray-50 border-gray-200 gap-2 mb-3">
              <Text className="text-sm font-bold capitalize" style={{ color: NAVY }}>{req.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</Text>
              {req.requestedEndDate && <Text style={styles.requestDetail}>New end date: {formatDate(req.requestedEndDate)}</Text>}
              {req.requestedPickupLocation && <Text style={styles.requestDetail}>New pickup: {req.requestedPickupLocation}</Text>}
              {req.requestedDropoffLocation && <Text style={styles.requestDetail}>New dropoff: {req.requestedDropoffLocation}</Text>}
              {req.additionalDriverId && <Text style={styles.requestDetail}>Additional driver ID: {req.additionalDriverId}</Text>}
              <View className="flex-row gap-2.5 mt-2">
                <Button onPress={() => handleApprove(req._id)} className="flex-1 rounded-lg py-2.5 bg-emerald-600">
                  <Text className="text-sm font-bold text-white">Accept</Text>
                </Button>
                <Button variant="outline" onPress={() => handleDecline(req._id)} className="flex-1 rounded-lg py-2.5 border-gray-200">
                  <Text className="text-sm font-bold text-red-500">Decline</Text>
                </Button>
              </View>
            </Card>
          ))}
        </View>
      )}

      <View style={styles.actionButtonsRow}>
        <Button onPress={() => router.push({ pathname: "/(client)/booking-chat", params: { bookingId: booking._id } } as any)} className="flex-row items-center justify-center gap-2 rounded-xl py-3.5 px-5">
          <Ionicons name="chatbubble-outline" size={18} color="#FFFFFF" />
          <Text className="text-sm font-bold text-white">Message</Text>
        </Button>
        {canAccept && (
          <Button onPress={handleAcceptBooking} className="flex-row items-center justify-center gap-2 rounded-xl py-3.5 px-5 bg-emerald-600">
            <Ionicons name="checkmark-outline" size={18} color="#FFFFFF" />
            <Text className="text-sm font-bold text-white">Accept booking</Text>
          </Button>
        )}
        {canAccept && (
          <Button variant="outline" onPress={handleDeclineBooking} className="flex-row items-center justify-center gap-2 rounded-xl py-3.5 px-5 border-gray-200">
            <Ionicons name="close-outline" size={18} color="#EF4444" />
            <Text className="text-sm font-bold text-red-500">Decline booking</Text>
          </Button>
        )}
        {canComplete && (
          <Button onPress={handleCompleteBooking} className="flex-row items-center justify-center gap-2 rounded-xl py-3.5 px-5">
            <Ionicons name="flag-outline" size={18} color="#FFFFFF" />
            <Text className="text-sm font-bold text-white">Mark completed</Text>
          </Button>
        )}
        {booking.status === "completed" && !booking.reviewPrompted && (
          <Button onPress={() => router.push({ pathname: "/(client)/rate-review", params: { bookingId: booking._id } } as any)} className="flex-row items-center justify-center gap-2 rounded-xl py-3.5 px-5 bg-amber-500">
            <Ionicons name="star-outline" size={18} color="#FFFFFF" />
            <Text className="text-sm font-bold text-white">Rate & Review</Text>
          </Button>
        )}
        {(booking.status === "pending" || booking.status === "confirmed") && (
          <Button onPress={() => router.push({ pathname: "/trip-change-request", params: { bookingId: booking._id } } as any)} className="flex-row items-center justify-center gap-2 rounded-xl py-3.5 px-5">
            <Ionicons name="create-outline" size={18} color="#FFFFFF" />
            <Text className="text-sm font-bold text-white">Request Change</Text>
          </Button>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContent: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 48 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 },
  section: { marginBottom: 24 },
  detailText: { fontSize: 15, fontWeight: "600", color: "#374151", lineHeight: 22 },
  amountText: { fontSize: 22, fontWeight: "800", color: NAVY, marginBottom: 4 },
  amountBreakdown: { fontSize: 13, fontWeight: "500", color: "#6B7280" },
  specialRequestsText: { fontSize: 14, fontWeight: "500", color: "#374151", lineHeight: 22 },
  requestDetail: { fontSize: 14, fontWeight: "500", color: "#6B7280" },
  actionButtonsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8 },
  errorText: { fontSize: 16, fontWeight: "600", color: "#6B7280", textAlign: "center", marginTop: 60 },
  loadingText: { fontSize: 16, fontWeight: "600", color: "#6B7280", textAlign: "center", marginTop: 60 },
});
