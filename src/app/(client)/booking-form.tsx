import { useState, useCallback } from "react";
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
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/contexts/AuthProvider";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convexApi";
import * as Haptics from "expo-haptics";
// eslint-disable-next-line import/no-unresolved
import DateTimePicker from "@react-native-community/datetimepicker";
import { createCardStyle, SectionHeader, Divider } from "@/components/DesignSystem";

const NAVY = "#2C3E5B";

type BookingStep = "details" | "payment" | "confirmation";

export default function BookingFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ vehicleId?: string }>();
  const { userId, signedIn } = useAuth();
  const [step, setStep] = useState<BookingStep>("details");
  const [bookWithDriver, setBookWithDriver] = useState(false);
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
  const convexUser = useQuery(
    api.users.getByUserId,
    userId ? { userId } : "skip"
  );

  const vehicle = useQuery(
    api.jobs.getVehicle,
    vehicleId ? { id: vehicleId as any } : "skip"
  );

  const createBooking = useMutation(api.jobs.createBooking);

  const today = new Date();
  const minDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
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

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) {
      if (startDate && selectedDate <= startDate) {
        Alert.alert("Invalid date", "Return date must be after pickup date.");
        return;
      }
      setEndDate(selectedDate);
    }
  };

  const calculateDays = useCallback(() => {
    if (!startDate || !endDate) return 1;
    const diff = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.max(diff, 1);
  }, [startDate, endDate]);

  const days = calculateDays();
  const subtotal = vehicle ? vehicle.pricePerDay * days : 0;
  const driverFee = bookWithDriver && vehicle?.driverRate
    ? vehicle.driverRate * days
    : 0;
  const serviceFee = Math.round(subtotal * 0.05);
  const securityDeposit = vehicle?.securityDeposit ?? 0;
  const totalAmount = subtotal + driverFee + serviceFee + securityDeposit;

  const formatDateDisplay = (date: Date | null) => {
    if (!date) return "Select date";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleContinueToPayment = useCallback(() => {
    if (!startDate || !endDate) {
      Alert.alert("Dates required", "Please select pickup and return dates.");
      return;
    }
    if (!pickupLocation.trim() || !dropoffLocation.trim()) {
      Alert.alert("Locations required", "Please enter pickup and dropoff locations.");
      return;
    }
    if (!pickupTime.trim() || !returnTime.trim()) {
      Alert.alert("Times required", "Please enter pickup and return times.");
      return;
    }
    if (!signedIn) {
      Alert.alert("Sign in required", "Please sign in to complete your booking.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep("payment");
  }, [startDate, endDate, pickupLocation, dropoffLocation, pickupTime, returnTime, signedIn]);

  const handlePayNow = useCallback(async () => {
    if (!convexUser?._id || !vehicleId || !startDate || !endDate) return;

    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      const bookingId = await createBooking({
        vehicleId: vehicleId as any,
        renterId: convexUser._id,
        startDate: startDateStr,
        endDate: endDateStr,
        pickupLocation: pickupLocation.trim(),
        dropoffLocation: dropoffLocation.trim(),
        subtotal,
        driverFee,
        serviceFee,
        securityDeposit,
        totalAmount,
        currency: "GHS",
        instantBook: vehicle?.instantBook ?? false,
      });
      router.replace(`/(client)/booking-confirmation?bookingId=${bookingId}`);
    } catch {
      Alert.alert("Booking failed", "Unable to complete booking. Please try again.");
    }
  }, [convexUser?._id, vehicleId, startDate, endDate, pickupLocation, dropoffLocation, subtotal, driverFee, serviceFee, securityDeposit, totalAmount, vehicle?.instantBook, createBooking, router]);

  if (!vehicle && vehicleId) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading vehicle...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.stepperRow}>
          {(["details", "payment", "confirmation"] as BookingStep[]).map((s, i) => (
            <View key={s} style={styles.stepperItem}>
              <View style={[styles.stepperCircle, step === s && styles.stepperCircleActive]}>
                <Text style={[styles.stepperNumber, step === s && styles.stepperNumberActive]}>
                  {i + 1}
                </Text>
              </View>
              <Text style={[styles.stepperLabel, step === s && styles.stepperLabelActive]}>
                {s === "details" ? "Details" : s === "payment" ? "Payment" : "Confirmation"}
              </Text>
              {i < 2 && <View style={[styles.stepperLine, step !== s && styles.stepperLineInactive]} />}
            </View>
          ))}
        </View>

        {step === "details" && (
          <View style={styles.stepContent}>
            <SectionHeader title="Booking Details" subtitle="Select your dates and preferences" />
            {vehicle && (
              <View style={createCardStyle()}>
                <View style={styles.vehicleRow}>
                  <View style={styles.vehicleImageWrap}>
                    {vehicle.images?.[0] ? (
                      <Image source={{ uri: vehicle.images[0] }} style={styles.vehicleImage} contentFit="cover" />
                    ) : (
                      <View style={styles.vehicleImageFallback}>
                        <Ionicons name="car-outline" size={24} color="#9CA3AF" />
                      </View>
                    )}
                  </View>
                  <View style={styles.vehicleInfo}>
                    <Text style={styles.vehicleTitle}>{vehicle.title}</Text>
                    <Text style={styles.vehicleCategory}>{vehicle.category} • {vehicle.city}</Text>
                    <Text style={styles.vehiclePrice}>GHS {vehicle.pricePerDay}/day</Text>
                  </View>
                </View>
              </View>
            )}

            <View style={createCardStyle({ marginTop: 16 })}>
              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleTitle}>Book with driver</Text>
                  <Text style={styles.toggleSubtitle}>
                    {bookWithDriver && vehicle?.driverRate
                      ? `GHS ${vehicle.driverRate}/day will be added`
                      : "Add a verified driver to your booking"}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.toggleSwitch, bookWithDriver && styles.toggleSwitchActive]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setBookWithDriver(!bookWithDriver);
                  }}
                >
                  <View style={[styles.toggleThumb, bookWithDriver && styles.toggleThumbActive]} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={createCardStyle({ marginTop: 16 })}>
              <Text style={styles.fieldLabel}>Pickup & Return Dates</Text>
              <View style={styles.dateRow}>
                <TouchableOpacity style={styles.dateField} onPress={() => setShowStartPicker(true)}>
                  <Text style={styles.dateLabel}>Pickup</Text>
                  <Text style={styles.dateValue}>{formatDateDisplay(startDate)}</Text>
                  <Ionicons name="calendar-outline" size={18} color={NAVY} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.dateField} onPress={() => setShowEndPicker(true)}>
                  <Text style={styles.dateLabel}>Return</Text>
                  <Text style={styles.dateValue}>{formatDateDisplay(endDate)}</Text>
                  <Ionicons name="calendar-outline" size={18} color={NAVY} />
                </TouchableOpacity>
              </View>
              {showStartPicker && (
                <DateTimePicker
                  value={startDate || minDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  minimumDate={minDate}
                  onChange={handleStartDateChange}
                />
              )}
              {showEndPicker && (
                <DateTimePicker
                  value={endDate || minDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  minimumDate={startDate || minDate}
                  onChange={handleEndDateChange}
                />
              )}
            </View>

            <View style={createCardStyle({ marginTop: 16 })}>
              <Text style={styles.fieldLabel}>Pickup & Return Times</Text>
              <View style={styles.timeRow}>
                <View style={styles.timeField}>
                  <Text style={styles.timeLabel}>Pickup time</Text>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="e.g. 10:00 AM"
                    placeholderTextColor="#9CA3AF"
                    value={pickupTime}
                    onChangeText={setPickupTime}
                  />
                </View>
                <View style={styles.timeField}>
                  <Text style={styles.timeLabel}>Return time</Text>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="e.g. 6:00 PM"
                    placeholderTextColor="#9CA3AF"
                    value={returnTime}
                    onChangeText={setReturnTime}
                  />
                </View>
              </View>
            </View>

            <View style={createCardStyle({ marginTop: 16 })}>
              <Text style={styles.fieldLabel}>Locations</Text>
              <View style={styles.locationField}>
                <View style={styles.locationIconWrap}>
                  <Ionicons name="location" size={18} color={NAVY} />
                </View>
                <TextInput
                  style={styles.locationInput}
                  placeholder="Pickup location"
                  placeholderTextColor="#9CA3AF"
                  value={pickupLocation}
                  onChangeText={setPickupLocation}
                />
              </View>
              <View style={styles.locationField}>
                <View style={styles.locationIconWrap}>
                  <Ionicons name="location" size={18} color="#EF4444" />
                </View>
                <TextInput
                  style={styles.locationInput}
                  placeholder="Drop-off location"
                  placeholderTextColor="#9CA3AF"
                  value={dropoffLocation}
                  onChangeText={setDropoffLocation}
                />
              </View>
            </View>

            <View style={createCardStyle({ marginTop: 16 })}>
              <Text style={styles.fieldLabel}>Special Requests (optional)</Text>
              <TextInput
                style={styles.requestsInput}
                placeholder="Any special requirements..."
                placeholderTextColor="#9CA3AF"
                value={specialRequests}
                onChangeText={setSpecialRequests}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={createCardStyle({ marginTop: 16 })}>
              <Text style={styles.fieldLabel}>Price Breakdown</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Base rate ({days} day{days !== 1 ? "s" : ""})</Text>
                <Text style={styles.priceValue}>GHS {subtotal.toLocaleString()}</Text>
              </View>
              {bookWithDriver && driverFee > 0 && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Driver fee ({days} day{days !== 1 ? "s" : ""})</Text>
                  <Text style={styles.priceValue}>GHS {driverFee.toLocaleString()}</Text>
                </View>
              )}
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Service fee</Text>
                <Text style={styles.priceValue}>GHS {serviceFee.toLocaleString()}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Security deposit</Text>
                <Text style={styles.priceValue}>GHS {securityDeposit.toLocaleString()}</Text>
              </View>
              <Divider />
              <View style={styles.priceRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>GHS {totalAmount.toLocaleString()}</Text>
              </View>
            </View>
          </View>
        )}

        {step === "payment" && (
          <View style={styles.stepContent}>
            <SectionHeader title="Payment" subtitle="Choose your payment method" />
            <View style={createCardStyle()}>
              <Text style={styles.fieldLabel}>Payment Method</Text>
              <View style={styles.paymentMethods}>
                {[
                  { id: "mobile_money", label: "Mobile Money", icon: "phone-portrait-outline" },
                  { id: "card", label: "Card", icon: "card-outline" },
                  { id: "wallet", label: "Wallet", icon: "wallet-outline" },
                ].map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    style={styles.paymentMethodItem}
                    onPress={() => {}}
                  >
                    <Ionicons name={method.icon as any} size={22} color={NAVY} />
                    <Text style={styles.paymentMethodLabel}>{method.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={createCardStyle({ marginTop: 16 })}>
              <Text style={styles.fieldLabel}>Booking Summary</Text>
              {vehicle && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Vehicle</Text>
                  <Text style={styles.summaryValue}>{vehicle.title}</Text>
                </View>
              )}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Dates</Text>
                <Text style={styles.summaryValue}>
                  {startDate ? formatDateDisplay(startDate) : "—"} — {endDate ? formatDateDisplay(endDate) : "—"}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Pickup</Text>
                <Text style={styles.summaryValue}>{pickupLocation || "—"}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Drop-off</Text>
                <Text style={styles.summaryValue}>{dropoffLocation || "—"}</Text>
              </View>
              <Divider />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>GHS {totalAmount.toLocaleString()}</Text>
              </View>
              <Text style={styles.escrowText}>
                Payment will be held securely and released after your trip.
              </Text>
            </View>
          </View>
        )}

        {step === "confirmation" && (
          <View style={styles.stepContent}>
            <SectionHeader title="Confirmation" subtitle="Review your booking" />
            <View style={createCardStyle()}>
              {vehicle && (
                <View style={styles.confirmationVehicle}>
                  {vehicle.images?.[0] && (
                    <Image source={{ uri: vehicle.images[0] }} style={styles.confirmationImage} contentFit="cover" />
                  )}
                  <View>
                    <Text style={styles.confirmationTitle}>{vehicle.title}</Text>
                    <Text style={styles.confirmationCategory}>{vehicle.category} • {vehicle.city}</Text>
                  </View>
                </View>
              )}
              <Divider />
              <View style={styles.confirmationRow}>
                <Text style={styles.confirmationLabel}>Booking ID</Text>
                <Text style={styles.confirmationValue}>Pending</Text>
              </View>
              <View style={styles.confirmationRow}>
                <Text style={styles.confirmationLabel}>Dates</Text>
                <Text style={styles.confirmationValue}>
                  {startDate ? formatDateDisplay(startDate) : "—"} — {endDate ? formatDateDisplay(endDate) : "—"}
                </Text>
              </View>
              <View style={styles.confirmationRow}>
                <Text style={styles.confirmationLabel}>Pickup</Text>
                <Text style={styles.confirmationValue}>{pickupLocation || "—"}</Text>
              </View>
              <View style={styles.confirmationRow}>
                <Text style={styles.confirmationLabel}>Drop-off</Text>
                <Text style={styles.confirmationValue}>{dropoffLocation || "—"}</Text>
              </View>
              <Divider />
              <View style={styles.confirmationRow}>
                <Text style={styles.confirmationLabel}>Payment</Text>
                <Text style={styles.confirmationValue}>GHS {totalAmount.toLocaleString()}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {step !== "confirmation" && (
        <View style={styles.bottomBar}>
          {step === "details" && (
            <TouchableOpacity style={styles.primaryButton} onPress={handleContinueToPayment}>
              <Text style={styles.primaryButtonText}>Continue to Payment</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          {step === "payment" && (
            <View style={styles.bottomActions}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setStep("details")}
              >
                <Text style={styles.secondaryButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton} onPress={handlePayNow}>
                <Text style={styles.primaryButtonText}>Pay GHS {totalAmount.toLocaleString()}</Text>
              </TouchableOpacity>
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
  stepContent: { marginTop: 8 },
  stepperRow: { flexDirection: "row", alignItems: "center", marginBottom: 24, paddingHorizontal: 4 },
  stepperItem: { flexDirection: "row", alignItems: "center", flex: 1 },
  stepperCircle: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: "#F3F4F6",
    alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#E5E7EB",
  },
  stepperCircleActive: { backgroundColor: NAVY, borderColor: NAVY },
  stepperNumber: { fontSize: 14, fontWeight: "700", color: "#6B7280" },
  stepperNumberActive: { color: "#FFFFFF" },
  stepperLabel: { fontSize: 12, fontWeight: "600", color: "#6B7280", marginLeft: 8 },
  stepperLabelActive: { color: NAVY, fontWeight: "700" },
  stepperLine: { flex: 1, height: 2, backgroundColor: NAVY, marginHorizontal: 8 },
  stepperLineInactive: { backgroundColor: "#E5E7EB" },
  loadingText: { fontSize: 15, fontWeight: "600", color: "#6B7280", textAlign: "center", marginTop: 60 },
  vehicleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  vehicleImageWrap: { width: 72, height: 72, borderRadius: 12, overflow: "hidden", backgroundColor: "#F3F4F6", flexShrink: 0 },
  vehicleImage: { width: "100%", height: "100%" },
  vehicleImageFallback: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  vehicleInfo: { flex: 1, minWidth: 0 },
  vehicleTitle: { fontSize: 16, fontWeight: "700", color: NAVY },
  vehicleCategory: { fontSize: 13, fontWeight: "500", color: "#6B7280", marginTop: 2 },
  vehiclePrice: { fontSize: 15, fontWeight: "700", color: "#10B981", marginTop: 4 },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  toggleInfo: { flex: 1 },
  toggleTitle: { fontSize: 15, fontWeight: "700", color: NAVY, marginBottom: 2 },
  toggleSubtitle: { fontSize: 13, fontWeight: "500", color: "#6B7280" },
  toggleSwitch: { width: 48, height: 28, borderRadius: 14, backgroundColor: "#E5E7EB", padding: 2 },
  toggleSwitchActive: { backgroundColor: NAVY },
  toggleThumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#FFFFFF" },
  toggleThumbActive: { transform: [{ translateX: 20 }] },
  fieldLabel: { fontSize: 14, fontWeight: "700", color: NAVY, marginBottom: 12 },
  dateRow: { flexDirection: "row", gap: 12 },
  dateField: {
    flex: 1, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#F9FAFB",
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: "#E5E7EB",
  },
  dateLabel: { fontSize: 11, fontWeight: "600", color: "#6B7280", position: "absolute", top: 6, left: 14 },
  dateValue: { flex: 1, fontSize: 14, fontWeight: "600", color: NAVY, marginTop: 8 },
  timeRow: { flexDirection: "row", gap: 12 },
  timeField: { flex: 1 },
  timeLabel: { fontSize: 13, fontWeight: "600", color: NAVY, marginBottom: 8 },
  timeInput: {
    backgroundColor: "#F9FAFB", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: NAVY, borderWidth: 1, borderColor: "#E5E7EB",
  },
  locationField: {
    flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#F9FAFB",
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 10,
  },
  locationIconWrap: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" },
  locationInput: { flex: 1, fontSize: 15, color: NAVY, paddingVertical: 0 },
  requestsInput: {
    backgroundColor: "#F9FAFB", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: NAVY, borderWidth: 1, borderColor: "#E5E7EB", textAlignVertical: "top", minHeight: 80,
  },
  priceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 6 },
  priceLabel: { fontSize: 14, fontWeight: "500", color: "#6B7280" },
  priceValue: { fontSize: 14, fontWeight: "600", color: NAVY },
  totalLabel: { fontSize: 16, fontWeight: "700", color: NAVY },
  totalValue: { fontSize: 18, fontWeight: "800", color: NAVY },
  paymentMethods: { flexDirection: "row", gap: 10 },
  paymentMethodItem: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#F9FAFB", borderRadius: 12, paddingVertical: 14, borderWidth: 1, borderColor: "#E5E7EB",
  },
  paymentMethodLabel: { fontSize: 13, fontWeight: "600", color: NAVY },
  summaryRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 6 },
  summaryLabel: { fontSize: 14, fontWeight: "500", color: "#6B7280" },
  summaryValue: { fontSize: 14, fontWeight: "600", color: NAVY, textAlign: "right", flex: 1, marginLeft: 12 },
  escrowText: { fontSize: 12, fontWeight: "500", color: "#6B7280", textAlign: "center", marginTop: 12, fontStyle: "italic" },
  confirmationVehicle: { flexDirection: "row", alignItems: "center", gap: 12 },
  confirmationImage: { width: 80, height: 80, borderRadius: 12 },
  confirmationTitle: { fontSize: 16, fontWeight: "700", color: NAVY },
  confirmationCategory: { fontSize: 13, fontWeight: "500", color: "#6B7280", marginTop: 2 },
  confirmationRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8 },
  confirmationLabel: { fontSize: 14, fontWeight: "500", color: "#6B7280" },
  confirmationValue: { fontSize: 14, fontWeight: "600", color: NAVY },
  bottomBar: {
    position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "#FFFFFF",
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#E5E7EB",
    paddingHorizontal: 20, paddingVertical: 16, paddingBottom: Platform.select({ ios: 24, android: 16 }),
  },
  bottomActions: { flexDirection: "row", gap: 12 },
  primaryButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: NAVY, paddingVertical: 16, borderRadius: 14, flex: 1,
  },
  primaryButtonText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
  secondaryButton: { backgroundColor: "#F3F4F6", paddingVertical: 16, paddingHorizontal: 24, borderRadius: 14, borderWidth: 1, borderColor: "#E5E7EB" },
  secondaryButtonText: { fontSize: 15, fontWeight: "700", color: NAVY },
});
