import { useState, useRef } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthProvider";
import { useMutation, useAction } from "convex/react";
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

  let LocationModule: any = null;
  try {
    LocationModule = require("expo-location");
  } catch {
    // location module unavailable
  }



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
  const [images, setImages] = useState<string[]>([]);
  const [pricePerDay, setPricePerDay] = useState("");
  const [pricePerWeek, setPricePerWeek] = useState("");
  const [pricePerMonth, setPricePerMonth] = useState("");

  const uriToBase64 = async (uri: string): Promise<string> => {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return `data:image/jpeg;base64,${base64}`;
  };
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [minimumRentDays, setMinimumRentDays] = useState("1");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");

  const suggestVehicleFromImage = useAction(api.listingAutomation.suggestVehicleFromImage);
  const lookupVehicleByPlate = useAction(api.listingAutomation.lookupVehicleByPlate);
  const suggestListingPriceAction = useAction(api.listingAutomation.suggestListingPrice);
  const logAnalytics = useAction(api.analytics.logAnalyticsEvent);

  const handleDescriptionFocus = () => {
    setDescriptionFocused(true);
    Animated.timing(descriptionHeight, {
      toValue: 140,
      duration: 220,
      useNativeDriver: false,
    }).start();
  };

  const handleDescriptionBlur = () => {
    setDescriptionFocused(false);
    Animated.timing(descriptionHeight, {
      toValue: 44,
      duration: 220,
      useNativeDriver: false,
    }).start();
  };

  const fillLocationFromCurrent = async () => {
    try {
      if (!LocationModule) {
        Alert.alert("Unavailable", "Location services are not available in this build.");
        return;
      }
      const { status } = await LocationModule.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location access is needed to fill your city and area automatically.");
        return;
      }
      const position = await LocationModule.getCurrentPositionAsync({});
      const [place] = await LocationModule.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      if (place.city || place.region) {
        setCity(place.city || place.subregion || place.region || "");
        setRegion(place.region || place.country || "");
      }
    } catch {
      Alert.alert("Error", "Unable to get your current location. Please enter it manually.");
    }
  };

  const [automationLoading, setAutomationLoading] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);
  const descriptionHeight = useRef(new Animated.Value(44)).current;
  const [analysisProgress, setAnalysisProgress] = useState("");
  const [suggestedFeatures, setSuggestedFeatures] = useState<string[]>([]);
  const [showPlacesResults, setShowPlacesResults] = useState(false);
  const [placesResults, setPlacesResults] = useState<any[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);



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

  const updateAnalysisProgress = (message: string) => {
    setAnalysisProgress(message);
  };

  const handleImageUpload = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission needed", "Please allow access to your photos to upload vehicle images.");
        return;
      }
      const remaining = 5 - images.length;
      if (remaining <= 0) {
        Alert.alert("Limit reached", "You can upload up to 5 photos.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: remaining,
      });
      if (!result.canceled && result.assets.length > 0) {
        const newUris = result.assets.map((asset: any) => asset.uri);
        setImages((prev) => {
          const combined = [...prev, ...newUris];
          return combined.slice(0, 5);
        });
        setAutomationLoading(true);
        setAnalysisProgress("Preparing image...");
        const base64 = await uriToBase64(newUris[0]);
        updateAnalysisProgress("Analyzing vehicle...");
        const suggestion = await suggestVehicleFromImage({ imageUri: base64 });
        updateAnalysisProgress("Applying suggestions...");
        if (suggestion.category) setCategory(suggestion.category);
        if (suggestion.make) setMake(suggestion.make);
        if (suggestion.model) setModel(suggestion.model);
        if (suggestion.year) setYear(String(suggestion.year));
        if (suggestion.color) setColor(suggestion.color);
        if (suggestion.features?.length) {
          const newFeatures = suggestion.features.filter((f: string) => !features.includes(f));
          setFeatures([...features, ...newFeatures]);
          setSuggestedFeatures(suggestion.features);
        }
        updateAnalysisProgress("Complete");
        setTimeout(() => setAnalysisProgress(""), 1500);
        logAnalytics({
          event: "listing_image_uploaded",
          userId: userId || undefined,
          properties: { category: suggestion.category, confidence: suggestion.confidence },
        }).catch(() => {});
      }
    } catch {
      Alert.alert("Error", "Unable to process image. Please try again.");
      setAnalysisProgress("");
    } finally {
      setAutomationLoading(false);
    }
  };

  const handlePlateScan = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission needed", "Please allow access to your photos to scan the license plate.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [3, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        setAutomationLoading(true);
        const base64 = await uriToBase64(result.assets[0].uri);
        const data = await lookupVehicleByPlate({ imageUri: base64 });
        if (data.make) setMake(data.make);
        if (data.model) setModel(data.model);
        if (data.year) setYear(String(data.year));
        if (data.color) setColor(data.color);
        if (data.transmission) setTransmission(data.transmission as any);
        if (data.fuelType) setFuelType(data.fuelType as any);
        logAnalytics({
          event: "listing_plate_scanned",
          userId: userId || undefined,
          properties: { make: data.make, model: data.model, confidence: data.confidence },
        }).catch(() => {});
      }
    } catch {
      Alert.alert("Error", "Unable to scan plate. Please try again.");
    } finally {
      setAutomationLoading(false);
    }
  };

  const handlePriceSuggestion = async () => {
    if (!category || !make || !model || !year) {
      Alert.alert("Missing info", "Please fill in category, make, model, and year first.");
      return;
    }
    setAutomationLoading(true);
    try {
      const suggestion = await suggestListingPriceAction({
        category,
        make,
        model,
        year: Number(year) || 2024,
      });
      if (suggestion.suggestedPricePerDay) setPricePerDay(String(suggestion.suggestedPricePerDay));
      if (suggestion.suggestedPricePerWeek) setPricePerWeek(String(suggestion.suggestedPricePerWeek));
      if (suggestion.suggestedPricePerMonth) setPricePerMonth(String(suggestion.suggestedPricePerMonth));
      logAnalytics({
        event: "listing_price_suggested",
        userId: userId || undefined,
        properties: {
          category,
          make,
          model,
          year: Number(year),
          suggestedPricePerDay: suggestion.suggestedPricePerDay,
          comparableCount: suggestion.comparableCount,
        },
      }).catch(() => {});
    } catch {
      Alert.alert("Error", "Unable to suggest price. Please try again.");
    } finally {
      setAutomationLoading(false);
    }
  };

  const handlePlacesSearch = async (query: string) => {
    setCity(query);
    if (!query.trim()) {
      setPlacesResults([]);
      setShowPlacesResults(false);
      return;
    }
    setIsSearchingPlaces(true);
    try {
      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&components=country:gh&locationbias=circle:80000000@7.9465,-1.0232&key=${apiKey}`
      );
      const data = await response.json();
      if (data.status === "OK" && data.predictions) {
        setPlacesResults(data.predictions);
        setShowPlacesResults(true);
      } else {
        setPlacesResults([]);
        setShowPlacesResults(false);
      }
    } catch {
      setPlacesResults([]);
      setShowPlacesResults(false);
    } finally {
      setIsSearchingPlaces(false);
    }
  };

  const handlePlaceSelect = (prediction: any) => {
    setCity(prediction.description || prediction.structured_formatting?.main_text || "");
    setRegion(prediction.structured_formatting?.secondary_text || "");
    setShowPlacesResults(false);
    setPlacesResults([]);
    logAnalytics({
      event: "listing_place_selected",
      userId: userId || undefined,
      properties: { city: city, region: prediction.structured_formatting?.secondary_text },
    }).catch(() => {});
  };

  const handleVoiceDescription = () => {
    Alert.alert("Voice coming soon", "Voice description will be available in a future update. Please type your description for now.");
  };

  const handleSubmit = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const vehicleId = await createVehicle({
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
        images: images.slice(0, 5),
        pricePerDay: Number(pricePerDay) || 0,
        pricePerWeek: pricePerWeek ? Number(pricePerWeek) : undefined,
        pricePerMonth: pricePerMonth ? Number(pricePerMonth) : undefined,
        securityDeposit: Number(securityDeposit) || 0,
        minimumRentDays: Number(minimumRentDays) || 1,
        city: city || "Unknown",
        region: region || "Unknown",
      });
      logAnalytics({
        event: "listing_created",
        userId: userId || undefined,
        properties: { vehicleId: vehicleId as any, category, make, model, pricePerDay: Number(pricePerDay) },
      }).catch(() => {});
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
      logAnalytics({
        event: "listing_step_completed",
        userId: userId || undefined,
        properties: { step, nextStep: step + 1 },
      }).catch(() => {});
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
            <View style={styles.imageUploadSection}>
              <Text style={styles.imageUploadTitle}>Vehicle Photos</Text>
              <Text style={styles.imageUploadSubtitle}>Add up to 5 photos to showcase your vehicle</Text>
              
              {images.length === 0 ? (
                <TouchableOpacity style={styles.imageUploadMainButton} onPress={handleImageUpload} disabled={automationLoading}>
                  {automationLoading ? (
                    <View style={styles.automationLoader} />
                  ) : (
                    <>
                      <Ionicons name="camera-outline" size={32} color={NAVY} />
                      <Text style={styles.imageUploadMainText}>Tap to upload photos</Text>
                      <Text style={styles.imageUploadMainHint}>First photo will be used for AI analysis</Text>
                    </>
                  )}
                </TouchableOpacity>
              ) : (
                <View>
                  <View style={styles.imageGrid}>
                    {images.map((uri, index) => (
                      <View key={index} style={styles.imageGridItem}>
                        <Image source={{ uri }} style={styles.imageGridImage} contentFit="cover" />
                        <TouchableOpacity style={styles.removeImageButton} onPress={() => setImages(images.filter((_, i) => i !== index))}>
                          <Ionicons name="close-circle" size={24} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    ))}
                    {images.length < 5 && (
                      <TouchableOpacity style={styles.imageAddMore} onPress={handleImageUpload} disabled={automationLoading}>
                        <Ionicons name="add-outline" size={28} color="#9CA3AF" />
                        <Text style={styles.imageAddMoreText}>Add more</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.imageCountText}>{images.length} of 5 photos uploaded</Text>
                </View>
              )}
            </View>
            {automationLoading && analysisProgress ? (
              <View style={styles.progressRow}>
                <View style={styles.progressBar}>
                  <View style={styles.progressFill} />
                </View>
                <Text style={styles.analysisProgress}>{analysisProgress}</Text>
              </View>
            ) : null}
            {automationLoading && analysisProgress ? (
              <View style={styles.progressRow}>
                <View style={styles.progressBar}>
                  <View style={styles.progressFill} />
                </View>
                <Text style={styles.analysisProgress}>{analysisProgress}</Text>
              </View>
            ) : null}

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
              <Animated.View style={[styles.descriptionBox, { height: descriptionHeight }]}>
                <TextInput
                  style={styles.descriptionInput}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Describe your vehicle, condition, and any special notes..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={descriptionFocused ? 6 : 1}
                  onFocus={handleDescriptionFocus}
                  onBlur={handleDescriptionBlur}
                  textAlignVertical="top"
                />
                <TouchableOpacity style={styles.voiceButton} onPress={handleVoiceDescription}>
                  <Ionicons name="mic-outline" size={20} color={NAVY} />
                </TouchableOpacity>
              </Animated.View>
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
              <View style={styles.licensePlateRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={licensePlate}
                  onChangeText={setLicensePlate}
                  placeholder="e.g. GT-1234-21"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="characters"
                />
                <TouchableOpacity style={styles.scanButton} onPress={handlePlateScan} disabled={automationLoading}>
                  <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
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
              <View style={styles.priceRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={pricePerDay}
                  onChangeText={setPricePerDay}
                  placeholder="500"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                />
                <TouchableOpacity style={styles.suggestButton} onPress={handlePriceSuggestion} disabled={automationLoading}>
                  <Ionicons name="bulb-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.suggestButtonText}>Suggest</Text>
                </TouchableOpacity>
              </View>
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

            <View style={styles.field}>
              <Text style={styles.label}>City / Area *</Text>
              <View style={styles.locationSearchContainer}>
                <View style={styles.locationInputRow}>
                  <TouchableOpacity onPress={fillLocationFromCurrent} hitSlop={8}>
                    <Ionicons name="location-outline" size={20} color="#6B7280" />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.locationInput}
                    value={city}
                    onChangeText={handlePlacesSearch}
                    placeholder="Search city or area..."
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="words"
                  />
                </View>
                {showPlacesResults && placesResults.length > 0 && (
                  <View style={styles.placesDropdown}>
                    {placesResults.map((place) => (
                      <TouchableOpacity
                        key={place.place_id}
                        style={styles.placeItem}
                        onPress={() => handlePlaceSelect(place)}
                      >
                        <Text style={styles.placeMainText}>
                          {place.structured_formatting?.main_text || place.description}
                        </Text>
                        <Text style={styles.placeSecondaryText}>
                          {place.structured_formatting?.secondary_text || ""}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
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
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    width: "60%",
    borderRadius: 2,
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
  imageUploadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    marginBottom: 8,
  },
  imageUploadText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  automationHint: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 8,
    marginLeft: 4,
  },
  automationLoader: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderTopColor: NAVY,
  },
  analysisProgress: {
    fontSize: 12,
    fontWeight: "600",
    color: NAVY,
    marginBottom: 16,
    marginLeft: 4,
  },
  descriptionBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
    paddingVertical: 12,
    overflow: "hidden",
  },
  descriptionInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
    minHeight: 20,
  },
  voiceButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  licensePlateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  scanButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: NAVY,
    alignItems: "center",
    justifyContent: "center",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  suggestButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: NAVY,
  },
  suggestButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  locationSearchContainer: {
    position: "relative",
    zIndex: 10,
  },
  locationInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  locationInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
    paddingVertical: 0,
  },
  placesDropdown: {
    marginTop: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    maxHeight: 200,
    zIndex: 20,
    elevation: 10,
  },
  placeItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  placeMainText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  placeSecondaryText: {
    fontSize: 12,
    fontWeight: "400",
    color: "#6B7280",
    marginTop: 2,
  },
  imageUploadSection: {
    marginBottom: 24,
  },
  imageUploadTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  imageUploadSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 12,
  },
  imageUploadMainButton: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    backgroundColor: "#F9FAFB",
  },
  imageUploadMainText: {
    fontSize: 15,
    fontWeight: "600",
    color: NAVY,
  },
  imageUploadMainHint: {
    fontSize: 12,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  imageGridItem: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  imageGridImage: {
    width: "100%",
    height: "100%",
  },
  imageAddMore: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: "#F9FAFB",
  },
  imageAddMoreText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  imageCountText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
