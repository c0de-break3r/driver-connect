import { useState, useMemo, useRef, useCallback } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable, Image, Platform } from "react-native";
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
import { useToast } from "@/hooks/useToast";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";

const NAVY = "#2C3E5B";
const ORANGE = "#F97316";

const TIME_SLOTS = ["10:00 am", "10:30 am", "11:00 am", "11:30 am", "12:00 pm", "12:30 pm", "1:00 pm", "1:30 pm"];
const WEEK_DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function TripDatesScreen() {
  const params = useLocalSearchParams();
  const collectionId = params.collectionId as string | undefined;
  const source = params.source as string | undefined;
  const vehicleId = params.vehicleId as string | undefined;

  const updateCollectionTripDates = useFavoritesStore((state) => state.updateCollectionTripDates);
  const setActiveTab = useHomeStore((state) => state.setActiveTab);

  const initialMonthIndex = 7;
  const initialYear = 2026;

  const [viewYear, setViewYear] = useState(initialYear);
  const [viewMonthIndex, setViewMonthIndex] = useState(initialMonthIndex);
  const [pickupTime, setPickupTime] = useState("10:00 am");
  const [returnTime, setReturnTime] = useState("10:00 am");
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const notificationIdRef = useRef(0);

  const defaultPickupDate = params.defaultPickupDate as string | undefined;
  const defaultReturnDate = params.defaultReturnDate as string | undefined;
  const defaultPickupTime = params.defaultPickupTime as string | undefined;
  const defaultReturnTime = params.defaultReturnTime as string | undefined;
  const vehicleTitle = params.vehicleTitle as string | undefined;

  const convexVehicles = useQuery(api.jobs.listVehicles, {});
  const vehicles = (convexVehicles ?? []).map((v: any) => ({ id: v._id, title: v.title, image: v.images?.[0] ?? "" }));

  if (defaultPickupDate && !selectedStart) setSelectedStart(defaultPickupDate);
  if (defaultReturnDate && !selectedEnd) setSelectedEnd(defaultReturnDate);
  if (defaultPickupTime) setPickupTime(defaultPickupTime);
  if (defaultReturnTime) setReturnTime(defaultReturnTime);

  const daysInMonth = useMemo(() => {
    const days: (number | null)[] = [];
    const firstDay = new Date(viewYear, viewMonthIndex, 1).getDay();
    const daysCount = new Date(viewYear, viewMonthIndex + 1, 0).getDate();
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysCount; i++) days.push(i);
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
    if (viewMonthIndex === 0) { setViewMonthIndex(11); setViewYear(viewYear - 1); }
    else setViewMonthIndex(viewMonthIndex - 1);
  };

  const handleNextMonth = () => {
    if (viewMonthIndex === 11) { setViewMonthIndex(0); setViewYear(viewYear + 1); }
    else setViewMonthIndex(viewMonthIndex + 1);
  };

  const handleAddTripDates = useCallback(() => {
    if (source === "driver") {
      const selectedVehicle = vehicles.find((v: any) => v.id === selectedVehicleId);
      setPendingVehicleTripDates({
        pickupDate: selectedStart ? formatDate(selectedStart) : defaultPickupDate || "Select date",
        returnDate: selectedEnd ? formatDate(selectedEnd) : defaultReturnDate || "Select date",
        pickupTime, returnTime, vehicleId: selectedVehicle?.id, vehicleTitle: selectedVehicle?.title,
      });
      showToast("Trip dates confirmed", "success");
      router.back();
      return;
    }

    if (source === "vehicle") {
      const selectedDriver = DRIVERS.find((d) => d.id === selectedDriverId);
      const pickupDateStr = selectedStart ? formatDate(selectedStart) : defaultPickupDate || "Select date";
      const returnDateStr = selectedEnd ? formatDate(selectedEnd) : defaultReturnDate || "Select date";
      setPendingVehicleTripDates({ pickupDate: pickupDateStr, returnDate: returnDateStr, pickupTime, returnTime, driverId: selectedDriver?.id, driverName: selectedDriver?.name });
      if (selectedDriver) {
        addDriverAssignment({ driverId: selectedDriver.id, driverName: selectedDriver.name, vehicleTitle: vehicleTitle || "Vehicle booking", pickupDate: pickupDateStr, returnDate: returnDateStr, pickupTime, returnTime });
        notificationIdRef.current += 1;
        const notificationId = `booking-${notificationIdRef.current}-${Date.now()}`;
        useNotificationStore.getState().addNotification({ id: notificationId, title: "New Booking Request", body: `${selectedDriver.name}, you have a new booking request for ${vehicleTitle || "a vehicle"} on ${pickupDateStr}.`, receivedAt: Date.now() });
      }
      showToast("Trip dates confirmed", "success");
      router.back();
      return;
    }

    if (!collectionId) { showToast("We couldn't find this list. Please try again.", "error"); return; }
    if (!selectedStart || !selectedEnd) { showToast("Please choose both pickup and return dates to continue.", "warning"); return; }

    updateCollectionTripDates(collectionId, { startDate: selectedStart, endDate: selectedEnd, startTime: pickupTime, endTime: returnTime });
    const pickupDateStr = selectedStart ? formatDate(selectedStart) : defaultPickupDate || "Select date";
    const returnDateStr = selectedEnd ? formatDate(selectedEnd) : defaultReturnDate || "Select date";

    if (vehicleId) {
      setPendingVehicleTripDates({ pickupDate: pickupDateStr, returnDate: returnDateStr, pickupTime, returnTime, vehicleId, vehicleTitle: vehicleTitle || "Vehicle booking" });
      showToast("Trip dates confirmed", "success");
      router.push(`/vehicle-details?id=${vehicleId}`);
      return;
    }

    showToast("Trip dates confirmed", "success");
    setActiveTab("favorites");
    router.replace(`/favorites/collection/${collectionId}`);
  }, [source, vehicles, selectedVehicleId, selectedStart, selectedEnd, defaultPickupDate, defaultReturnDate, pickupTime, returnTime, selectedDriverId, vehicleTitle, collectionId, vehicleId, updateCollectionTripDates, showToast, setActiveTab]);

  const handleDayPress = (day: number | null) => {
    if (!day) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const clickedISO = toISODate(day);
    if (!selectedStart || (selectedStart !== null && selectedEnd !== null)) { setSelectedStart(clickedISO); setSelectedEnd(null); }
    else if (clickedISO < selectedStart) { setSelectedEnd(selectedStart); setSelectedStart(clickedISO); }
    else if (clickedISO === selectedStart) setSelectedEnd(clickedISO);
    else setSelectedEnd(clickedISO);
  };

  const isDaySelected = (day: number | null) => { if (!day) return false; const iso = toISODate(day); return iso === selectedStart || iso === selectedEnd; };
  const isDayInRange = (day: number | null) => { if (!day || !selectedStart || !selectedEnd) return false; const iso = toISODate(day); return iso > selectedStart && iso < selectedEnd; };
  const isDayPast = (day: number | null) => { if (!day) return false; const iso = toISODate(day); return iso < new Date().toISOString().split("T")[0]; };

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

  const { toast, showToast, hideToast } = useToast();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button variant="ghost" size="icon" onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200">
          <Ionicons name="arrow-back" size={22} color={NAVY} />
        </Button>
        <Text className="text-lg font-extrabold text-center flex-1" style={{ color: NAVY, letterSpacing: -0.3 }}>Trip dates</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card className="bg-gray-50 border-gray-200 mb-5">
          <View className="flex-row items-center justify-between gap-3">
            <View className="flex-1">
              <Text className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Pickup</Text>
              <Text className="text-sm font-bold" style={{ color: NAVY }}>{selectedStart ? formatDate(selectedStart) : "Select date"}</Text>
              <Text className="text-xs font-bold text-orange-500">{pickupTime}</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#9CA3AF" />
            <View className="flex-1">
              <Text className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Return</Text>
              <Text className="text-sm font-bold" style={{ color: NAVY }}>{selectedEnd ? formatDate(selectedEnd) : (selectedStart ? "Tap to select return" : "Select date")}</Text>
              <Text className="text-xs font-bold text-orange-500">{returnTime}</Text>
            </View>
          </View>
        </Card>

        {source === "driver" && (
          <Card className="bg-white border-gray-200 mb-5">
            <Text className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Assign to vehicle</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vehicleScroll}>
              {vehicles.map((vehicle: any) => (
                <Pressable
                  key={vehicle.id}
                  style={[styles.vehicleChip, selectedVehicleId === vehicle.id && styles.vehicleChipSelected]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedVehicleId(vehicle.id); }}
                >
                  <Image source={{ uri: vehicle.image || "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=200&q=80" }} style={styles.vehicleChipImage} resizeMode="cover" />
                  <Text className="text-xs font-bold text-center px-2.5 py-2" style={{ color: NAVY }} numberOfLines={1}>{vehicle.title}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </Card>
        )}

        {source === "vehicle" && (
          <Card className="bg-white border-gray-200 mb-5">
            <Text className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Assign a driver</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vehicleScroll}>
              {DRIVERS.map((driver) => (
                <Pressable
                  key={driver.id}
                  style={[styles.vehicleChip, selectedDriverId === driver.id && styles.vehicleChipSelected]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedDriverId(driver.id); }}
                >
                  <Image source={{ uri: driver.image }} style={styles.vehicleChipImage} resizeMode="cover" />
                  <Text className="text-xs font-bold text-center px-2.5 py-2" style={{ color: NAVY }} numberOfLines={1}>{driver.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </Card>
        )}

        <Card className="bg-white border-gray-200 mb-5">
          <View className="flex-row items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onPress={handlePrevMonth} className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200">
              <Ionicons name="chevron-back" size={20} color="#9CA3AF" />
            </Button>
            <Text className="text-base font-extrabold" style={{ color: NAVY, letterSpacing: -0.3 }}>{MONTH_NAMES[viewMonthIndex]} {viewYear}</Text>
            <Button variant="ghost" size="icon" onPress={handleNextMonth} className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200">
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Button>
          </View>

          <View className="flex-row mb-2">
            {WEEK_DAYS.map((day, index) => (
              <View key={index} className="flex-1 items-center py-2">
                <Text className="text-xs font-bold text-gray-500">{day}</Text>
              </View>
            ))}
          </View>

          <View className="flex-row flex-wrap">
            {daysInMonth.map((day, index) => (
              <Pressable
                key={index}
                style={[styles.dayCell, getDayStyle(day)]}
                onPress={() => handleDayPress(day)}
                disabled={!day || isDayPast(day)}
              >
                {day && <Text style={getDayTextStyle(day)}>{day}</Text>}
              </Pressable>
            ))}
          </View>
        </Card>

        <View style={styles.timeSection}>
          <Text className="text-sm font-bold mb-4" style={{ color: NAVY }}>Select times</Text>

          <View className="mb-5">
            <View className="flex-row items-center gap-2 mb-3">
              <Ionicons name="log-in-outline" size={18} color={NAVY} />
              <Text className="text-xs font-bold" style={{ color: NAVY }}>Pickup</Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {TIME_SLOTS.map((time) => (
                <Chip
                  key={time}
                  selected={pickupTime === time}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPickupTime(time); }}
                  variant="outline"
                  size="md"
                >
                  <Text className="text-xs font-semibold">{time}</Text>
                </Chip>
              ))}
            </View>
          </View>

          <View>
            <View className="flex-row items-center gap-2 mb-3">
              <Ionicons name="log-out-outline" size={18} color={NAVY} />
              <Text className="text-xs font-bold" style={{ color: NAVY }}>Return</Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {TIME_SLOTS.map((time) => (
                <Chip
                  key={time}
                  selected={returnTime === time}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setReturnTime(time); }}
                  variant="outline"
                  size="md"
                >
                  <Text className="text-xs font-semibold">{time}</Text>
                </Chip>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.actions}>
        <Button variant="outline" onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedStart(null); setSelectedEnd(null); setPickupTime(defaultPickupTime || "10:00 am"); setReturnTime(defaultReturnTime || "10:00 am"); }} className="flex-1 rounded-xl py-4 border-gray-200 flex-row items-center justify-center gap-2">
          <Ionicons name="close-circle-outline" size={18} color="#6B7280" />
          <Text className="text-sm font-bold text-gray-600">Reset</Text>
        </Button>
        <Button onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); handleAddTripDates(); }} className="flex-[2] rounded-xl py-4 flex-row items-center justify-center gap-2">
          <Text className="text-sm font-bold text-white">Confirm dates</Text>
          <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
        </Button>
      </View>

      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 48, paddingBottom: 16 },
  headerRight: { width: 40 },
  content: { flex: 1, paddingHorizontal: 20 },
  vehicleScroll: { marginHorizontal: -4 },
  vehicleChip: { width: 140, backgroundColor: "#F9FAFB", borderRadius: 14, borderWidth: 1, borderColor: "#E5E7EB", overflow: "hidden", marginHorizontal: 4 },
  vehicleChipSelected: { backgroundColor: "#EEF2FF", borderColor: NAVY },
  vehicleChipImage: { width: "100%", height: 80 },
  dayCell: { width: "14.28%", aspectRatio: 1, alignItems: "center", justifyContent: "center" },
  dayEmpty: {},
  day: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  daySelected: { backgroundColor: ORANGE, borderRadius: 20, width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  dayInRange: { backgroundColor: "#EEF2FF", borderRadius: 20, width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  dayText: { fontSize: 14, fontWeight: "600", color: NAVY },
  dayTextSelected: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
  dayTextInRange: { fontSize: 14, fontWeight: "700", color: NAVY },
  dayTextEmpty: { fontSize: 14, color: "transparent" },
  dayPast: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  dayTextPast: { fontSize: 14, fontWeight: "600", color: "#D1D5DB" },
  timeSection: { marginBottom: 24 },
  bottomSpacer: { height: 40 },
  actions: { flexDirection: "row", gap: 12, paddingHorizontal: 20, paddingVertical: 16, backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: "#E5E7EB" },
});
