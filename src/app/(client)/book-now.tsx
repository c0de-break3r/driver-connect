import { useState } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import { DRIVERS } from "@/data/drivers";

const NAVY = "#2C3E5B";

const DURATIONS = ["1 hour", "2 hours", "4 hours", "6 hours", "8 hours", "Full day", "Weekend", "Weekly"];

const PASSENGER_COUNTS = ["1", "2", "3", "4", "5", "6+"];

const OCCASIONS = ["Airport transfer", "Daily commute", "Wedding", "Event", "Business trip", "City tour", "Moving/Errands", "Other"];

const SAMPLE_LOCATIONS = [
  "Accra Mall, Accra",
  "Kotoka International Airport, Accra",
  "Labadi Beach, Accra",
  "Kwame Nkrumah Circle, Accra",
  "Makola Market, Accra",
  "East Legon, Accra",
  "Osu, Accra",
  "Madina, Accra",
  "Kumasi Central Market, Kumasi",
  "KNUST Campus, Kumasi",
  "Lake Bosumtwi, Kumasi",
  "Takoradi Market Circle, Sekondi-Takoradi",
];

let LocationModule: any;
try {
  LocationModule = require("expo-location");
} catch {
  // location module unavailable
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
  const [duration, setDuration] = useState<string | null>(null);
  const [passengers, setPassengers] = useState<string | null>(null);
  const [occasion, setOccasion] = useState<string | null>(null);
  const [pickupLocation, setPickupLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [note, setNote] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const toast = useToast();

  const requestLocation = async () => {
    if (!LocationModule) {
      toast.showToast("Location service unavailable on this device", "warning");
      return;
    }

    try {
      const { status } = await LocationModule.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        toast.showToast("Location permission denied", "warning");
        return;
      }

      const position = await LocationModule.getCurrentPositionAsync({
        accuracy: LocationModule.Accuracy.Balanced,
      });

      const reverseGeocode = await LocationModule.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const formatted = [
          address.street,
          address.name,
          address.district,
          address.city,
        ].filter(Boolean).join(", ");

        setPickupLocation(formatted);
        setLocationQuery(formatted);
        toast.showToast("Location detected", "success");
      }
    } catch {
      toast.showToast("Unable to get location", "warning");
    }
  };

  const handleLocationSearch = (text: string) => {
    setLocationQuery(text);
    if (text.trim().length > 0) {
      const filtered = SAMPLE_LOCATIONS.filter((loc) =>
        loc.toLowerCase().includes(text.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (location: string) => {
    setPickupLocation(location);
    setLocationQuery(location);
    setSuggestions([]);
  };

  const handleConfirm = () => {
    if (!pickupDate.trim()) {
      toast.showToast("Please select a pickup date", "warning");
      return;
    }
    if (!pickupTime.trim()) {
      toast.showToast("Please select a pickup time", "warning");
      return;
    }
    if (!pickupLocation.trim() || !destination.trim()) {
      toast.showToast("Please enter pickup and destination", "warning");
      return;
    }
    toast.showToast("Booking request sent!", "success");
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={NAVY} />
          </Pressable>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar-outline" size={20} color={NAVY} />
            <Text style={styles.sectionTitle}>Pickup date</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="e.g. Sat, 26 Sep"
            placeholderTextColor="#9CA3AF"
            value={pickupDate}
            onChangeText={setPickupDate}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time-outline" size={20} color={NAVY} />
            <Text style={styles.sectionTitle}>Pickup time</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="e.g. 10:00 AM"
            placeholderTextColor="#9CA3AF"
            value={pickupTime}
            onChangeText={setPickupTime}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="hourglass-outline" size={20} color={NAVY} />
            <Text style={styles.sectionTitle}>Duration</Text>
          </View>
          <View style={styles.chipsRow}>
            {DURATIONS.map((d) => {
              const isSelected = duration === d;
              return (
                <Pressable
                  key={d}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => setDuration(d)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{d}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people-outline" size={20} color={NAVY} />
            <Text style={styles.sectionTitle}>Passengers</Text>
          </View>
          <View style={styles.chipsRow}>
            {PASSENGER_COUNTS.map((count) => {
              const isSelected = passengers === count;
              return (
                <Pressable
                  key={count}
                  style={[styles.chip, styles.countChip, isSelected && styles.chipSelected]}
                  onPress={() => setPassengers(count)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{count}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="car-outline" size={20} color={NAVY} />
            <Text style={styles.sectionTitle}>Trip type</Text>
          </View>
          <View style={styles.chipsRow}>
            {OCCASIONS.map((occ) => {
              const isSelected = occasion === occ;
              return (
                <Pressable
                  key={occ}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => setOccasion(occ)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{occ}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={20} color={NAVY} />
            <Text style={styles.sectionTitle}>Locations</Text>
          </View>
          <View style={styles.locationSearchWrap}>
            <View style={styles.locationField}>
              <View style={styles.locationIconWrap}>
                <Ionicons name="location" size={18} color={NAVY} />
              </View>
              <TextInput
                style={styles.locationInput}
                placeholder="Search pickup location"
                placeholderTextColor="#9CA3AF"
                value={locationQuery}
                onChangeText={handleLocationSearch}
              />
              <Pressable onPress={requestLocation} style={styles.gpsButton}>
                <Ionicons name="navigate" size={18} color={NAVY} />
              </Pressable>
            </View>
            {suggestions.length > 0 && (
              <View style={styles.suggestionsList}>
                {suggestions.slice(0, 5).map((location) => (
                  <Pressable
                    key={location}
                    style={styles.suggestionItem}
                    onPress={() => selectSuggestion(location)}
                  >
                    <Ionicons name="location-outline" size={16} color="#6B7280" />
                    <Text style={styles.suggestionText}>{location}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
          <View style={styles.locationField}>
            <View style={styles.locationIconWrap}>
              <Ionicons name="location" size={18} color="#EF4444" />
            </View>
            <TextInput
              style={styles.locationInput}
              placeholder="Destination"
              placeholderTextColor="#9CA3AF"
              value={destination}
              onChangeText={setDestination}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special requests</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Child seat, extra luggage, wheelchair, etc."
            placeholderTextColor="#9CA3AF"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <Pressable style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirm booking</Text>
        </Pressable>

        <Text style={styles.disclaimer}>
          You won't be charged now. Free cancellation up to 2 hours before pickup.
        </Text>
      </ScrollView>
      <Toast visible={toast.toast.visible} message={toast.toast.message} type={toast.toast.type} onHide={toast.hideToast} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 32,
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
  },
  headerRight: {
    width: 40,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: NAVY,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: "600",
    color: NAVY,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  countChip: {
    minWidth: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  chipSelected: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  chipTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  locationSearchWrap: {
    position: "relative",
    marginBottom: 12,
  },
  locationField: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  locationIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  locationInput: {
    flex: 1,
    fontSize: 15,
    color: NAVY,
    paddingVertical: 0,
  },
  gpsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  suggestionsList: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 4,
    zIndex: 10,
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: "500",
    color: NAVY,
  },
  textArea: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    fontWeight: "500",
    color: NAVY,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    textAlignVertical: "top",
    minHeight: 100,
  },
  confirmButton: {
    backgroundColor: NAVY,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  disclaimer: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
    marginTop: 16,
  },
});
