import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@/lib/convexApi";
import { Ionicons } from "@expo/vector-icons";
import { createCardStyle, SectionHeader, Divider } from "@/components/DesignSystem";

const NAVY = "#2C3E5B";

export default function BookingConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ bookingId?: string }>();
  const booking = useQuery(
    api.jobs.getBooking,
    params.bookingId ? { bookingId: params.bookingId as any } : "skip"
  );

  if (!booking) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading confirmation...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.successWrap}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successSubtitle}>
            Your booking has been confirmed. You&apos;ll receive updates as your trip approaches.
          </Text>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Booking Details" />
          <View style={createCardStyle()}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Booking ID</Text>
              <Text style={styles.rowValue}>{booking._id}</Text>
            </View>
            <Divider />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Status</Text>
              <Text style={[styles.rowValue, styles.statusText]}>{booking.status}</Text>
            </View>
            <Divider />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Dates</Text>
              <Text style={styles.rowValue}>
                {booking.startDate} — {booking.endDate}
              </Text>
            </View>
            <Divider />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Pickup</Text>
              <Text style={styles.rowValue}>{booking.pickupLocation}</Text>
            </View>
            <Divider />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Drop-off</Text>
              <Text style={styles.rowValue}>{booking.dropoffLocation}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Payment" />
          <View style={createCardStyle()}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Subtotal</Text>
              <Text style={styles.rowValue}>GHS {booking.subtotal.toLocaleString()}</Text>
            </View>
            <Divider />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Driver fee</Text>
              <Text style={styles.rowValue}>GHS {booking.driverFee.toLocaleString()}</Text>
            </View>
            <Divider />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Service fee</Text>
              <Text style={styles.rowValue}>GHS {booking.serviceFee.toLocaleString()}</Text>
            </View>
            <Divider />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Security deposit</Text>
              <Text style={styles.rowValue}>GHS {booking.securityDeposit.toLocaleString()}</Text>
            </View>
            <Divider />
            <View style={styles.row}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>GHS {booking.totalAmount.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.primaryButtonText}>View My Trips</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContent: {
    paddingTop: Platform.select({ ios: 60, android: 40 }),
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  loadingText: { fontSize: 15, fontWeight: "600", color: "#6B7280", textAlign: "center", marginTop: 60 },
  successWrap: { alignItems: "center", paddingVertical: 32 },
  successCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: "#10B981",
    alignItems: "center", justifyContent: "center", marginBottom: 16,
  },
  successTitle: { fontSize: 24, fontWeight: "800", color: NAVY, marginBottom: 8 },
  successSubtitle: { fontSize: 15, fontWeight: "500", color: "#6B7280", textAlign: "center", paddingHorizontal: 24, lineHeight: 22 },
  section: { marginBottom: 24 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8 },
  rowLabel: { fontSize: 14, fontWeight: "500", color: "#6B7280" },
  rowValue: { fontSize: 14, fontWeight: "600", color: NAVY, textAlign: "right", flex: 1, marginLeft: 12 },
  statusText: { textTransform: "capitalize" },
  totalLabel: { fontSize: 16, fontWeight: "700", color: NAVY },
  totalValue: { fontSize: 18, fontWeight: "800", color: NAVY },
  bottomSpacer: { height: 20 },
  bottomBar: {
    position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "#FFFFFF",
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#E5E7EB",
    paddingHorizontal: 20, paddingVertical: 16, paddingBottom: Platform.select({ ios: 24, android: 16 }),
  },
  primaryButton: { backgroundColor: NAVY, paddingVertical: 16, borderRadius: 14, alignItems: "center" },
  primaryButtonText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
});
