import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthProvider";
import { useMutation } from "convex/react";
import { api } from "@/lib/convexApi";

const NAVY = "#2C3E5B";

const VEHICLE_CATEGORIES = [
  "Car",
  "Van",
  "Bus",
  "Truck",
  "Motorcycle",
  "Heavy Equipment",
];

const TRANSMISSION_OPTIONS = ["Manual", "Automatic", "Semi-Automatic"];
const FUEL_TYPE_OPTIONS = ["Petrol", "Diesel", "Electric", "Hybrid", "CNG"];

export default function CreateListingScreen() {
  const router = useRouter();
  const { userId } = useAuth();

  const createVehicle = useMutation(api.jobs.createVehicle);

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Car");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [color, setColor] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [transmission, setTransmission] = useState("Automatic");
  const [fuelType, setFuelType] = useState("Petrol");
  const [seats, setSeats] = useState("");
  const [doors, setDoors] = useState("");
  const [hasAc, setHasAc] = useState(true);
  const [hasGps, setHasGps] = useState(false);
  const [features, setFeatures] = useState<string[]>([]);
  const [featureText, setFeatureText] = useState("");
  const [images] = useState<string[]>([]);
  const [pricePerDay, setPricePerDay] = useState("");
  const [pricePerWeek, setPricePerWeek] = useState("");
  const [pricePerMonth, setPricePerMonth] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [minimumRentDays, setMinimumRentDays] = useState("1");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");

  const addFeature = () => {
    const trimmed = featureText.trim();
    if (trimmed && !features.includes(trimmed)) {
      setFeatures([...features, trimmed]);
      setFeatureText("");
    }
  };

  const removeFeature = (feature: string) => {
    setFeatures(features.filter((f) => f !== feature));
  };

  const handleSubmit = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await createVehicle({
        ownerId: userId,
        title: title || "Untitled Listing",
        description: description || undefined,
        category,
        make: make || "Unknown",
        model: model || "Unknown",
        year: Number(year) || 2024,
        color: color || undefined,
        licensePlate: licensePlate || undefined,
        transmission,
        fuelType,
        seats: seats ? Number(seats) : undefined,
        doors: doors ? Number(doors) : undefined,
        hasAc,
        hasGps,
        features,
        images: images.length > 0 ? images : [],
        pricePerDay: Number(pricePerDay) || 0,
        pricePerWeek: pricePerWeek ? Number(pricePerWeek) : undefined,
        pricePerMonth: pricePerMonth ? Number(pricePerMonth) : undefined,
        securityDeposit: Number(securityDeposit) || 0,
        minimumRentDays: Number(minimumRentDays) || 1,
        city: city || "Unknown",
        region: region || "Unknown",
      });
      router.replace("/(owner)/listings");
    } catch (error) {
      console.error("Failed to create listing:", error);
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    if (step === 0) return title.trim().length > 0 && make.trim().length > 0 && model.trim().length > 0;
    if (step === 1) return true;
    if (step === 2) return pricePerDay.trim().length > 0 && city.trim().length > 0 && region.trim().length > 0;
    return true;
  };

  const nextStep = () => {
    if (canProceed() && step < 3) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity hitSlop={8} onPress={prevStep}>
          <Ionicons name="arrow-back" size={24} color={NAVY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {step === 0 && "Vehicle Details"}
          {step === 1 && "Features & Specs"}
          {step === 2 && "Pricing & Location"}
          {step === 3 && "Review"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.progressRow}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[styles.progressDot, i <= step && styles.progressDotActive]}
          />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {step === 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Listing Title *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. 2022 Toyota Hilux - Double Cab"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe your vehicle, condition, and any special notes..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Category *</Text>
              <View style={styles.chipRow}>
                {VEHICLE_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.chip, category === cat && styles.chipActive]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        category === cat && styles.chipTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Make *</Text>
                <TextInput
                  style={styles.input}
                  value={make}
                  onChangeText={setMake}
                  placeholder="Toyota"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Model *</Text>
                <TextInput
                  style={styles.input}
                  value={model}
                  onChangeText={setModel}
                  placeholder="Hilux"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Year</Text>
                <TextInput
                  style={styles.input}
                  value={year}
                  onChangeText={setYear}
                  placeholder="2024"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                />
              </View>
              <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Color</Text>
                <TextInput
                  style={styles.input}
                  value={color}
                  onChangeText={setColor}
                  placeholder="White"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>License Plate</Text>
              <TextInput
                style={styles.input}
                value={licensePlate}
                onChangeText={setLicensePlate}
                placeholder="e.g. GT-1234-21"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="characters"
              />
            </View>
          </View>
        )}

        {step === 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specifications</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Transmission</Text>
              <View style={styles.chipRow}>
                {TRANSMISSION_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.chip, transmission === opt && styles.chipActive]}
                    onPress={() => setTransmission(opt)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        transmission === opt && styles.chipTextActive,
                      ]}
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Fuel Type</Text>
              <View style={styles.chipRow}>
                {FUEL_TYPE_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.chip, fuelType === opt && styles.chipActive]}
                    onPress={() => setFuelType(opt)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        fuelType === opt && styles.chipTextActive,
                      ]}
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Seats</Text>
                <TextInput
                  style={styles.input}
                  value={seats}
                  onChangeText={setSeats}
                  placeholder="5"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                />
              </View>
              <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Doors</Text>
                <TextInput
                  style={styles.input}
                  value={doors}
                  onChangeText={setDoors}
                  placeholder="4"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <View style={styles.row}>
              <TouchableOpacity
                style={styles.toggleRow}
                onPress={() => setHasAc(!hasAc)}
              >
                <View style={[styles.toggleBox, hasAc && styles.toggleBoxActive]}>
                  {hasAc && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                </View>
                <Text style={styles.toggleLabel}>Air Conditioning</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.toggleRow}
                onPress={() => setHasGps(!hasGps)}
              >
                <View style={[styles.toggleBox, hasGps && styles.toggleBoxActive]}>
                  {hasGps && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                </View>
                <Text style={styles.toggleLabel}>GPS Navigation</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Features</Text>
              <View style={styles.featureInputRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={featureText}
                  onChangeText={setFeatureText}
                  placeholder="Add a feature (e.g. Bluetooth)"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity style={styles.addFeatureButton} onPress={addFeature}>
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <View style={styles.featureChips}>
                {features.map((feature) => (
                  <TouchableOpacity
                    key={feature}
                    style={styles.featureChip}
                    onPress={() => removeFeature(feature)}
                  >
                    <Text style={styles.featureChipText}>{feature}</Text>
                    <Ionicons name="close" size={14} color="#6B7280" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pricing</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Price per Day (GHS) *</Text>
              <TextInput
                style={styles.input}
                value={pricePerDay}
                onChangeText={setPricePerDay}
                placeholder="500"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Price per Week (GHS)</Text>
                <TextInput
                  style={styles.input}
                  value={pricePerWeek}
                  onChangeText={setPricePerWeek}
                  placeholder="3000"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                />
              </View>
              <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Price per Month (GHS)</Text>
                <TextInput
                  style={styles.input}
                  value={pricePerMonth}
                  onChangeText={setPricePerMonth}
                  placeholder="10000"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Security Deposit (GHS)</Text>
                <TextInput
                  style={styles.input}
                  value={securityDeposit}
                  onChangeText={setSecurityDeposit}
                  placeholder="1000"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                />
              </View>
              <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Min. Rent Days</Text>
                <TextInput
                  style={styles.input}
                  value={minimumRentDays}
                  onChangeText={setMinimumRentDays}
                  placeholder="1"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Location</Text>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>City *</Text>
                <TextInput
                  style={styles.input}
                  value={city}
                  onChangeText={setCity}
                  placeholder="Accra"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Region *</Text>
                <TextInput
                  style={styles.input}
                  value={region}
                  onChangeText={setRegion}
                  placeholder="Greater Accra"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Review Your Listing</Text>

            <View style={styles.reviewCard}>
              <Text style={styles.reviewTitle}>{title || "Untitled Listing"}</Text>
              <Text style={styles.reviewSubtitle}>
                {category} · {make} {model} · {year || "N/A"}
              </Text>
              <Text style={styles.reviewPrice}>
                GHS {pricePerDay || "0"}/day
                {pricePerWeek ? ` · GHS ${pricePerWeek}/week` : ""}
                {pricePerMonth ? ` · GHS ${pricePerMonth}/month` : ""}
              </Text>
              <Text style={styles.reviewLocation}>
                {city}, {region}
              </Text>
              <Text style={styles.reviewDetails}>
                {transmission} · {fuelType} · {seats || "?"} seats · {doors || "?"} doors
              </Text>
              {features.length > 0 && (
                <Text style={styles.reviewFeatures}>
                  Features: {features.join(", ")}
                </Text>
              )}
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.primaryButton, !canProceed() && styles.primaryButtonDisabled]}
            onPress={step === 3 ? handleSubmit : nextStep}
            disabled={!canProceed() || saving}
          >
            <Text style={styles.primaryButtonText}>
              {saving ? "Publishing..." : step === 3 ? "Publish Listing" : "Continue"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingTop: 0,
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  progressRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  progressDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
  },
  progressDotActive: {
    backgroundColor: NAVY,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
    backgroundColor: "#F9FAFB",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  chipActive: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  toggleBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  toggleBoxActive: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
  },
  featureInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addFeatureButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: NAVY,
    alignItems: "center",
    justifyContent: "center",
  },
  featureChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  featureChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  featureChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  reviewCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 20,
    gap: 8,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  reviewSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  reviewPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: NAVY,
  },
  reviewLocation: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  reviewDetails: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  reviewFeatures: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 4,
  },
  footer: {
    marginTop: 24,
  },
  primaryButton: {
    backgroundColor: NAVY,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  primaryButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
