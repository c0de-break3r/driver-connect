import { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convexApi";
import * as Haptics from "expo-haptics";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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

  const booking = useQuery(api.jobs.getBooking, params.bookingId ? { bookingId: params.bookingId as any } : "skip");
  const confirmPayment = useMutation(api.jobs.confirmPayment);

  const handlePay = async () => {
    if (!method) { Alert.alert("Select method", "Please choose a payment method."); return; }
    if (method === "mobile_money" && !phoneNumber.trim()) { Alert.alert("Phone required", "Please enter your mobile money number."); return; }
    if (method === "card") {
      if (!cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim() || !cardName.trim()) {
        Alert.alert("Card details required", "Please fill in all card fields."); return;
      }
    }
    if (!params.bookingId) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await confirmPayment({ bookingId: params.bookingId as any });
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
        <Text className="text-lg font-extrabold mb-1" style={{ color: NAVY }}>Payment</Text>
        <Text className="text-sm font-medium text-gray-500 mb-5">Total: GHS {totalAmount.toLocaleString()}</Text>

        <Card className="bg-gray-50 border-gray-200 mb-4">
          <Text className="text-sm font-bold mb-3" style={{ color: NAVY }}>Select Payment Method</Text>
          <RadioGroup value={method || ""} onValueChange={(val) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMethod(val as PaymentMethod); }}>
            {[
              { id: "mobile_money" as PaymentMethod, label: "Mobile Money", desc: "M-Pesa / MTN", icon: "phone-portrait-outline" },
              { id: "card" as PaymentMethod, label: "Credit / Debit Card", desc: "Visa, Mastercard", icon: "card-outline" },
              { id: "wallet" as PaymentMethod, label: "Wallet", desc: "In-app balance", icon: "wallet-outline" },
            ].map((m) => (
              <RadioGroupItem key={m.id} value={m.id} className="flex-row items-center gap-3 py-3 border border-gray-200 rounded-xl px-4 bg-white mb-2.5">
                <Ionicons name={m.icon as any} size={22} color={NAVY} />
                <View className="flex-1">
                  <Text className="text-sm font-semibold" style={{ color: NAVY }}>{m.label}</Text>
                  <Text className="text-xs font-medium text-gray-500">{m.desc}</Text>
                </View>
              </RadioGroupItem>
            ))}
          </RadioGroup>
        </Card>

        {method === "mobile_money" && (
          <Card className="bg-gray-50 border-gray-200 mb-4">
            <Text className="text-sm font-bold mb-3" style={{ color: NAVY }}>Mobile Money Number</Text>
            <View className="flex-row items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
              <Ionicons name="phone-portrait-outline" size={20} color={NAVY} />
              <Input placeholder="e.g. 024 123 4567" placeholderTextColor="#9CA3AF" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" className="flex-1 bg-transparent border-none p-0" />
            </View>
          </Card>
        )}

        {method === "card" && (
          <Card className="bg-gray-50 border-gray-200 mb-4">
            <Text className="text-sm font-bold mb-3" style={{ color: NAVY }}>Card Information</Text>
            <View className="gap-3">
              <View className="flex-row items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                <Ionicons name="person-outline" size={20} color={NAVY} />
                <Input placeholder="Name on card" placeholderTextColor="#9CA3AF" value={cardName} onChangeText={setCardName} className="flex-1 bg-transparent border-none p-0" />
              </View>
              <View className="flex-row items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                <Ionicons name="card-outline" size={20} color={NAVY} />
                <Input placeholder="Card number" placeholderTextColor="#9CA3AF" value={cardNumber} onChangeText={setCardNumber} keyboardType="number-pad" className="flex-1 bg-transparent border-none p-0" />
              </View>
              <View className="flex-row items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                <Ionicons name="calendar-outline" size={20} color={NAVY} />
                <Input placeholder="MM/YY" placeholderTextColor="#9CA3AF" value={cardExpiry} onChangeText={setCardExpiry} keyboardType="number-pad" className="flex-1 bg-transparent border-none p-0" />
              </View>
              <View className="flex-row items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                <Ionicons name="lock-closed-outline" size={20} color={NAVY} />
                <Input placeholder="CVV" placeholderTextColor="#9CA3AF" value={cardCvv} onChangeText={setCardCvv} keyboardType="number-pad" secureTextEntry className="flex-1 bg-transparent border-none p-0" />
              </View>
            </View>
          </Card>
        )}

        <Card className="bg-gray-100 border-gray-200 mb-4 flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full bg-white items-center justify-center border border-gray-200">
            <Ionicons name="shield-checkmark-outline" size={22} color={NAVY} />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold" style={{ color: NAVY }}>Secure payment</Text>
            <Text className="text-xs font-medium text-gray-500">Your payment will be held securely and released to the vehicle owner after your trip is completed.</Text>
          </View>
        </Card>

        <Card className="bg-gray-50 border-gray-200">
          <Text className="text-sm font-bold mb-3" style={{ color: NAVY }}>Booking Summary</Text>
          <View className="flex-row items-center justify-between py-1.5">
            <Text className="text-sm font-medium text-gray-500">Vehicle</Text>
            <Text className="text-sm font-semibold" style={{ color: NAVY }}>{booking.vehicleId}</Text>
          </View>
          <View className="flex-row items-center justify-between py-1.5">
            <Text className="text-sm font-medium text-gray-500">Dates</Text>
            <Text className="text-sm font-semibold text-right flex-1 ml-3" style={{ color: NAVY }}>{booking.startDate} — {booking.endDate}</Text>
          </View>
          <View className="flex-row items-center justify-between py-1.5">
            <Text className="text-sm font-medium text-gray-500">Pickup</Text>
            <Text className="text-sm font-semibold text-right flex-1 ml-3" style={{ color: NAVY }}>{booking.pickupLocation}</Text>
          </View>
          <View className="flex-row items-center justify-between py-1.5">
            <Text className="text-sm font-medium text-gray-500">Drop-off</Text>
            <Text className="text-sm font-semibold text-right flex-1 ml-3" style={{ color: NAVY }}>{booking.dropoffLocation}</Text>
          </View>
          <View style={styles.divider} />
          <View className="flex-row items-center justify-between py-1.5">
            <Text className="text-base font-bold" style={{ color: NAVY }}>Total</Text>
            <Text className="text-lg font-extrabold" style={{ color: NAVY }}>GHS {totalAmount.toLocaleString()}</Text>
          </View>
        </Card>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button onPress={handlePay} className="rounded-xl py-4 flex-row items-center justify-center gap-2">
          <Text className="text-sm font-bold text-white">Pay GHS {totalAmount.toLocaleString()}</Text>
          <Ionicons name="lock-closed-outline" size={16} color="#FFFFFF" />
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
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#E5E7EB", marginVertical: 12 },
  bottomBar: {
    position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "#FFFFFF",
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#E5E7EB",
    paddingHorizontal: 20, paddingVertical: 16, paddingBottom: Platform.select({ ios: 24, android: 16 }),
  },
});
