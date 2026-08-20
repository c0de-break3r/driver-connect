import { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convexApi";
import * as Haptics from "expo-haptics";
import { createCardStyle, SectionHeader, Divider } from "@/components/DesignSystem";

const NAVY = "#2C3E5B";

type PaymentMethod = "mobile_money" | "card" | "wallet";

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ bookingId?: string }>();
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const booking = useQuery(
    api.jobs.getBooking,
    params.bookingId ? { bookingId: params.bookingId as any } : "skip"
  );

  const updateBookingStatus = useMutation(api.jobs.updateBookingStatus);

  const handlePay = async () => {
    if (!method) {
      Alert.alert("Select method", "Please choose a payment method.");
      return;
    }

    if (method === "mobile_money" && !phoneNumber.trim()) {
      Alert.alert("Phone required", "Please enter your mobile money number.");
      return;
    }

    if (method === "card") {
      if (!cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim() || !cardName.trim()) {
        Alert.alert("Card details required", "Please fill in all card fields.");
        return;
      }
    }

    if (!params.bookingId) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await updateBookingStatus({
        bookingId: params.bookingId as any,
        status: "confirmed",
      });
      router.replace(`/(client)/booking-confirmation?bookingId=${params.bookingId}`);
    } catch {
      Alert.alert("Payment failed", "Unable to process payment. Please try again.");
    }
  };

  if (!booking) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading booking...</Text>
      </View>
    );
  }

  const totalAmount = booking.totalAmount;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SectionHeader title="Payment" subtitle={`Total: GHS ${totalAmount.toLocaleString()}`} />

        <View style={createCardStyle()}>
          <Text style={styles.fieldLabel}>Select Payment Method</Text>
          <View style={styles.methodsList}>
            {[
              { id: "mobile_money" as PaymentMethod, label: "Mobile Money", icon: "phone-portrait-outline", desc: "M-Pesa / MTN" },
              { id: "card" as PaymentMethod, label: "Credit / Debit Card", icon: "card-outline", desc: "Visa, Mastercard" },
              { id: "wallet" as PaymentMethod, label: "Wallet", icon: "wallet-outline", desc: "In-app balance" },
            ].map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[styles.methodItem, method === m.id && styles.methodItemActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setMethod(m.id);
                }}
              >
                <View style={styles.methodLeft}>
                  <Ionicons name={m.icon as any} size={24} color={NAVY} />
                  <View>
                    <Text style={styles.methodLabel}>{m.label}</Text>
                    <Text style={styles.methodDesc}>{m.desc}</Text>
                  </View>
                </View>
                <View style={[styles.radio, method === m.id && styles.radioActive]}>
                  {method === m.id && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {method === "mobile_money" && (
          <View style={createCardStyle({ marginTop: 16 })}>
            <Text style={styles.fieldLabel}>Mobile Money Number</Text>
            <View style={styles.inputRow}>
              <Ionicons name="phone-portrait-outline" size={20} color={NAVY} />
              <TextInput
                style={styles.input}
                placeholder="e.g. 024 123 4567"
                placeholderTextColor="#9CA3AF"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        )}

        {method === "card" && (
          <View style={createCardStyle({ marginTop: 16 })}>
            <Text style={styles.fieldLabel}>Card Information</Text>
            <View style={styles.inputRow}>
              <Ionicons name="person-outline" size={20} color={NAVY} />
              <TextInput
                style={styles.input}
                placeholder="Name on card"
                placeholderTextColor="#9CA3AF"
                value={cardName}
                onChangeText={setCardName}
              />
            </View>
            <View style={styles.inputRow}>
              <Ionicons name="card-outline" size={20} color={NAVY} />
              <TextInput
                style={styles.input}
                placeholder="Card number"
                placeholderTextColor="#9CA3AF"
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.inputRow}>
              <Ionicons name="calendar-outline" size={20} color={NAVY} />
              <TextInput
                style={styles.input}
                placeholder="MM/YY"
                placeholderTextColor="#9CA3AF"
                value={cardExpiry}
                onChangeText={setCardExpiry}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={20} color={NAVY} />
              <TextInput
                style={styles.input}
                placeholder="CVV"
                placeholderTextColor="#9CA3AF"
                value={cardCvv}
                onChangeText={setCardCvv}
                keyboardType="number-pad"
                secureTextEntry
              />
            </View>
          </View>
        )}

        <View style={[createCardStyle({ marginTop: 16 }), styles.escrowCard]}>
          <View style={styles.escrowIconWrap}>
            <Ionicons name="shield-checkmark-outline" size={24} color={NAVY} />
          </View>
          <View style={styles.escrowTextWrap}>
            <Text style={styles.escrowTitle}>Secure payment</Text>
            <Text style={styles.escrowDesc}>
              Your payment will be held securely and released to the vehicle owner after your trip is completed.
            </Text>
          </View>
        </View>

        <View style={createCardStyle({ marginTop: 16 })}>
          <Text style={styles.fieldLabel}>Booking Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Vehicle</Text>
            <Text style={styles.summaryValue}>{booking.vehicleId}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Dates</Text>
            <Text style={styles.summaryValue}>
              {booking.startDate} — {booking.endDate}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Pickup</Text>
            <Text style={styles.summaryValue}>{booking.pickupLocation}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Drop-off</Text>
            <Text style={styles.summaryValue}>{booking.dropoffLocation}</Text>
          </View>
          <Divider />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>GHS {totalAmount.toLocaleString()}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.payButton} onPress={handlePay}>
          <Text style={styles.payButtonText}>Pay GHS {totalAmount.toLocaleString()}</Text>
          <Ionicons name="lock-closed-outline" size={16} color="#FFFFFF" />
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
  fieldLabel: { fontSize: 14, fontWeight: "700", color: NAVY, marginBottom: 12 },
  methodsList: { gap: 10 },
  methodItem: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#F9FAFB", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: "#E5E7EB",
  },
  methodItemActive: { borderColor: NAVY, backgroundColor: "#F3F4F6" },
  methodLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  methodLabel: { fontSize: 15, fontWeight: "600", color: NAVY },
  methodDesc: { fontSize: 12, fontWeight: "500", color: "#6B7280" },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#D1D5DB", alignItems: "center", justifyContent: "center" },
  radioActive: { borderColor: NAVY },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: NAVY },
  inputRow: {
    flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#F9FAFB",
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 10,
  },
  input: { flex: 1, fontSize: 15, color: NAVY, paddingVertical: 0 },
  escrowCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#F3F4F6" },
  escrowIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  escrowTextWrap: { flex: 1 },
  escrowTitle: { fontSize: 14, fontWeight: "700", color: NAVY, marginBottom: 2 },
  escrowDesc: { fontSize: 12, fontWeight: "500", color: "#6B7280", lineHeight: 18 },
  summaryRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 6 },
  summaryLabel: { fontSize: 14, fontWeight: "500", color: "#6B7280" },
  summaryValue: { fontSize: 14, fontWeight: "600", color: NAVY, textAlign: "right", flex: 1, marginLeft: 12 },
  totalLabel: { fontSize: 16, fontWeight: "700", color: NAVY },
  totalValue: { fontSize: 18, fontWeight: "800", color: NAVY },
  bottomBar: {
    position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "#FFFFFF",
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#E5E7EB",
    paddingHorizontal: 20, paddingVertical: 16, paddingBottom: Platform.select({ ios: 24, android: 16 }),
  },
  payButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: NAVY, paddingVertical: 16, borderRadius: 14,
  },
  payButtonText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
});
