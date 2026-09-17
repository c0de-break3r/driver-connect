import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/contexts/AuthProvider";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/lib/convexApi";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const NAVY = "#2C3E5B";

type ChangeType = "extend" | "shorten" | "change_pickup" | "change_dropoff" | "add_driver";

const CHANGE_OPTIONS: { type: ChangeType; label: string; description: string }[] = [
  { type: "extend", label: "Extend trip", description: "Add more days to this booking" },
  { type: "shorten", label: "Shorten trip", description: "Reduce the booking duration" },
  { type: "change_pickup", label: "Change pickup location", description: "Update where the vehicle is picked up" },
  { type: "change_dropoff", label: "Change dropoff location", description: "Update where the vehicle is returned" },
  { type: "add_driver", label: "Add additional driver", description: "Add another driver to this booking" },
];

export default function TripChangeRequestScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const params = useLocalSearchParams<{ bookingId: string }>();
  const bookingId = params.bookingId;

  const [selectedType, setSelectedType] = useState<ChangeType | null>(null);
  const [requestedEndDate, setRequestedEndDate] = useState("");
  const [requestedPickupLocation, setRequestedPickupLocation] = useState("");
  const [requestedDropoffLocation, setRequestedDropoffLocation] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const availableDrivers = useQuery(api.jobs.getAvailableDrivers, {});
  const createChangeRequest = useMutation(api.jobs.createTripChangeRequest);

  const handleSelectType = (type: ChangeType) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedType(type); };

  const handleSubmit = async () => {
    if (!bookingId || !selectedType || !userId) return;
    if (!submitted) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await createChangeRequest({
        bookingId: bookingId as any, requesterId: userId, type: selectedType,
        requestedEndDate: (selectedType === "extend" || selectedType === "shorten") ? requestedEndDate || undefined : undefined,
        requestedPickupLocation: selectedType === "change_pickup" ? requestedPickupLocation || undefined : undefined,
        requestedDropoffLocation: selectedType === "change_dropoff" ? requestedDropoffLocation || undefined : undefined,
        additionalDriverId: selectedType === "add_driver" && selectedDriverId ? selectedDriverId : undefined,
      });
      setSubmitted(true);
    } catch { Alert.alert("Error", "Unable to submit change request. Please try again."); }
  };

  const isFormValid = () => {
    if (!selectedType) return false;
    if (selectedType === "extend" || selectedType === "shorten") return requestedEndDate.trim().length > 0;
    if (selectedType === "change_pickup") return requestedPickupLocation.trim().length > 0;
    if (selectedType === "change_dropoff") return requestedDropoffLocation.trim().length > 0;
    if (selectedType === "add_driver") return selectedDriverId !== null;
    return false;
  };

  if (submitted) {
    return (
      <View style={styles.container}>
        <View style={styles.confirmationContainer}>
          <View style={styles.confirmationIcon}>
            <Text style={styles.confirmationIconText}>✓</Text>
          </View>
          <Text style={styles.confirmationTitle}>Request Submitted</Text>
          <Text style={styles.confirmationSubtitle}>Your change request has been sent and is pending approval.</Text>
          <Button onPress={() => router.back()} className="rounded-xl px-8 py-3">
            <Text className="text-sm font-bold text-white">Go Back</Text>
          </Button>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text className="text-2xl font-extrabold mb-2" style={{ color: "#111827" }}>Request a Change</Text>
      <Text className="text-sm font-medium text-gray-500 leading-6 mb-6">Select the change you&apos;d like to request for this booking.</Text>

      <RadioGroup value={selectedType || ""} onValueChange={(val) => handleSelectType(val as ChangeType)}>
        {CHANGE_OPTIONS.map((option) => (
          <RadioGroupItem
            key={option.type}
            value={option.type}
            className={`flex-row items-center gap-3.5 p-4 rounded-xl border mb-3 ${selectedType === option.type ? "border-gray-800 bg-gray-50" : "border-gray-200 bg-gray-50"}`}
          >
            <View className={`w-[22px] h-[22px] rounded-full border-2 items-center justify-center ${selectedType === option.type ? "border-gray-800" : "border-gray-300"}`}>
              {selectedType === option.type && <View className="w-[10px] h-[10px] rounded-full bg-gray-800" />}
            </View>
            <View className="flex-1">
              <Text className={`text-sm font-bold ${selectedType === option.type ? "text-gray-800" : "text-gray-600"}`}>{option.label}</Text>
              <Text className="text-xs font-medium text-gray-500">{option.description}</Text>
            </View>
          </RadioGroupItem>
        ))}
      </RadioGroup>

      {(selectedType === "extend" || selectedType === "shorten") && (
        <Card className="bg-gray-50 border-gray-200 mb-5">
          <Text className="text-sm font-bold mb-1" style={{ color: NAVY }}>{selectedType === "extend" ? "New end date" : "New end date"}</Text>
          <Text className="text-xs font-medium text-gray-400 mb-2">Enter date in YYYY-MM-DD format</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. 2026-08-25"
            placeholderTextColor="#9CA3AF"
            value={requestedEndDate}
            onChangeText={setRequestedEndDate}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </Card>
      )}

      {selectedType === "change_pickup" && (
        <Card className="bg-gray-50 border-gray-200 mb-5">
          <Text className="text-sm font-bold mb-2" style={{ color: NAVY }}>New pickup location</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter new pickup location"
            placeholderTextColor="#9CA3AF"
            value={requestedPickupLocation}
            onChangeText={setRequestedPickupLocation}
          />
        </Card>
      )}

      {selectedType === "change_dropoff" && (
        <Card className="bg-gray-50 border-gray-200 mb-5">
          <Text className="text-sm font-bold mb-2" style={{ color: NAVY }}>New dropoff location</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter new dropoff location"
            placeholderTextColor="#9CA3AF"
            value={requestedDropoffLocation}
            onChangeText={setRequestedDropoffLocation}
          />
        </Card>
      )}

      {selectedType === "add_driver" && (
        <Card className="bg-gray-50 border-gray-200 mb-5">
          <Text className="text-sm font-bold mb-3" style={{ color: NAVY }}>Select a driver</Text>
          {availableDrivers?.length === 0 ? (
            <Text style={styles.emptyText}>No available drivers found.</Text>
          ) : (
            <RadioGroup value={selectedDriverId || ""} onValueChange={(val) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedDriverId(val); }}>
              {availableDrivers?.map((driver: any) => (
                <RadioGroupItem
                  key={driver._id}
                  value={driver._id}
                  className={`flex-row items-center gap-3.5 p-3.5 rounded-xl border mb-2.5 ${selectedDriverId === driver._id ? "border-gray-800 bg-gray-50" : "border-gray-200 bg-gray-50"}`}
                >
                  <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${selectedDriverId === driver._id ? "border-gray-800" : "border-gray-300"}`}>
                    {selectedDriverId === driver._id && <View className="w-2.5 h-2.5 rounded-full bg-gray-800" />}
                  </View>
                  <View>
                    <Text className={`text-sm font-bold ${selectedDriverId === driver._id ? "text-gray-800" : "text-gray-600"}`}>{driver.firstName ?? "Driver"}</Text>
                    <Text className="text-xs font-medium text-gray-500">{driver.email}</Text>
                  </View>
                </RadioGroupItem>
              ))}
            </RadioGroup>
          )}
        </Card>
      )}

      <Button onPress={handleSubmit} disabled={!isFormValid()} className={`rounded-xl py-4 mt-2 ${!isFormValid() ? "bg-gray-300" : ""}`}>
        <Text className={`text-base font-bold ${isFormValid() ? "text-white" : "text-gray-500"}`}>Submit Request</Text>
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContent: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 48 },
  textInput: { backgroundColor: "#F3F4F6", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontWeight: "500", color: "#111827", borderWidth: 1.5, borderColor: "#E5E7EB", marginTop: 8 },
  emptyText: { fontSize: 14, fontWeight: "500", color: "#6B7280", textAlign: "center", paddingVertical: 24 },
  confirmationContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  confirmationIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#D1FAE5", alignItems: "center", justifyContent: "center", marginBottom: 24 },
  confirmationIconText: { fontSize: 32, fontWeight: "800", color: "#059669" },
  confirmationTitle: { fontSize: 22, fontWeight: "800", color: "#111827", marginBottom: 12, textAlign: "center" },
  confirmationSubtitle: { fontSize: 15, fontWeight: "500", color: "#6B7280", textAlign: "center", lineHeight: 22, marginBottom: 32 },
});
