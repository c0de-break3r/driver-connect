import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/contexts/AuthProvider";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/lib/convexApi";
import * as Haptics from "expo-haptics";

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

  const handleSelectType = (type: ChangeType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedType(type);
  };

  const handleSubmit = async () => {
    if (!bookingId || !selectedType || !userId) {
      return;
    }

    if (!submitted) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      await createChangeRequest({
        bookingId: bookingId as any,
        requesterId: userId,
        type: selectedType,
        requestedEndDate: selectedType === "extend" || selectedType === "shorten" ? requestedEndDate || undefined : undefined,
        requestedPickupLocation: selectedType === "change_pickup" ? requestedPickupLocation || undefined : undefined,
        requestedDropoffLocation: selectedType === "change_dropoff" ? requestedDropoffLocation || undefined : undefined,
        additionalDriverId: selectedType === "add_driver" && selectedDriverId ? selectedDriverId : undefined,
      });
      setSubmitted(true);
    } catch {
      Alert.alert("Error", "Unable to submit change request. Please try again.");
    }
  };

  const isFormValid = () => {
    if (!selectedType) return false;
    if (selectedType === "extend" || selectedType === "shorten") {
      return requestedEndDate.trim().length > 0;
    }
    if (selectedType === "change_pickup") {
      return requestedPickupLocation.trim().length > 0;
    }
    if (selectedType === "change_dropoff") {
      return requestedDropoffLocation.trim().length > 0;
    }
    if (selectedType === "add_driver") {
      return selectedDriverId !== null;
    }
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
          <Text style={styles.confirmationSubtitle}>
            Your change request has been sent and is pending approval.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.headerTitle}>Request a Change</Text>
      <Text style={styles.headerSubtitle}>
        Select the change you&apos;d like to request for this booking.
      </Text>

      <View style={styles.optionsList}>
        {CHANGE_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.type}
            style={[
              styles.optionCard,
              selectedType === option.type && styles.optionCardActive,
            ]}
            onPress={() => handleSelectType(option.type)}
          >
            <View
              style={[
                styles.optionRadio,
                selectedType === option.type && styles.optionRadioActive,
              ]}
            >
              {selectedType === option.type && (
                <View style={styles.optionRadioInner} />
              )}
            </View>
            <View style={styles.optionTextWrap}>
              <Text
                style={[
                  styles.optionLabel,
                  selectedType === option.type && styles.optionLabelActive,
                ]}
              >
                {option.label}
              </Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {selectedType === "extend" || selectedType === "shorten" ? (
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>
            {selectedType === "extend" ? "New end date" : "New end date"}
          </Text>
          <Text style={styles.formHint}>Enter date in YYYY-MM-DD format</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. 2026-08-25"
            placeholderTextColor="#9CA3AF"
            value={requestedEndDate}
            onChangeText={setRequestedEndDate}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      ) : null}

      {selectedType === "change_pickup" ? (
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>New pickup location</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter new pickup location"
            placeholderTextColor="#9CA3AF"
            value={requestedPickupLocation}
            onChangeText={setRequestedPickupLocation}
          />
        </View>
      ) : null}

      {selectedType === "change_dropoff" ? (
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>New dropoff location</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter new dropoff location"
            placeholderTextColor="#9CA3AF"
            value={requestedDropoffLocation}
            onChangeText={setRequestedDropoffLocation}
          />
        </View>
      ) : null}

      {selectedType === "add_driver" ? (
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>Select a driver</Text>
          <View style={styles.driverList}>
            {availableDrivers?.length === 0 ? (
              <Text style={styles.emptyText}>No available drivers found.</Text>
            ) : (
              availableDrivers?.map((driver: any) => (
                <TouchableOpacity
                  key={driver._id}
                  style={[
                    styles.driverCard,
                    selectedDriverId === driver._id && styles.driverCardActive,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedDriverId(driver._id);
                  }}
                >
                  <View
                    style={[
                      styles.driverRadio,
                      selectedDriverId === driver._id && styles.driverRadioActive,
                    ]}
                  >
                    {selectedDriverId === driver._id && (
                      <View style={styles.driverRadioInner} />
                    )}
                  </View>
                  <View>
                    <Text
                      style={[
                        styles.driverName,
                        selectedDriverId === driver._id && styles.driverNameActive,
                      ]}
                    >
                      {driver.firstName ?? "Driver"}
                    </Text>
                    <Text style={styles.driverEmail}>{driver.email}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      ) : null}

      <TouchableOpacity
        style={[
          styles.submitButton,
          !isFormValid() && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={!isFormValid()}
      >
        <Text style={styles.submitButtonText}>Submit Request</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#6B7280",
    lineHeight: 22,
    marginBottom: 24,
  },
  optionsList: {
    gap: 12,
    marginBottom: 24,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  optionCardActive: {
    borderColor: NAVY,
    backgroundColor: "#F8F9FB",
  },
  optionRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  optionRadioActive: {
    borderColor: NAVY,
  },
  optionRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: NAVY,
  },
  optionTextWrap: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 2,
  },
  optionLabelActive: {
    color: NAVY,
  },
  optionDescription: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  formSection: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
  },
  formHint: {
    fontSize: 12,
    fontWeight: "500",
    color: "#9CA3AF",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  driverList: {
    gap: 10,
  },
  driverCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  driverCardActive: {
    borderColor: NAVY,
    backgroundColor: "#F8F9FB",
  },
  driverRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  driverRadioActive: {
    borderColor: NAVY,
  },
  driverRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: NAVY,
  },
  driverName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  driverNameActive: {
    color: NAVY,
  },
  driverEmail: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
    paddingVertical: 24,
  },
  submitButton: {
    backgroundColor: NAVY,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  confirmationContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  confirmationIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  confirmationIconText: {
    fontSize: 32,
    fontWeight: "800",
    color: "#059669",
  },
  confirmationTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
  },
  confirmationSubtitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: NAVY,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
