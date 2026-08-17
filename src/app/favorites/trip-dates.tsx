import { useState, useMemo, useRef, useCallback } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import { useHomeStore } from "@/store/useHomeStore";
import { useQuery } from "convex/react";
import { api } from "@/lib/convexApi";
import { setPendingVehicleTripDates } from "@/lib/tripDateBridge";
import { addDriverAssignment } from "@/lib/driverAssignmentsBridge";
import { useNotificationStore } from "@/store/useNotificationStore";
import { DRIVERS } from "@/data/drivers";
import Toast from "@/components/Toast";

const NAVY = "#2C3E5B";
const ORANGE = "#F97316";

const TIME_SLOTS = [
  "10:00 am", "10:30 am", "11:00 am", "11:30 am",
  "12:00 pm", "12:30 pm", "1:00 pm", "1:30 pm",
];

const WEEK_DAYS = ["S", "M", "T", "W", "T", "F", "S"];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function TripDatesScreen() {
  const params = useLocalSearchParams();
  const collectionId = params.collectionId as string | undefined;
  const source = params.source as string | undefined;

  const updateCollectionTripDates = useFavoritesStore((state) => state.updateCollectionTripDates);
  const setActiveTab = useHomeStore((state) => state.setActiveTab);

  const initialMonthIndex = 7; // August (0-indexed)
  const initialYear = 2026;

  const [viewYear, setViewYear] = useState(initialYear);
  const [viewMonthIndex, setViewMonthIndex] = useState(initialMonthIndex);
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<string | null>(null);
  const [pickupTime, setPickupTime] = useState("10:00 am");
  const [returnTime, setReturnTime] = useState("10:00 am");
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: "success" | "error" | "info" | "warning" }>({ visible: false, message: "", type: "success" });

  const defaultPickupDate = params.defaultPickupDate as string | undefined;
  const defaultReturnDate = params.defaultReturnDate as string | undefined;
  const defaultPickupTime = params.defaultPickupTime as string | undefined;
  const defaultReturnTime = params.defaultReturnTime as string | undefined;
  const vehicleTitle = params.vehicleTitle as string | undefined;

  const convexVehicles = useQuery(api.jobs.listVehicles, {});
  const vehicles = (convexVehicles ?? []).map((v: any) => ({
    id: v._id,
    title: v.title,
    image: v.images?.[0] ?? "",
  }));

  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const notificationIdRef = useRef(0);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" | "warning" = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: "", type: "success" }), 2500);
  }, []);

  const daysInMonth = useMemo(() => {
    const monthIndex = viewMonthIndex;
    const days: (number | null)[] = [];
    const firstDay = new Date(viewYear, monthIndex, 1).getDay();
    const daysCount = new Date(viewYear, monthIndex + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysCount; i++) {
      days.push(i);
    }
    return days;
  }, [viewYear, viewMonthIndex]);

  const formatDate = (iso: string) => {
    const date = new Date(iso + "T00:00:00");
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  const toISODate = (day: number) => {
    const date = new Date(viewYear, viewMonthIndex, day);
    return date.toISOString().split("T")[0];
  };

  const handlePrevMonth = () => {
    if (viewMonthIndex === 0) {
      setViewMonthIndex(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonthIndex(viewMonthIndex - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonthIndex === 11) {
      setViewMonthIndex(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonthIndex(viewMonthIndex + 1);
    }
  };

  const handleAddTripDates = useCallback(() => {
    if (source === "driver") {
      const selectedVehicle = vehicles.find((v: any) => v.id === selectedVehicleId);

      setPendingVehicleTripDates({
        pickupDate: selectedStart ? formatDate(selectedStart) : defaultPickupDate || "Select date",
        returnDate: selectedEnd ? formatDate(selectedEnd) : defaultReturnDate || "Select date",
        pickupTime,
        returnTime,
        vehicleId: selectedVehicle?.id,
        vehicleTitle: selectedVehicle?.title,
      });

      showToast("Trip dates confirmed", "success");
      router.back();
      return;
    }

    if (source === "vehicle") {
      const selectedDriver = DRIVERS.find((d) => d.id === selectedDriverId);

      const pickupDateStr = selectedStart ? formatDate(selectedStart) : defaultPickupDate || "Select date";
      const returnDateStr = selectedEnd ? formatDate(selectedEnd) : defaultReturnDate || "Select date";

      setPendingVehicleTripDates({
        pickupDate: pickupDateStr,
        returnDate: returnDateStr,
        pickupTime,
        returnTime,
        driverId: selectedDriver?.id,
        driverName: selectedDriver?.name,
      });

      if (selectedDriver) {
        addDriverAssignment({
          driverId: selectedDriver.id,
          driverName: selectedDriver.name,
          vehicleTitle: vehicleTitle || "Vehicle booking",
          pickupDate: pickupDateStr,
          returnDate: returnDateStr,
          pickupTime,
          returnTime,
        });

        notificationIdRef.current += 1;
        const notificationId = `booking-${notificationIdRef.current}-${Date.now()}`;
        const notificationReceivedAt = Date.now();
        useNotificationStore.getState().addNotification({
          id: notificationId,
          title: "New Booking Request",
          body: `${selectedDriver.name}, you have a new booking request for ${vehicleTitle || "a vehicle"} on ${pickupDateStr}.`,
          receivedAt: notificationReceivedAt,
        });
      }

      showToast("Trip dates confirmed", "success");
      router.back();
      return;
    }

    if (!collectionId) {
      showToast("We couldn't find this list. Please try again.", "error");
      return;
    }
    if (!selectedStart || !selectedEnd) {
      showToast("Please choose both pickup and return dates to continue.", "warning");
      return;
    }

    updateCollectionTripDates(collectionId, {
      startDate: selectedStart,
      endDate: selectedEnd,
      startTime: pickupTime,
      endTime: returnTime,
    });

    showToast("Trip dates confirmed", "success");
    setActiveTab("favorites");
    router.replace(`/favorites/collection/${collectionId}`);
  }, [source, vehicles, selectedVehicleId, selectedStart, selectedEnd, defaultPickupDate, defaultReturnDate, pickupTime, returnTime, selectedDriverId, vehicleTitle, collectionId, updateCollectionTripDates, showToast, setActiveTab]);

  const handleDayPress = (day: number | null) => {
    if (!day) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const clickedISO = toISODate(day);
    if (!selectedStart || (selectedStart !== null && selectedEnd !== null)) {
      setSelectedStart(clickedISO);
      setSelectedEnd(null);
    } else if (clickedISO < selectedStart) {
      setSelectedEnd(selectedStart);
      setSelectedStart(clickedISO);
    } else if (clickedISO === selectedStart) {
      setSelectedEnd(clickedISO);
    } else {
      setSelectedEnd(clickedISO);
    }
  };

  const isDaySelected = (day: number | null) => {
    if (!day) return false;
    const iso = toISODate(day);
    return iso === selectedStart || iso === selectedEnd;
  };

  const isDayInRange = (day: number | null) => {
    if (!day || !selectedStart || !selectedEnd) return false;
    const iso = toISODate(day);
    return iso > selectedStart && iso < selectedEnd;
  };

  const isDayPast = (day: number | null) => {
    if (!day) return false;
    const iso = toISODate(day);
    const today = new Date().toISOString().split("T")[0];
    return iso < today;
  };

  const getDayStyle = (day: number | null) => {
    if (!day) return styles.dayEmpty;
    if (isDayPast(day)) return styles.dayPast;
    if (isDaySelected(day)) return styles.daySelected;
    if (isDayInRange(day)) return styles.dayInRange;
    return styles.day;
  };

  const getDayTextStyle = (day: number | null) => {
    if (!day) return styles.dayTextEmpty;
    if (isDayPast(day)) return styles.dayTextPast;
    if (isDaySelected(day)) return styles.dayTextSelected;
    if (isDayInRange(day)) return styles.dayTextInRange;
    return styles.dayText;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={NAVY} />
        </Pressable>
        <Text style={styles.headerTitle}>Trip dates</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Trip Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Pickup</Text>
              <Text style={styles.summaryValue}>
                {selectedStart ? formatDate(selectedStart) : "Select date"}
              </Text>
              <Text style={styles.summaryTime}>{pickupTime}</Text>
            </View>
            <View style={styles.summaryArrow}>
              <Ionicons name="arrow-forward" size={20} color="#9CA3AF" />
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Return</Text>
              <Text style={styles.summaryValue}>
                {selectedEnd ? formatDate(selectedEnd) : (selectedStart ? "Tap to select return" : "Select date")}
              </Text>
              <Text style={styles.summaryTime}>{returnTime}</Text>
            </View>
          </View>
        </View>

        {source === "driver" && (
          <View style={styles.vehicleSelectorCard}>
            <Text style={styles.vehicleSelectorLabel}>Assign to vehicle</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vehicleScroll}>
              {vehicles.map((vehicle: any) => (
                <Pressable
                  key={vehicle.id}
                  style={[
                    styles.vehicleChip,
                    selectedVehicleId === vehicle.id && styles.vehicleChipSelected,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedVehicleId(vehicle.id);
                  }}
                >
                  <Image
                    source={{ uri: vehicle.image || "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=200&q=80" }}
                    style={styles.vehicleChipImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.vehicleChipText} numberOfLines={1}>
                    {vehicle.title}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {source === "vehicle" && (
          <View style={styles.vehicleSelectorCard}>
            <Text style={styles.vehicleSelectorLabel}>Assign a driver</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vehicleScroll}>
              {DRIVERS.map((driver) => (
                <Pressable
                  key={driver.id}
                  style={[
                    styles.vehicleChip,
                    selectedDriverId === driver.id && styles.vehicleChipSelected,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedDriverId(driver.id);
                  }}
                >
                  <Image
                    source={{ uri: driver.image }}
                    style={styles.vehicleChipImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.vehicleChipText} numberOfLines={1}>
                    {driver.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Calendar */}
        <View style={styles.calendarCard}>
          <View style={styles.monthRow}>
            <Pressable onPress={handlePrevMonth} style={styles.monthNavButton}>
              <Ionicons name="chevron-back" size={20} color="#9CA3AF" />
            </Pressable>
            <Text style={styles.monthTitle}>
              {MONTH_NAMES[viewMonthIndex]} {viewYear}
            </Text>
            <Pressable onPress={handleNextMonth} style={styles.monthNavButton}>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>
          </View>

          <View style={styles.weekDaysRow}>
            {WEEK_DAYS.map((day, index) => (
              <View key={index} style={styles.weekDayCell}>
                <Text style={styles.weekDayText}>{day}</Text>
              </View>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {daysInMonth.map((day, index) => (
              <Pressable
                key={index}
                style={[styles.dayCell, getDayStyle(day)]}
                onPress={() => handleDayPress(day)}
                disabled={!day || isDayPast(day)}
              >
                {day && (
                  <Text style={getDayTextStyle(day)}>{day}</Text>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Time Selection */}
        <View style={styles.timeSection}>
          <Text style={styles.timeSectionTitle}>Select times</Text>

          <View style={styles.timeGroup}>
            <View style={styles.timeHeader}>
              <Ionicons name="log-in-outline" size={18} color={NAVY} />
              <Text style={styles.timeLabel}>Pickup</Text>
            </View>
            <View style={styles.timeOptions}>
              {TIME_SLOTS.map((time) => (
                <Pressable
                  key={time}
                  style={[styles.timeChip, pickupTime === time && styles.timeChipSelected]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setPickupTime(time);
                  }}
                >
                  <Text style={[styles.timeChipText, pickupTime === time && styles.timeChipTextSelected]}>
                    {time}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.timeGroup}>
            <View style={styles.timeHeader}>
              <Ionicons name="log-out-outline" size={18} color={NAVY} />
              <Text style={styles.timeLabel}>Return</Text>
            </View>
            <View style={styles.timeOptions}>
              {TIME_SLOTS.map((time) => (
                <Pressable
                  key={time}
                  style={[styles.timeChip, returnTime === time && styles.timeChipSelected]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setReturnTime(time);
                  }}
                >
                  <Text style={[styles.timeChipText, returnTime === time && styles.timeChipTextSelected]}>
                    {time}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          style={styles.resetButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setSelectedStart(null);
            setSelectedEnd(null);
            setPickupTime(defaultPickupTime || "10:00 am");
            setReturnTime(defaultReturnTime || "10:00 am");
          }}
        >
          <Ionicons name="close-circle-outline" size={18} color="#6B7280" />
          <Text style={styles.resetButtonText}>Reset</Text>
        </Pressable>
        <Pressable
          style={styles.primaryButton}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            handleAddTripDates();
          }}
        >
          <Text style={styles.primaryButtonText}>Confirm dates</Text>
          <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ visible: false, message: "", type: "success" })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: NAVY,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  summaryCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    gap: 4,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
  },
  summaryTime: {
    fontSize: 13,
    fontWeight: "600",
    color: ORANGE,
  },
  summaryArrow: {
    alignItems: "center",
    justifyContent: "center",
  },
  vehicleSelectorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20,
  },
  vehicleSelectorLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  vehicleScroll: {
    marginHorizontal: -4,
  },
  vehicleChip: {
    width: 140,
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
    marginHorizontal: 4,
  },
  vehicleChipSelected: {
    backgroundColor: "#EEF2FF",
    borderColor: NAVY,
  },
  vehicleChipImage: {
    width: "100%",
    height: 80,
  },
  vehicleChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: NAVY,
    padding: 10,
    textAlign: "center",
  },
  calendarCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  monthNavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  monthTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: NAVY,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  weekDaysRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekDayCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dayEmpty: {
    // empty cell
  },
  day: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  daySelected: {
    backgroundColor: ORANGE,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  dayInRange: {
    backgroundColor: "#EEF2FF",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: {
    fontSize: 14,
    fontWeight: "600",
    color: NAVY,
  },
  dayTextSelected: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  dayTextInRange: {
    fontSize: 14,
    fontWeight: "700",
    color: NAVY,
  },
  dayTextEmpty: {
    fontSize: 14,
    color: "transparent",
  },
  dayPast: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  dayTextPast: {
    fontSize: 14,
    fontWeight: "600",
    color: "#D1D5DB",
  },
  timeSection: {
    marginBottom: 24,
  },
  timeSectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
    marginBottom: 16,
  },
  timeGroup: {
    marginBottom: 16,
  },
  timeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  timeLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: NAVY,
  },
  timeOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  timeChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  timeChipSelected: {
    backgroundColor: ORANGE,
    borderColor: ORANGE,
  },
  timeChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: NAVY,
  },
  timeChipTextSelected: {
    color: "#FFFFFF",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  resetButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6B7280",
  },
  primaryButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: NAVY,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  bottomSpacer: {
    height: 40,
  },
  toast: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
});
