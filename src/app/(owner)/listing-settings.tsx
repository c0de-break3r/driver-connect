import { useLocalSearchParams, useRouter } from "expo-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/lib/convexApi";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";

const NAVY = "#2C3E5B";
const GREEN = "#10B981";
const RED = "#EF4444";
const BG = "#F9FAFB";
const BORDER = "#E5E7EB";

export default function ListingSettingsScreen() {
  const router = useRouter();
  const { vehicleId } = useLocalSearchParams<{ vehicleId: string }>();

  const vehicle = useQuery(
    api.jobs.getVehicle,
    vehicleId ? { id: vehicleId as any } : "skip"
  );

  const updateSettings = useMutation(api.jobs.updateVehicleSettings);
  const [saving, setSaving] = useState(false);

  const [instantBook, setInstantBook] = useState(false);
  const [advanceNotice, setAdvanceNotice] = useState("24");
  const [minTripDuration, setMinTripDuration] = useState("1");
  const [maxTripDuration, setMaxTripDuration] = useState("30");
  const [distanceLimit, setDistanceLimit] = useState("200");
  const [unlimitedDistance, setUnlimitedDistance] = useState(false);
  const [pickupStartHour, setPickupStartHour] = useState("0");
  const [pickupEndHour, setPickupEndHour] = useState("23");

  useEffect(() => {
    if (vehicle) {
      setInstantBook(vehicle.instantBook ?? false);
      setAdvanceNotice(String(vehicle.advanceNotice ?? 24));
      setMinTripDuration(String(vehicle.minTripDuration ?? 1));
      setMaxTripDuration(String(vehicle.maxTripDuration ?? 30));
      setDistanceLimit(String(vehicle.distanceLimit ?? 200));
      setUnlimitedDistance(vehicle.unlimitedDistance ?? false);
      setPickupStartHour(String(vehicle.pickupStartHour ?? 0));
      setPickupEndHour(String(vehicle.pickupEndHour ?? 23));
    }
  }, [vehicle]);

  const handleSave = async () => {
    if (!vehicleId) return;
    setSaving(true);
    try {
      await updateSettings({
        vehicleId: vehicleId as any,
        instantBook,
        advanceNotice: Number(advanceNotice),
        minTripDuration: Number(minTripDuration),
        maxTripDuration: Number(maxTripDuration),
        distanceLimit: Number(distanceLimit),
        unlimitedDistance,
        pickupStartHour: Number(pickupStartHour),
        pickupEndHour: Number(pickupEndHour),
      });
      router.back();
    } catch {
      Alert.alert("Error", "Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!vehicleId) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No vehicle selected.</Text>
      </View>
    );
  }

  if (!vehicle) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={NAVY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Listing Settings</Text>
          <View style={{ width: 22 }} />
        </View>

        <Text style={styles.sectionTitle}>Booking Preferences</Text>

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={styles.labelWrap}>
              <Text style={styles.label}>Instant Book</Text>
              <Text style={styles.hint}>Allow guests to book without approval</Text>
            </View>
            <ToggleSwitch value={instantBook} onValueChange={setInstantBook} />
          </View>

          <View style={styles.divider} />

          <Text style={styles.fieldLabel}>Advance Notice (hours)</Text>
          <Text style={styles.hint}>Minimum hours before pickup</Text>
          <TextInput
            style={styles.input}
            value={advanceNotice}
            onChangeText={setAdvanceNotice}
            keyboardType="number-pad"
            placeholder="24"
            placeholderTextColor="#9CA3AF"
          />

          <View style={styles.divider} />

          <View style={styles.rowTwoCol}>
            <View style={styles.col}>
              <Text style={styles.fieldLabel}>Min Trip (days)</Text>
              <TextInput
                style={styles.input}
                value={minTripDuration}
                onChangeText={setMinTripDuration}
                keyboardType="number-pad"
                placeholder="1"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.fieldLabel}>Max Trip (days)</Text>
              <TextInput
                style={styles.input}
                value={maxTripDuration}
                onChangeText={setMaxTripDuration}
                keyboardType="number-pad"
                placeholder="30"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Distance & Pickup</Text>

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={styles.labelWrap}>
              <Text style={styles.label}>Unlimited Distance</Text>
              <Text style={styles.hint}>Remove daily mileage limit</Text>
            </View>
            <ToggleSwitch value={unlimitedDistance} onValueChange={setUnlimitedDistance} />
          </View>

          {!unlimitedDistance && (
            <>
              <View style={styles.divider} />
              <Text style={styles.fieldLabel}>Distance Limit (miles/day)</Text>
              <TextInput
                style={styles.input}
                value={distanceLimit}
                onChangeText={setDistanceLimit}
                keyboardType="number-pad"
                placeholder="200"
                placeholderTextColor="#9CA3AF"
              />
            </>
          )}

          <View style={styles.divider} />

          <View style={styles.rowTwoCol}>
            <View style={styles.col}>
              <Text style={styles.fieldLabel}>Pickup Start Hour</Text>
              <TextInput
                style={styles.input}
                value={pickupStartHour}
                onChangeText={setPickupStartHour}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.fieldLabel}>Pickup End Hour</Text>
              <TextInput
                style={styles.input}
                value={pickupEndHour}
                onChangeText={setPickupEndHour}
                keyboardType="number-pad"
                placeholder="23"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>{saving ? "Saving..." : "Save Settings"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function ToggleSwitch({
  value,
  onValueChange,
}: {
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.toggleTrack, value && styles.toggleTrackActive]}
      onPress={() => onValueChange(!value)}
      activeOpacity={0.8}
    >
      <View style={[styles.toggleThumb, value && styles.toggleThumbActive]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#6B7280",
  },
  errorText: {
    fontSize: 15,
    fontWeight: "600",
    color: RED,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 48,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: NAVY,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 8,
  },
  card: {
    backgroundColor: BG,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 8,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  labelWrap: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  hint: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 14,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
  },
  rowTwoCol: {
    flexDirection: "row",
    gap: 12,
  },
  col: {
    flex: 1,
  },
  toggleTrack: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#D1D5DB",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  toggleTrackActive: {
    backgroundColor: GREEN,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    alignSelf: "flex-end",
  },
  saveButton: {
    backgroundColor: NAVY,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
