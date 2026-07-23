import { useState, useCallback } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";

import { useDriverOnboardingStore } from "@/store/useDriverOnboardingStore";
import { Card } from "@/components/ui/card";

const NAVY = "#2C3E5B";
const ORANGE = "#FF7B54";

type FuelType = "petrol" | "diesel" | "electric" | "hybrid" | null;

const VEHICLE_BRANDS = [
  "Toyota",
  "Honda",
  "Nissan",
  "Hyundai",
  "Kia",
  "Mazda",
  "Ford",
  "Chevrolet",
  "Mercedes-Benz",
  "BMW",
  "Audi",
  "Volkswagen",
  "Other",
];

const VEHICLE_CATEGORIES = [
  "Sedan",
  "SUV",
  "Van",
  "Hatchback",
  "Pickup",
  "Motorcycle",
  "Bus",
  "Truck",
  "Other",
];

const FUEL_TYPES: { label: string; value: FuelType }[] = [
  { label: "Petrol", value: "petrol" },
  { label: "Diesel", value: "diesel" },
  { label: "Electric", value: "electric" },
  { label: "Hybrid", value: "hybrid" },
];

export default function AddVehicleScreen() {
  const {
    vehicleMake,
    vehicleModel,
    vehicleYear,
    vehiclePlateNumber,
    vehicleOwnership,
    setVehicleDetails,
  } = useDriverOnboardingStore();

  const [brand, setBrand] = useState(vehicleMake);
  const [model, setModel] = useState(vehicleModel);
  const [category, setCategory] = useState("");
  const [weightCapacity, setWeightCapacity] = useState("");
  const [plateNumber, setPlateNumber] = useState(vehiclePlateNumber);
  const [expiryDate, setExpiryDate] = useState(
    vehicleYear ? String(vehicleYear) : "",
  );
  const [fuelType, setFuelType] = useState<FuelType>(null);
  const [carImageUri, setCarImageUri] = useState<string | null>(null);
  const [showBrandPicker, setShowBrandPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showFuelPicker, setShowFuelPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const pickCarImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please allow access to your photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets[0]) {
      setCarImageUri(result.assets[0].uri);
    }
  }, []);

  const handleSubmit = async () => {
    if (!brand.trim() || !model.trim() || !plateNumber.trim() || !expiryDate.trim()) {
      Alert.alert("Missing fields", "Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));

    setVehicleDetails(
      brand.trim(),
      model.trim(),
      expiryDate.trim(),
      plateNumber.trim(),
      vehicleOwnership ?? "own",
      true,
    );

    setSubmitting(false);
    Alert.alert("Submitted", "Your vehicle information has been submitted for approval.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  const renderDropdownButton = (
    label: string,
    value: string,
    onPress: () => void,
  ) => (
    <Pressable style={styles.dropdownButton} onPress={onPress}>
      <Text style={[styles.dropdownText, !value && styles.dropdownPlaceholder]}>
        {value || label}
      </Text>
      <Ionicons name="chevron-down" size={18} color={value ? NAVY : "#6E7E91"} />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Vehicle Setup</Text>
        <Text style={styles.subtitle}>
          Add your info to send approval request to admin.
        </Text>

        <Card style={styles.formCard}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Vehicle Brand*</Text>
            {renderDropdownButton("Select Brand Model", brand, () => setShowBrandPicker(true))}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Vehicle Model*</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Select Vehicle Model"
                placeholderTextColor="#6E7E91"
                value={model}
                onChangeText={setModel}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Vehicle Category*</Text>
            {renderDropdownButton("Select Vehicle Category", category, () => setShowCategoryPicker(true))}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Parcel Weight Capacity (kg)</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter max weight"
                placeholderTextColor="#6E7E91"
                value={weightCapacity}
                onChangeText={setWeightCapacity}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Licence Plate Number*</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="EX: DB-3212"
                placeholderTextColor="#6E7E91"
                value={plateNumber}
                onChangeText={setPlateNumber}
                autoCapitalize="characters"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Licence Expire Date*</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="dd-mm-yyyy"
                placeholderTextColor="#6E7E91"
                value={expiryDate}
                onChangeText={setExpiryDate}
              />
              <Pressable style={styles.calendarIcon}>
                <Ionicons name="calendar-outline" size={20} color="#6E7E91" />
              </Pressable>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Fuel Type*</Text>
            {renderDropdownButton("Select Fuel Type", fuelType ?? "", () => setShowFuelPicker(true))}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Upload Car Image*</Text>
            <Pressable style={styles.uploadArea} onPress={pickCarImage}>
              {carImageUri ? (
                <Image source={{ uri: carImageUri }} style={styles.uploadImage} contentFit="cover" />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Ionicons name="image-outline" size={32} color="#6E7E91" />
                  <Text style={styles.uploadText}>Click to Add</Text>
                </View>
              )}
            </Pressable>
          </View>
        </Card>

        <Pressable
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitButtonText}>
            {submitting ? "Submitting..." : "Send Request"}
          </Text>
        </Pressable>
      </ScrollView>

      {/* Brand Picker Modal */}
      <Modal
        visible={showBrandPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBrandPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Brand</Text>
            <ScrollView style={styles.pickerList}>
              {VEHICLE_BRANDS.map((item) => (
                <Pressable
                  key={item}
                  style={styles.pickerItem}
                  onPress={() => {
                    setBrand(item);
                    setShowBrandPicker(false);
                  }}
                >
                  <Text style={[styles.pickerItemText, brand === item && styles.pickerItemActive]}>
                    {item}
                  </Text>
                  {brand === item && (
                    <Ionicons name="checkmark" size={20} color={ORANGE} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Category</Text>
            <ScrollView style={styles.pickerList}>
              {VEHICLE_CATEGORIES.map((item) => (
                <Pressable
                  key={item}
                  style={styles.pickerItem}
                  onPress={() => {
                    setCategory(item);
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text style={[styles.pickerItemText, category === item && styles.pickerItemActive]}>
                    {item}
                  </Text>
                  {category === item && (
                    <Ionicons name="checkmark" size={20} color={ORANGE} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Fuel Type Picker Modal */}
      <Modal
        visible={showFuelPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFuelPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Fuel Type</Text>
            <ScrollView style={styles.pickerList}>
              {FUEL_TYPES.map((item) => (
                <Pressable
                  key={item.value ?? "none"}
                  style={styles.pickerItem}
                  onPress={() => {
                    setFuelType(item.value);
                    setShowFuelPicker(false);
                  }}
                >
                  <Text style={[styles.pickerItemText, fuelType === item.value && styles.pickerItemActive]}>
                    {item.label}
                  </Text>
                  {fuelType === item.value && (
                    <Ionicons name="checkmark" size={20} color={ORANGE} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF8F3",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: NAVY,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6E7E91",
    marginBottom: 8,
    lineHeight: 20,
  },
  formCard: {
    gap: 18,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: NAVY,
    textTransform: "capitalize",
    letterSpacing: 0.4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EAE1D9",
    paddingHorizontal: 14,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: NAVY,
    paddingVertical: 12,
  },
  calendarIcon: {
    padding: 4,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EAE1D9",
    paddingHorizontal: 14,
    minHeight: 48,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: "600",
    color: NAVY,
  },
  dropdownPlaceholder: {
    color: "#6E7E91",
    fontWeight: "500",
  },
  uploadArea: {
    borderWidth: 1.5,
    borderColor: "#EAE1D9",
    borderStyle: "dashed",
    borderRadius: 16,
    minHeight: 140,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  uploadImage: {
    width: "100%",
    height: 180,
  },
  uploadPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 24,
  },
  uploadText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6E7E91",
  },
  submitButton: {
    backgroundColor: NAVY,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#00000066",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
    maxHeight: "70%",
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E2E8F0",
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: NAVY,
    marginBottom: 12,
  },
  pickerList: {
    maxHeight: 320,
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#EAE1D9",
  },
  pickerItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: NAVY,
  },
  pickerItemActive: {
    color: ORANGE,
  },
});
