import { View, StyleSheet, Text, ScrollView, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@/lib/convexApi";
import { Ionicons } from "@expo/vector-icons";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
          <Text className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Booking Details</Text>
          <Card className="bg-gray-50 border-gray-200">
            <View className="flex-row items-center justify-between py-2">
              <Text className="text-sm font-medium text-gray-500">Booking ID</Text>
              <Text className="text-sm font-semibold" style={{ color: NAVY }}>{booking._id}</Text>
            </View>
            <View style={styles.divider} />
            <View className="flex-row items-center justify-between py-2">
              <Text className="text-sm font-medium text-gray-500">Status</Text>
              <Text className="text-sm font-semibold capitalize" style={{ color: NAVY }}>{booking.status}</Text>
            </View>
            <View style={styles.divider} />
            <View className="flex-row items-center justify-between py-2">
              <Text className="text-sm font-medium text-gray-500">Dates</Text>
              <Text className="text-sm font-semibold" style={{ color: NAVY }}>{booking.startDate} — {booking.endDate}</Text>
            </View>
            <View style={styles.divider} />
            <View className="flex-row items-center justify-between py-2">
              <Text className="text-sm font-medium text-gray-500">Pickup</Text>
              <Text className="text-sm font-semibold text-right flex-1 ml-3" style={{ color: NAVY }}>{booking.pickupLocation}</Text>
            </View>
            <View style={styles.divider} />
            <View className="flex-row items-center justify-between py-2">
              <Text className="text-sm font-medium text-gray-500">Drop-off</Text>
              <Text className="text-sm font-semibold text-right flex-1 ml-3" style={{ color: NAVY }}>{booking.dropoffLocation}</Text>
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Text className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Payment</Text>
          <Card className="bg-gray-50 border-gray-200">
            <View className="flex-row items-center justify-between py-2">
              <Text className="text-sm font-medium text-gray-500">Subtotal</Text>
              <Text className="text-sm font-semibold" style={{ color: NAVY }}>GHS {booking.subtotal.toLocaleString()}</Text>
            </View>
            <View style={styles.divider} />
            <View className="flex-row items-center justify-between py-2">
              <Text className="text-sm font-medium text-gray-500">Driver fee</Text>
              <Text className="text-sm font-semibold" style={{ color: NAVY }}>GHS {booking.driverFee.toLocaleString()}</Text>
            </View>
            <View style={styles.divider} />
            <View className="flex-row items-center justify-between py-2">
              <Text className="text-sm font-medium text-gray-500">Service fee</Text>
              <Text className="text-sm font-semibold" style={{ color: NAVY }}>GHS {booking.serviceFee.toLocaleString()}</Text>
            </View>
            <View style={styles.divider} />
            <View className="flex-row items-center justify-between py-2">
              <Text className="text-sm font-medium text-gray-500">Security deposit</Text>
              <Text className="text-sm font-semibold" style={{ color: NAVY }}>GHS {booking.securityDeposit.toLocaleString()}</Text>
            </View>
            <View style={styles.divider} />
            <View className="flex-row items-center justify-between py-2">
              <Text className="text-base font-bold" style={{ color: NAVY }}>Total</Text>
              <Text className="text-lg font-extrabold" style={{ color: NAVY }}>GHS {booking.totalAmount.toLocaleString()}</Text>
            </View>
          </Card>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button onPress={() => router.back()} className="rounded-xl py-4">
          <Text className="text-sm font-bold text-white">View My Trips</Text>
        </Button>
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
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#E5E7EB" },
  bottomSpacer: { height: 20 },
  bottomBar: {
    position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "#FFFFFF",
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#E5E7EB",
    paddingHorizontal: 20, paddingVertical: 16, paddingBottom: Platform.select({ ios: 24, android: 16 }),
  },
});
