import { useState, useCallback } from "react";
import { ScrollView, StyleSheet, Text, View, TextInput, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Rating } from "@/components/ui/rating";
import { Separator } from "@/components/ui/separator";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import { DRIVERS } from "@/data/drivers";
import CalendarSheet from "@/components/CalendarSheet";
import TimePickerSheet from "@/components/TimePickerSheet";
import * as Haptics from "expo-haptics";
import { useLocationPickerStore } from "@/store/useLocationPickerStore";

const NAVY = "#2C3E5B";

const DURATIONS = ["1 hour", "2 hours", "4 hours", "6 hours", "8 hours", "Full day", "Weekend", "Weekly"];
const PASSENGER_COUNTS = ["1", "2", "3", "4", "5", "6+"];
const OCCASIONS = ["Airport transfer", "Daily commute", "Wedding", "Event", "Business trip", "City tour", "Moving/Errands", "Other"];

const SAMPLE_LOCATIONS = [
  "Accra Mall, Accra", "Kotoka International Airport, Accra", "Labadi Beach, Accra",
  "Kwame Nkrumah Circle, Accra", "Makola Market, Accra", "East Legon, Accra",
  "Osu, Accra", "Madina, Accra", "Kumasi Central Market, Kumasi",
  "KNUST Campus, Kumasi", "Lake Bosumtwi, Kumasi", "Takoradi Market Circle, Sekondi-Takoradi",
];

const LOCATIONS_BY_REGION: Record<string, string[]> = {
  "Accra": ["Accra Mall, Accra", "Kotoka International Airport, Accra", "Labadi Beach, Accra", "Kwame Nkrumah Circle, Accra", "Makola Market, Accra", "East Legon, Accra", "Osu, Accra", "Madina, Accra"],
  "Kumasi": ["Kumasi Central Market, Kumasi", "KNUST Campus, Kumasi", "Lake Bosumtwi, Kumasi"],
  "Sekondi-Takoradi": ["Takoradi Market Circle, Sekondi-Takoradi"],
};

let LocationModule: any;
try { LocationModule = require("expo-location"); } catch { /* location module unavailable */ }

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <View className="flex-row items-center gap-2.5 mb-3">
      <Ionicons name={icon as any} size={20} color={NAVY} />
      <Text className="text-base font-bold" style={{ color: NAVY }}>{title}</Text>
    </View>
  );
}

export default function BookNowScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const vehicleId = typeof params.vehicleId === "string" ? params.vehicleId : undefined;
  const driverId = typeof params.driverId === "string" ? params.driverId : undefined;
  const driver = driverId ? DRIVERS.find((d) => d.id === driverId) : null;
  const title = driver ? "Hire" : "Book";

  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [pickupStartTime, setPickupStartTime] = useState("");
  const [pickupEndTime, setPickupEndTime] = useState("");
  const [duration, setDuration] = useState<string | null>(null);
  const [passengers, setPassengers] = useState<string | null>(null);
  const [occasion, setOccasion] = useState<string | null>(null);
  const [pickupLocation, setPickupLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [note, setNote] = useState("");
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [locationMode, setLocationMode] = useState<"pickup" | "destination" | null>(null);
  const [userRegion, setUserRegion] = useState<string | null>(null);
  const toast = useToast();
  const selectedLocation = useLocationPickerStore((state) => state.selectedLocation);
  const selectedMode = useLocationPickerStore((state) => state.selectedMode);
  const clearLocationSelection = useLocationPickerStore((state) => state.clearSelection);

  useFocusEffect(
    useCallback(() => {
      if (selectedLocation && selectedMode) {
        if (selectedMode === "pickup") setPickupLocation(selectedLocation);
        else if (selectedMode === "destination") setDestination(selectedLocation);
        clearLocationSelection();
      }
    }, [selectedLocation, selectedMode, clearLocationSelection])
  );

  const requestLocation = async () => {
    if (!LocationModule) { toast.showToast("Location service unavailable on this device", "warning"); return; }
    try {
      const { status } = await LocationModule.requestForegroundPermissionsAsync();
      if (status !== "granted") { toast.showToast("Location permission denied", "warning"); return; }
      const position = await LocationModule.getCurrentPositionAsync({ accuracy: LocationModule.Accuracy.Balanced });
      const reverseGeocode = await LocationModule.reverseGeocodeAsync({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const formatted = [address.street, address.name, address.district, address.city].filter(Boolean).join(", ");
        setPickupLocation(formatted);
        if (address.city) setUserRegion(address.city.split(",")[0].trim());
        toast.showToast("Location detected", "success");
      }
    } catch { toast.showToast("Unable to get location", "warning"); }
  };

  const handleSelectLocation = (location: string) => {
    if (locationMode === "pickup") setPickupLocation(location);
    else if (locationMode === "destination") setDestination(location);
    setLocationMode(null);
  };

  const handleConfirm = () => {
    if (!pickupDate.trim()) { toast.showToast("Please select a pickup date", "warning"); return; }
    if (!pickupTime.trim()) { toast.showToast("Please select a pickup time", "warning"); return; }
    if (!pickupLocation.trim() || !destination.trim()) { toast.showToast("Please enter pickup and destination", "warning"); return; }
    toast.showToast("Booking request sent!", "success");
    router.back();
  };

  const getFilteredLocations = (mode: "pickup" | "destination") => {
    if (mode === "destination") return SAMPLE_LOCATIONS;
    if (userRegion && LOCATIONS_BY_REGION[userRegion]) return LOCATIONS_BY_REGION[userRegion];
    return SAMPLE_LOCATIONS;
  };

  const today = new Date();
  const sampleUnavailableRanges = [{ start: new Date(today.getFullYear(), today.getMonth(), 5), end: new Date(today.getFullYear(), today.getMonth(), 7), reason: "Driver/vehicle is under repair" }];
  const sampleBookedRanges = [{ start: new Date(today.getFullYear(), today.getMonth(), 21), end: new Date(today.getFullYear(), today.getMonth(), 30), reason: "Already booked by another user" }];
  const sampleUserBookedRanges: Array<{ start: Date; end: Date }> = [];

  const handleCalendarConfirm = () => {
    setShowCalendar(false);
    if (selectedStartDate && selectedEndDate) {
      const startFormatted = selectedStartDate.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
      const endFormatted = selectedEndDate.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
      setPickupDate(`${startFormatted} - ${endFormatted}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between mt-2.5 mb-8">
          <Button variant="ghost" size="icon" onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200">
            <Ionicons name="arrow-back" size={24} color={NAVY} />
          </Button>
          <Text className="text-xl font-extrabold" style={{ color: NAVY }}>{title}</Text>
          <View className="w-10" />
        </View>

        <View className="mb-7">
          <SectionHeader icon="calendar-outline" title="Date" />
          <Button variant="outline" onPress={() => setShowCalendar(true)} className="h-12 px-4 flex-row items-center justify-between rounded-xl border-gray-200 bg-gray-50">
            <Text className={`text-sm font-semibold flex-1 ${!pickupDate ? "text-gray-400" : ""}`} style={{ color: !pickupDate ? undefined : NAVY }}>
              {pickupDate || "Select date"}
            </Text>
            <Ionicons name="calendar" size={20} color={NAVY} />
          </Button>
        </View>

        <View className="mb-7">
          <SectionHeader icon="time-outline" title="Time" />
          <Button variant="outline" onPress={() => setShowTimePicker(true)} className="h-12 px-4 flex-row items-center justify-between rounded-xl border-gray-200 bg-gray-50">
            <Text className={`text-sm font-semibold flex-1 ${!pickupTime ? "text-gray-400" : ""}`} style={{ color: !pickupTime ? undefined : NAVY }}>
              {pickupTime || "Select time"}
            </Text>
            <Ionicons name="time" size={20} color={NAVY} />
          </Button>
        </View>

        {driver && (
          <Card className="mb-2 bg-gray-50 border-gray-200">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-base font-bold" style={{ color: NAVY }}>{driver.name}</Text>
              <Badge variant="secondary" className="flex-row items-center gap-1 bg-amber-50 border-amber-200">
                <Ionicons name="star" size={14} color="#B45309" />
                <Text className="text-xs font-bold text-amber-700">{driver.rating}</Text>
              </Badge>
            </View>
            <View className="flex-row items-center justify-between py-1.5">
              <Text className="text-sm font-medium text-gray-500">Rate</Text>
              <Text className="text-sm font-semibold" style={{ color: NAVY }}>{driver.hourlyRate}/hr</Text>
            </View>
            <View className="flex-row items-center justify-between py-1.5">
              <Text className="text-sm font-medium text-gray-500">Experience</Text>
              <Text className="text-sm font-semibold" style={{ color: NAVY }}>{driver.yearsOnPlatform}</Text>
            </View>
            <View className="flex-row items-center justify-between py-1.5">
              <Text className="text-sm font-medium text-gray-500">Vehicle</Text>
              <Text className="text-sm font-semibold" style={{ color: NAVY }}>{driver.vehicleType}</Text>
            </View>
            <View className="flex-row items-center justify-between py-1.5">
              <Text className="text-sm font-medium text-gray-500">Languages</Text>
              <Text className="text-sm font-semibold" style={{ color: NAVY }}>{driver.languages}</Text>
            </View>
          </Card>
        )}

        <View className="mb-7">
          <SectionHeader icon="hourglass-outline" title="Duration" />
            <View className="flex-row flex-wrap gap-2.5">
            {DURATIONS.map((d) => (
              <Chip key={d} selected={duration === d} onPress={() => setDuration(d)} variant="outline" size="md">
                <Text className="text-sm font-semibold">{d}</Text>
              </Chip>
            ))}
          </View>
        </View>

        <View className="mb-7">
          <SectionHeader icon="people-outline" title="Passengers" />
            <View className="flex-row flex-wrap gap-2.5">
            {PASSENGER_COUNTS.map((count) => (
              <Chip key={count} selected={passengers === count} onPress={() => setPassengers(count)} variant="outline" size="md" className="min-w-[52px] items-center justify-center">
                <Text className="text-sm font-semibold">{count}</Text>
              </Chip>
            ))}
          </View>
        </View>

        <View className="mb-7">
          <SectionHeader icon="car-outline" title="Trip type" />
            <View className="flex-row flex-wrap gap-2.5">
            {OCCASIONS.map((occ) => (
              <Chip key={occ} selected={occasion === occ} onPress={() => setOccasion(occ)} variant="outline" size="md">
                <Text className={`text-sm font-semibold ${occasion === occ ? "text-white" : "text-gray-600"}`}>{occ}</Text>
              </Chip>
            ))}
          </View>
        </View>

        <View className="mb-7">
          <SectionHeader icon="location-outline" title="Locations" />
          <View className="gap-3">
            <Button variant="outline" onPress={() => { setLocationMode("pickup"); router.push(`/(client)/location-picker?mode=pickup&userRegion=${encodeURIComponent(userRegion || "")}`); }} className="h-12 px-4 flex-row items-center gap-3 rounded-xl border-gray-200 bg-gray-50">
              <View className="w-7 h-7 rounded-full bg-gray-200 items-center justify-center border border-gray-300">
                <Ionicons name="location" size={16} color={NAVY} />
              </View>
              <Text className={`flex-1 text-sm font-semibold ${!pickupLocation ? "text-gray-400" : ""}`} style={{ color: !pickupLocation ? undefined : NAVY }}>
                {pickupLocation || "Select pickup location"}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </Button>
            <Button variant="outline" onPress={() => { setLocationMode("destination"); router.push("/(client)/location-picker?mode=destination"); }} className="h-12 px-4 flex-row items-center gap-3 rounded-xl border-gray-200 bg-gray-50">
              <View className="w-7 h-7 rounded-full bg-gray-200 items-center justify-center border border-gray-300">
                <Ionicons name="location" size={16} color="#EF4444" />
              </View>
              <Text className={`flex-1 text-sm font-semibold ${!destination ? "text-gray-400" : ""}`} style={{ color: !destination ? undefined : NAVY }}>
                {destination || "Select destination"}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </Button>
          </View>
        </View>

        <View className="mb-7">
          <Text className="text-base font-bold mb-3" style={{ color: NAVY }}>Special requests</Text>
          <TextInput
            placeholder="Child seat, extra luggage, wheelchair, etc."
            placeholderTextColor="#9CA3AF"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-base flex-1 text-gray-800"
          />
        </View>

        <Button onPress={handleConfirm} className="rounded-xl py-4 mt-2">
          <Text className="text-base font-bold text-white">Confirm booking</Text>
        </Button>

        <Text className="text-xs font-medium text-gray-500 text-center mt-4">
          You won&apos;t be charged now. Free cancellation up to 2 hours before pickup.
        </Text>
      </ScrollView>
      <CalendarSheet
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        onSelectStart={(date) => setSelectedStartDate(date)}
        onSelectEnd={(date) => setSelectedEndDate(date)}
        selectedStart={selectedStartDate}
        selectedEnd={selectedEndDate}
        minDate={new Date()}
        unavailableRanges={sampleUnavailableRanges}
        bookedRanges={sampleBookedRanges}
        userBookedRanges={sampleUserBookedRanges}
        onConfirm={handleCalendarConfirm}
      />
      <TimePickerSheet
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        onConfirm={(startTime, endTime) => {
          setPickupStartTime(startTime);
          setPickupEndTime(endTime);
          setPickupTime(`${startTime} - ${endTime}`);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        selectedStartTime={pickupStartTime}
        selectedEndTime={pickupEndTime}
      />
      <Toast visible={toast.toast.visible} message={toast.toast.message} type={toast.toast.type} onHide={toast.hideToast} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { paddingHorizontal: 20, paddingBottom: 48 },
});
