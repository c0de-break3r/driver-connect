import { useState, useCallback } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/contexts/AuthProvider";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convexApi";
import * as Haptics from "expo-haptics";
import DateTimePicker from "@react-native-community/datetimepicker";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { ProgressSteps, ProgressStep } from "@/components/ui/progress-steps";
import { Textarea } from "@/components/ui/textarea";

const NAVY = "#2C3E5B";

type BookingStep = "details" | "payment" | "confirmation";
type PaymentMethod = "mobile_money" | "card" | "wallet";

export default function BookingFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ vehicleId?: string; driverId?: string }>();
  const { signedIn } = useAuth();
  const [step, setStep] = useState<BookingStep>("details");
  const [bookWithDriver, setBookWithDriver] = useState(false);
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [pickupTime, setPickupTime] = useState("");
  const [returnTime, setReturnTime] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const vehicleId = params.vehicleId;
  const selectedDriverId = params.driverId;
  const vehicle = useQuery(api.jobs.getVehicle, vehicleId ? { id: vehicleId as any } : "skip");
  const createBooking = useMutation(api.jobs.createBooking);
  const confirmPayment = useMutation(api.jobs.confirmPayment);

  const today = new Date();
  const minDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  const handleStartDateChange = (_event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      if (endDate && selectedDate >= endDate) {
        const newEnd = new Date(selectedDate);
        newEnd.setDate(newEnd.getDate() + 1);
        setEndDate(newEnd);
      }
    }
  };

  const handleEndDateChange = (_event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) {
      if (startDate && selectedDate <= startDate) {
        alert("Return date must be after pickup date.");
        return;
      }
      setEndDate(selectedDate);
    }
  };

  const calculateDays = useCallback(() => {
    if (!startDate || !endDate) return 1;
    const diff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(diff, 1);
  }, [startDate, endDate]);

  const days = calculateDays();
  const subtotal = vehicle ? vehicle.pricePerDay * days : 0;
  const driverFee = bookWithDriver && vehicle?.driverRate ? vehicle.driverRate * days : 0;
  const serviceFee = Math.round(subtotal * 0.05);
  const securityDeposit = vehicle?.securityDeposit ?? 0;
  const totalAmount = subtotal + driverFee + serviceFee + securityDeposit;

  const formatDateDisplay = (date: Date | null) => {
    if (!date) return "Select date";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const handleContinueToPayment = useCallback(() => {
    if (!startDate || !endDate) { alert("Please select pickup and return dates."); return; }
    if (!pickupLocation.trim() || !dropoffLocation.trim()) { alert("Please enter pickup and dropoff locations."); return; }
    if (!pickupTime.trim() || !returnTime.trim()) { alert("Please enter pickup and return times."); return; }
    if (!signedIn) { alert("Please sign in to complete your booking."); return; }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep("payment");
  }, [startDate, endDate, pickupLocation, dropoffLocation, pickupTime, returnTime, signedIn]);

  const handlePayNow = useCallback(async () => {
    if (!vehicleId || !startDate || !endDate) return;
    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      const bookingId = await createBooking({
        vehicleId: vehicleId as any,
        startDate: startDateStr, endDate: endDateStr,
        pickupLocation: pickupLocation.trim(), dropoffLocation: dropoffLocation.trim(),
        subtotal, driverFee, serviceFee, securityDeposit, totalAmount,
        currency: "GHS", instantBook: vehicle?.instantBook ?? false,
        driverId: selectedDriverId,
        includeDriver: bookWithDriver,
      });
      await confirmPayment({ bookingId });
      router.replace(`/(client)/booking-confirmation?bookingId=${bookingId}`);
    } catch {
      alert("Unable to complete booking. Please try again.");
    }
  }, [vehicleId, selectedDriverId, bookWithDriver, startDate, endDate, pickupLocation, dropoffLocation, subtotal, driverFee, serviceFee, securityDeposit, totalAmount, vehicle?.instantBook, createBooking, confirmPayment, router]);

  if (!vehicle && vehicleId) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading vehicle...</Text>
      </View>
    );
  }

  const stepIndex = step === "details" ? 0 : step === "payment" ? 1 : 2;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ProgressSteps current={stepIndex}>
          <ProgressStep label="Details" />
          <ProgressStep label="Payment" />
          <ProgressStep label="Confirmation" />
        </ProgressSteps>

        {step === "details" && (
          <View style={styles.stepContent}>
            <Text className="text-lg font-extrabold mb-4" style={{ color: NAVY }}>Booking Details</Text>
            <Text className="text-sm font-medium text-gray-500 mb-4">Select your dates and preferences</Text>
            {vehicle && (
              <Card className="mb-4 bg-gray-50 border-gray-200">
                <View className="flex-row items-center gap-3">
                  <View style={styles.vehicleImageWrap}>
                    {vehicle.images?.[0] ? (
                      <Image source={{ uri: vehicle.images[0] }} style={styles.vehicleImage} contentFit="cover" />
                    ) : (
                      <View style={styles.vehicleImageFallback}>
                        <Ionicons name="car-outline" size={24} color="#9CA3AF" />
                      </View>
                    )}
                  </View>
                  <View className="flex-1 min-w-0">
                    <Text className="text-base font-bold" style={{ color: NAVY }}>{vehicle.title}</Text>
                    <Text className="text-xs font-medium text-gray-500 mt-1">{vehicle.category} · {vehicle.city}</Text>
                    <Text className="text-sm font-bold text-emerald-600 mt-1">GHS {vehicle.pricePerDay}/day</Text>
                  </View>
                </View>
              </Card>
            )}

            <Card className="mb-4 bg-gray-50 border-gray-200">
              <View className="flex-row items-center justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-sm font-bold" style={{ color: NAVY }}>Book with driver</Text>
                  <Text className="text-xs font-medium text-gray-500 mt-1">
                    {bookWithDriver && vehicle?.driverRate ? `GHS ${vehicle.driverRate}/day will be added` : "Add a verified driver to your booking"}
                  </Text>
                </View>
                <Switch value={bookWithDriver} onValueChange={(val) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setBookWithDriver(val); }} />
              </View>
            </Card>

            <Card className="mb-4 bg-gray-50 border-gray-200">
              <Text className="text-sm font-bold mb-3" style={{ color: NAVY }}>Pickup & Return Dates</Text>
              <View className="flex-row gap-3">
                <Button variant="outline" onPress={() => setShowStartPicker(true)} className="flex-1 h-auto py-3 px-4 flex-row items-center gap-2 rounded-xl border-gray-200 bg-gray-50">
                  <Text className="text-[11px] font-semibold text-gray-500 absolute top-2 left-4">Pickup</Text>
                  <Text className="flex-1 text-sm font-semibold mt-1" style={{ color: NAVY }}>{formatDateDisplay(startDate)}</Text>
                  <Ionicons name="calendar-outline" size={18} color={NAVY} />
                </Button>
                <Button variant="outline" onPress={() => setShowEndPicker(true)} className="flex-1 h-auto py-3 px-4 flex-row items-center gap-2 rounded-xl border-gray-200 bg-gray-50">
                  <Text className="text-[11px] font-semibold text-gray-500 absolute top-2 left-4">Return</Text>
                  <Text className="flex-1 text-sm font-semibold mt-1" style={{ color: NAVY }}>{formatDateDisplay(endDate)}</Text>
                  <Ionicons name="calendar-outline" size={18} color={NAVY} />
                </Button>
              </View>
              {showStartPicker && (
                <DateTimePicker value={startDate || minDate} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"} minimumDate={minDate} onChange={handleStartDateChange} />
              )}
              {showEndPicker && (
                <DateTimePicker value={endDate || minDate} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"} minimumDate={startDate || minDate} onChange={handleEndDateChange} />
              )}
            </Card>

            <Card className="mb-4 bg-gray-50 border-gray-200">
              <Text className="text-sm font-bold mb-3" style={{ color: NAVY }}>Pickup & Return Times</Text>
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-xs font-semibold mb-2" style={{ color: NAVY }}>Pickup time</Text>
                  <Input placeholder="e.g. 10:00 AM" placeholderTextColor="#9CA3AF" value={pickupTime} onChangeText={setPickupTime} className="bg-gray-50 border-gray-200 rounded-xl" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-semibold mb-2" style={{ color: NAVY }}>Return time</Text>
                  <Input placeholder="e.g. 6:00 PM" placeholderTextColor="#9CA3AF" value={returnTime} onChangeText={setReturnTime} className="bg-gray-50 border-gray-200 rounded-xl" />
                </View>
              </View>
            </Card>

            <Card className="mb-4 bg-gray-50 border-gray-200">
              <Text className="text-sm font-bold mb-3" style={{ color: NAVY }}>Locations</Text>
              <View className="gap-3">
                <View className="flex-row items-center gap-2.5 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                  <View className="w-7 h-7 rounded-full bg-gray-200 items-center justify-center border border-gray-300">
                    <Ionicons name="location" size={16} color={NAVY} />
                  </View>
                  <Input placeholder="Pickup location" placeholderTextColor="#9CA3AF" value={pickupLocation} onChangeText={setPickupLocation} className="flex-1 bg-transparent border-none p-0" />
                </View>
                <View className="flex-row items-center gap-2.5 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                  <View className="w-7 h-7 rounded-full bg-gray-200 items-center justify-center border border-gray-300">
                    <Ionicons name="location" size={16} color="#EF4444" />
                  </View>
                  <Input placeholder="Drop-off location" placeholderTextColor="#9CA3AF" value={dropoffLocation} onChangeText={setDropoffLocation} className="flex-1 bg-transparent border-none p-0" />
                </View>
              </View>
            </Card>

            <Card className="mb-4 bg-gray-50 border-gray-200">
              <Text className="text-sm font-bold mb-3" style={{ color: NAVY }}>Special Requests (optional)</Text>
              <Textarea placeholder="Any special requirements..." placeholderTextColor="#9CA3AF" value={specialRequests} onChangeText={setSpecialRequests} className="bg-gray-50 border-gray-200 rounded-xl min-h-[80px]" />
            </Card>

            <Card className="bg-gray-50 border-gray-200">
              <Text className="text-sm font-bold mb-3" style={{ color: NAVY }}>Price Breakdown</Text>
              <View className="flex-row items-center justify-between py-1.5">
                <Text className="text-sm font-medium text-gray-500">Base rate ({days} day{days !== 1 ? "s" : ""})</Text>
                <Text className="text-sm font-semibold" style={{ color: NAVY }}>GHS {subtotal.toLocaleString()}</Text>
              </View>
              {bookWithDriver && driverFee > 0 && (
                <View className="flex-row items-center justify-between py-1.5">
                  <Text className="text-sm font-medium text-gray-500">Driver fee ({days} day{days !== 1 ? "s" : ""})</Text>
                  <Text className="text-sm font-semibold" style={{ color: NAVY }}>GHS {driverFee.toLocaleString()}</Text>
                </View>
              )}
              <View className="flex-row items-center justify-between py-1.5">
                <Text className="text-sm font-medium text-gray-500">Service fee</Text>
                <Text className="text-sm font-semibold" style={{ color: NAVY }}>GHS {serviceFee.toLocaleString()}</Text>
              </View>
              <View className="flex-row items-center justify-between py-1.5">
                <Text className="text-sm font-medium text-gray-500">Security deposit</Text>
                <Text className="text-sm font-semibold" style={{ color: NAVY }}>GHS {securityDeposit.toLocaleString()}</Text>
              </View>
              <View style={styles.divider} />
              <View className="flex-row items-center justify-between py-1.5">
                <Text className="text-base font-bold" style={{ color: NAVY }}>Total</Text>
                <Text className="text-lg font-extrabold" style={{ color: NAVY }}>GHS {totalAmount.toLocaleString()}</Text>
              </View>
            </Card>
          </View>
        )}

        {step === "payment" && (
          <View style={styles.stepContent}>
            <Text className="text-lg font-extrabold mb-1" style={{ color: NAVY }}>Payment</Text>
            <Text className="text-sm font-medium text-gray-500 mb-4">Choose your payment method</Text>
            <Card className="mb-4 bg-gray-50 border-gray-200">
              <Text className="text-sm font-bold mb-3" style={{ color: NAVY }}>Payment Method</Text>
              <RadioGroup value={method || ""} onValueChange={(val) => setMethod(val as PaymentMethod)}>
                {[
                  { id: "mobile_money", label: "Mobile Money", desc: "M-Pesa / MTN", icon: "phone-portrait-outline" },
                  { id: "card", label: "Credit / Debit Card", desc: "Visa, Mastercard", icon: "card-outline" },
                  { id: "wallet", label: "Wallet", desc: "In-app balance", icon: "wallet-outline" },
                ].map((m) => (
                  <RadioGroupItem key={m.id} value={m.id} label={m.label} className="flex-row items-center gap-3 py-3 border border-gray-200 rounded-xl px-4 bg-white mb-2">
                    <Ionicons name={m.icon as any} size={22} color={NAVY} />
                    <View className="flex-1">
                      <Text className="text-sm font-semibold" style={{ color: NAVY }}>{m.label}</Text>
                      <Text className="text-xs font-medium text-gray-500">{m.desc}</Text>
                    </View>
                  </RadioGroupItem>
                ))}
              </RadioGroup>
            </Card>

            <Card className="bg-gray-50 border-gray-200">
              <Text className="text-sm font-bold mb-3" style={{ color: NAVY }}>Booking Summary</Text>
              {vehicle && (
                <View className="flex-row items-center justify-between py-1.5">
                  <Text className="text-sm font-medium text-gray-500">Vehicle</Text>
                  <Text className="text-sm font-semibold" style={{ color: NAVY }}>{vehicle.title}</Text>
                </View>
              )}
              <View className="flex-row items-center justify-between py-1.5">
                <Text className="text-sm font-medium text-gray-500">Dates</Text>
                <Text className="text-sm font-semibold text-right flex-1 ml-3" style={{ color: NAVY }}>{startDate ? formatDateDisplay(startDate) : "—"} — {endDate ? formatDateDisplay(endDate) : "—"}</Text>
              </View>
              <View className="flex-row items-center justify-between py-1.5">
                <Text className="text-sm font-medium text-gray-500">Pickup</Text>
                <Text className="text-sm font-semibold text-right flex-1 ml-3" style={{ color: NAVY }}>{pickupLocation || "—"}</Text>
              </View>
              <View className="flex-row items-center justify-between py-1.5">
                <Text className="text-sm font-medium text-gray-500">Drop-off</Text>
                <Text className="text-sm font-semibold text-right flex-1 ml-3" style={{ color: NAVY }}>{dropoffLocation || "—"}</Text>
              </View>
              <View style={styles.divider} />
              <View className="flex-row items-center justify-between py-1.5">
                <Text className="text-base font-bold" style={{ color: NAVY }}>Total</Text>
                <Text className="text-lg font-extrabold" style={{ color: NAVY }}>GHS {totalAmount.toLocaleString()}</Text>
              </View>
              <Text className="text-xs font-medium text-gray-500 text-center mt-3 italic">Payment will be held securely and released after your trip.</Text>
            </Card>
          </View>
        )}

        {step === "confirmation" && (
          <View style={styles.stepContent}>
            <Text className="text-lg font-extrabold mb-1" style={{ color: NAVY }}>Confirmation</Text>
            <Text className="text-sm font-medium text-gray-500 mb-4">Review your booking</Text>
            <Card className="bg-gray-50 border-gray-200">
              {vehicle && (
                <View className="flex-row items-center gap-3 mb-4">
                  {vehicle.images?.[0] && (
                    <Image source={{ uri: vehicle.images[0] }} style={styles.confirmationImage} contentFit="cover" />
                  )}
                  <View>
                    <Text className="text-base font-bold" style={{ color: NAVY }}>{vehicle.title}</Text>
                    <Text className="text-xs font-medium text-gray-500">{vehicle.category} · {vehicle.city}</Text>
                  </View>
                </View>
              )}
              <View style={styles.divider} />
              <View className="flex-row items-center justify-between py-2">
                <Text className="text-sm font-medium text-gray-500">Booking ID</Text>
                <Text className="text-sm font-semibold" style={{ color: NAVY }}>Pending</Text>
              </View>
              <View className="flex-row items-center justify-between py-2">
                <Text className="text-sm font-medium text-gray-500">Dates</Text>
                <Text className="text-sm font-semibold" style={{ color: NAVY }}>{startDate ? formatDateDisplay(startDate) : "—"} — {endDate ? formatDateDisplay(endDate) : "—"}</Text>
              </View>
              <View className="flex-row items-center justify-between py-2">
                <Text className="text-sm font-medium text-gray-500">Pickup</Text>
                <Text className="text-sm font-semibold" style={{ color: NAVY }}>{pickupLocation || "—"}</Text>
              </View>
              <View className="flex-row items-center justify-between py-2">
                <Text className="text-sm font-medium text-gray-500">Drop-off</Text>
                <Text className="text-sm font-semibold" style={{ color: NAVY }}>{dropoffLocation || "—"}</Text>
              </View>
              <View style={styles.divider} />
              <View className="flex-row items-center justify-between py-2">
                <Text className="text-sm font-medium text-gray-500">Payment</Text>
                <Text className="text-base font-bold" style={{ color: NAVY }}>GHS {totalAmount.toLocaleString()}</Text>
              </View>
            </Card>
          </View>
        )}
      </ScrollView>

      {step !== "confirmation" && (
        <View style={styles.bottomBar}>
          {step === "details" && (
            <Button onPress={handleContinueToPayment} className="rounded-xl py-4 flex-row items-center justify-center gap-2">
              <Text className="text-sm font-bold text-white">Continue to Payment</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </Button>
          )}
          {step === "payment" && (
            <View className="flex-row gap-3">
              <Button variant="outline" onPress={() => setStep("details")} className="flex-1 rounded-xl py-4 border-gray-200">
                <Text className="text-sm font-bold" style={{ color: NAVY }}>Back</Text>
              </Button>
              <Button onPress={handlePayNow} className="flex-1 rounded-xl py-4">
                <Text className="text-sm font-bold text-white">Pay GHS {totalAmount.toLocaleString()}</Text>
              </Button>
            </View>
          )}
        </View>
      )}
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
  stepContent: { marginTop: 16 },
  vehicleImageWrap: { width: 72, height: 72, borderRadius: 12, overflow: "hidden", backgroundColor: "#F3F4F6", flexShrink: 0 },
  vehicleImage: { width: "100%", height: "100%" },
  vehicleImageFallback: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  confirmationImage: { width: 80, height: 80, borderRadius: 12 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#E5E7EB", marginVertical: 12 },
  bottomBar: {
    position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "#FFFFFF",
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#E5E7EB",
    paddingHorizontal: 20, paddingVertical: 16, paddingBottom: Platform.select({ ios: 24, android: 16 }),
  },
  loadingText: { fontSize: 15, fontWeight: "600", color: "#6B7280", textAlign: "center", marginTop: 60 },
});
