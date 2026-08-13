import { useState, useRef } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  InteractionManager,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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

const SERVICE_TYPES = [
  { id: "rent", label: "Rent out", icon: "car-sport-outline", desc: "Daily, weekly or monthly rentals" },
  { id: "sell", label: "Sell", icon: "pricetag-outline", desc: "Fixed price or negotiable" },
  { id: "work_and_pay", label: "Work & Pay", icon: "cash-outline", desc: "Rent-to-own with installments" },
  { id: "chauffeur", label: "Chauffeur service", icon: "person-outline", desc: "Driver included or vehicle only" },
  { id: "event", label: "Event package", icon: "calendar-outline", desc: "Weddings, airport, corporate" },
  { id: "fleet", label: "Fleet leasing", icon: "business-outline", desc: "Bulk bookings for companies" },
];

const TRANSMISSION_OPTIONS = ["Manual", "Automatic", "Semi-Automatic"];
const FUEL_TYPE_OPTIONS = ["Petrol", "Diesel", "Electric", "Hybrid", "CNG"];
const OCCASION_TYPES = ["Wedding", "Airport transfer", "Corporate event", "Daily commute", "Funeral", "Other"];
const CONDITION_OPTIONS = ["New", "Excellent", "Good", "Fair", "Needs work"];
const BOOKING_MODES = [
  { label: "Request to book", value: "request", desc: "Review each booking request" },
  { label: "Instant book", value: "instant", desc: "Guests book automatically" },
];
const ADVANCE_NOTICE = [
  { label: "Same day", value: 0 },
  { label: "1 day", value: 1 },
  { label: "3 days", value: 3 },
  { label: "7 days", value: 7 },
];

const IntroStep = () => {
  const illustrationSize = 220;
  return (
    <View style={styles.introContent}>
      <Image
        source={require("@/assets/images/illustrator-icons/intro.png")}
        style={[styles.introIllustration, { width: illustrationSize, height: illustrationSize }]}
        contentFit="contain"
      />
      <Text style={styles.introTitle}>Tell us about your vehicle</Text>
      <Text style={styles.introHelper}>
        In this step, we&apos;ll ask about the type of vehicle you&apos;re listing, its condition, and where it&apos;s based. Then we&apos;ll set up pricing, availability, and booking preferences.
      </Text>
    </View>
  );
};

export default function CreateListingScreen() {
  const router = useRouter();
  const { userId } = useAuth();

  let LocationModule: any;
  try {
    LocationModule = require("expo-location");
  } catch {
    // location module unavailable
  }

  const createVehicle = useMutation(api.jobs.createVehicle);
  const suggestVehicleFromImage = useAction(api.listingAutomation.suggestVehicleFromImage);
  const lookupVehicleByPlate = useAction(api.listingAutomation.lookupVehicleByPlate);
  const suggestListingPriceAction = useAction(api.listingAutomation.suggestListingPrice);
  const logAnalytics = useAction(api.analytics.logAnalyticsEvent);

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [published, setPublished] = useState(false);
  const [publishedVehicleId, setPublishedVehicleId] = useState<string | null>(null);
  const screenWidth = Dimensions.get("window").width;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const isAnimating = useRef(false);
  const currentStepRef = useRef(0);

  // Service type
  const [serviceType, setServiceType] = useState<string>("rent");

  // Step 1 - Vehicle basics
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Car");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [color, setColor] = useState("");
  const [licensePlate, setLicensePlate] = useState("");

  // Step 2 - Specs & features
  const [transmission, setTransmission] = useState("Automatic");
  const [fuelType, setFuelType] = useState("Petrol");
  const [seats, setSeats] = useState("");
  const [doors, setDoors] = useState("");
  const [hasAc, setHasAc] = useState(true);
  const [hasGps, setHasGps] = useState(false);
  const [features, setFeatures] = useState<string[]>([]);
  const [featureText, setFeatureText] = useState("");

  // Sell-specific
  const [mileage, setMileage] = useState("");
  const [condition, setCondition] = useState("");
  const [negotiable, setNegotiable] = useState(false);
  const [inspectionReport, setInspectionReport] = useState("");

  // Work & Pay-specific
  const [downPaymentPercent, setDownPaymentPercent] = useState("");
  const [termMonths, setTermMonths] = useState("");
  const [totalPayable, setTotalPayable] = useState("");
  const [earlyBuyout, setEarlyBuyout] = useState(false);

  // Chauffeur-specific
  const [driverIncluded, setDriverIncluded] = useState(false);
  const [driverRate, setDriverRate] = useState("");

  // Event-specific
  const [occasionType, setOccasionType] = useState("");
  const [packageInclusions, setPackageInclusions] = useState("");

  // Fleet-specific
  const [fleetSize, setFleetSize] = useState("");
  const [contractTerms, setContractTerms] = useState("");

  // Step 3 - Photos
  const [images, setImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [automationLoading, setAutomationLoading] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState("");

  // Step 4 - Pricing
  const [pricePerDay, setPricePerDay] = useState("");
  const [pricePerWeek, setPricePerWeek] = useState("");
  const [pricePerMonth, setPricePerMonth] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [minimumRentDays, setMinimumRentDays] = useState("1");
  const [weekendPricingEnabled, setWeekendPricingEnabled] = useState(false);
  const [weekendPricingPercent, setWeekendPricingPercent] = useState("");
  const [monthlyDiscountEnabled, setMonthlyDiscountEnabled] = useState(false);
  const [monthlyDiscountPercent, setMonthlyDiscountPercent] = useState("");
  const [weeklyDiscountEnabled, setWeeklyDiscountEnabled] = useState(false);
  const [weeklyDiscountPercent, setWeeklyDiscountPercent] = useState("");
  const [lastMinuteDiscountEnabled, setLastMinuteDiscountEnabled] = useState(false);
  const [lastMinuteDiscountPercent, setLastMinuteDiscountPercent] = useState("");
  const [newListingPromotionEnabled, setNewListingPromotionEnabled] = useState(false);

  // Step 5 - Location & booking
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [showPreciseLocation, setShowPreciseLocation] = useState(false);
  const [deliveryAvailable, setDeliveryAvailable] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState("");
  const [bookingMode, setBookingMode] = useState<"request" | "instant">("request");
  const [advanceNotice, setAdvanceNotice] = useState(1);
  const [tripMinDays, setTripMinDays] = useState("1");
  const [showPlacesResults, setShowPlacesResults] = useState(false);
  const [placesResults, setPlacesResults] = useState<any[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);

  const uriToBase64 = async (uri: string): Promise<string> => {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return `data:image/jpeg;base64,${base64}`;
  };

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
        setAnalysisProgress("Analyzing vehicle...");
        const suggestion = await suggestVehicleFromImage({ imageUri: base64 });
        setAnalysisProgress("Applying suggestions...");
        if (suggestion.category) setCategory(suggestion.category);
        if (suggestion.make) setMake(suggestion.make);
        if (suggestion.model) setModel(suggestion.model);
        if (suggestion.year) setYear(String(suggestion.year));
        if (suggestion.color) setColor(suggestion.color);
        if (suggestion.serviceType) setServiceType(suggestion.serviceType);
        if (suggestion.suggestedPricePerDay && !pricePerDay) {
          setPricePerDay(String(suggestion.suggestedPricePerDay));
        }
        if (suggestion.features?.length) {
          const newFeatures = suggestion.features.filter((f: string) => !features.includes(f));
          setFeatures([...features, ...newFeatures]);
        }
        setAnalysisProgress("Complete");
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
    Alert.alert(
      "Scan License Plate",
      "Choose how you want to capture the plate",
      [
        { text: "Take Photo", onPress: async () => { await captureOrPickPlate("camera"); } },
        { text: "Choose Photo", onPress: async () => { await captureOrPickPlate("library"); } },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const captureOrPickPlate = async (source: "camera" | "library") => {
    try {
      if (source === "camera") {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert("Permission needed", "Please allow camera access to scan the license plate.");
          return;
        }
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert("Permission needed", "Please allow access to your photos to scan the license plate.");
          return;
        }
      }
      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync({ mediaTypes: "images", allowsEditing: true, aspect: [3, 1], quality: 0.8 })
          : await ImagePicker.launchImageLibraryAsync({ mediaTypes: "images", allowsEditing: true, aspect: [3, 1], quality: 0.8 });

      if (!result.canceled && result.assets[0]?.uri) {
        setAutomationLoading(true);
        const base64 = await uriToBase64(result.assets[0].uri);
        const data = await lookupVehicleByPlate({ imageUri: base64 });
        if (data.licensePlate) setLicensePlate(data.licensePlate);
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
  };

  const handleSubmit = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const vehicleId = await createVehicle({
        ownerId: userId,
        title: title || "Untitled Listing",
        description: `${make} ${model} (${year || "N/A"}). ${transmission} transmission, ${fuelType} engine. ${seats} seats, ${doors} doors. Features: ${features.join(", ") || "None specified"}. ${serviceType === "sell" ? `For sale. Mileage: ${mileage || "N/A"} km. Condition: ${condition || "N/A"}.${negotiable ? " Price negotiable." : ""}` : ""} ${serviceType === "work_and_pay" ? `Work & Pay. Down payment: ${downPaymentPercent || "N/A"}%. Term: ${termMonths || "N/A"} months. Total payable: GHS ${totalPayable || "N/A"}.${earlyBuyout ? " Early buyout allowed." : ""}` : ""} ${serviceType === "chauffeur" ? `Chauffeur service. ${driverIncluded ? "Driver included." : "Vehicle only."} Driver rate: GHS ${driverRate || "N/A"}/day.` : ""} ${serviceType === "event" ? `Event package. Occasion: ${occasionType || "N/A"}. Inclusions: ${packageInclusions || "None specified"}.` : ""} ${serviceType === "fleet" ? `Fleet leasing. Fleet size: ${fleetSize || "N/A"} vehicles. Terms: ${contractTerms || "N/A"}.` : ""}`,
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
        serviceType,
        mileage: mileage ? Number(mileage) : undefined,
        condition: condition || undefined,
        negotiable: serviceType === "sell" ? negotiable : undefined,
        inspectionReport: inspectionReport || undefined,
        downPaymentPercent: downPaymentPercent ? Number(downPaymentPercent) : undefined,
        termMonths: termMonths ? Number(termMonths) : undefined,
        totalPayable: totalPayable ? Number(totalPayable) : undefined,
        earlyBuyout: serviceType === "work_and_pay" ? earlyBuyout : undefined,
        driverIncluded: serviceType === "chauffeur" ? driverIncluded : undefined,
        driverRate: driverRate ? Number(driverRate) : undefined,
        occasionType: occasionType || undefined,
        packageInclusions: packageInclusions || undefined,
        fleetSize: fleetSize ? Number(fleetSize) : undefined,
        contractTerms: contractTerms || undefined,
        showPreciseLocation,
        deliveryAvailable,
        deliveryFee: deliveryFee ? Number(deliveryFee) : undefined,
      });
      logAnalytics({
        event: "listing_created",
        userId: userId || undefined,
        properties: { vehicleId: vehicleId as any, category, make, model, pricePerDay: Number(pricePerDay), serviceType },
      }).catch(() => {});
      setPublishedVehicleId(vehicleId as string);
      setPublished(true);
    } catch (error) {
      console.error("Failed to create listing:", error);
      Alert.alert("Error", "Failed to publish listing. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return true;
      case 1:
        return images.length >= 3;
      case 2:
        return true;
      case 3:
        return title.trim().length > 0 && make.trim().length > 0 && model.trim().length > 0;
      case 4:
        return true;
      case 5:
        if (serviceType === "sell") {
          return pricePerDay.trim().length > 0 && Number(pricePerDay) >= 10;
        }
        return pricePerDay.trim().length > 0 && Number(pricePerDay) >= 10;
      case 6:
        return city.trim().length > 0;
      case 7:
        return true;
      case 8:
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (canProceed() && step < 9 && !isAnimating.current) {
      isAnimating.current = true;
      currentStepRef.current = step;
      logAnalytics({
        event: "listing_step_completed",
        userId: userId || undefined,
        properties: { step, nextStep: step + 1 },
      }).catch(() => {});
      Animated.timing(slideAnim, {
        toValue: -1,
        duration: 240,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        setStep((prev) => prev + 1);
        slideAnim.setValue(1);
        InteractionManager.runAfterInteractions(() => {
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 240,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }).start(() => {
            isAnimating.current = false;
          });
        });
      });
    }
  };

  const prevStep = () => {
    if (step > 0 && !isAnimating.current) {
      isAnimating.current = true;
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        setStep((prev) => prev - 1);
        slideAnim.setValue(-1);
        InteractionManager.runAfterInteractions(() => {
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 240,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }).start(() => {
            isAnimating.current = false;
          });
        });
      });
    } else if (step === 0) {
      router.back();
    }
  };

  const stepTitles = [
    "List Your Vehicle",
    "Photos",
    "Service Type",
    "Vehicle Details",
    "Specs & Features",
    "Pricing",
    "Location & Delivery",
    "Booking Settings",
    "Review & Publish",
  ];

  const renderServiceSpecificFields = () => {
    if (serviceType === "sell") {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sale Details</Text>
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1, marginRight: 12 }]}>
              <Text style={styles.label}>Mileage (km)</Text>
              <TextInput
                style={styles.input}
                value={mileage}
                onChangeText={setMileage}
                placeholder="e.g. 45000"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
              />
            </View>
            <View style={[styles.field, { flex: 1, marginLeft: 12 }]}>
              <Text style={styles.label}>Condition</Text>
              <View style={styles.chipRow}>
                {CONDITION_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.chip, condition === opt && styles.chipActive]}
                    onPress={() => setCondition(opt)}
                  >
                    <Text style={[styles.chipText, condition === opt && styles.chipTextActive]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.toggleRow} onPress={() => setNegotiable(!negotiable)}>
            <View style={[styles.toggleBox, negotiable && styles.toggleBoxActive]}>
              {negotiable && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
            </View>
            <Text style={styles.toggleLabel}>Price is negotiable</Text>
          </TouchableOpacity>
          <View style={styles.field}>
            <Text style={styles.label}>Inspection report (optional)</Text>
            <TextInput
              style={[styles.input, { minHeight: 80 }]}
              value={inspectionReport}
              onChangeText={setInspectionReport}
              placeholder="Add inspection notes or upload details..."
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>
      );
    }
    if (serviceType === "work_and_pay") {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work & Pay Terms</Text>
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1, marginRight: 12 }]}>
              <Text style={styles.label}>Down payment (%)</Text>
              <TextInput
                style={styles.input}
                value={downPaymentPercent}
                onChangeText={setDownPaymentPercent}
                placeholder="e.g. 20"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
              />
            </View>
            <View style={[styles.field, { flex: 1, marginLeft: 12 }]}>
              <Text style={styles.label}>Term (months)</Text>
              <TextInput
                style={styles.input}
                value={termMonths}
                onChangeText={setTermMonths}
                placeholder="e.g. 24"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
              />
            </View>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Total payable (GHS)</Text>
            <TextInput
              style={styles.input}
              value={totalPayable}
              onChangeText={setTotalPayable}
              placeholder="e.g. 150000"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
            />
          </View>
          <TouchableOpacity style={styles.toggleRow} onPress={() => setEarlyBuyout(!earlyBuyout)}>
            <View style={[styles.toggleBox, earlyBuyout && styles.toggleBoxActive]}>
              {earlyBuyout && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
            </View>
            <Text style={styles.toggleLabel}>Allow early buyout</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (serviceType === "chauffeur") {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chauffeur Options</Text>
          <TouchableOpacity style={styles.toggleRow} onPress={() => setDriverIncluded(!driverIncluded)}>
            <View style={[styles.toggleBox, driverIncluded && styles.toggleBoxActive]}>
              {driverIncluded && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
            </View>
            <Text style={styles.toggleLabel}>Driver included in price</Text>
          </TouchableOpacity>
          <View style={styles.field}>
            <Text style={styles.label}>Driver daily rate (GHS)</Text>
            <TextInput
              style={styles.input}
              value={driverRate}
              onChangeText={setDriverRate}
              placeholder="e.g. 200"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
            />
          </View>
        </View>
      );
    }
    if (serviceType === "event") {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Details</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Occasion type</Text>
            <View style={styles.chipRow}>
              {OCCASION_TYPES.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.chip, occasionType === opt && styles.chipActive]}
                  onPress={() => setOccasionType(opt)}
                >
                  <Text style={[styles.chipText, occasionType === opt && styles.chipTextActive]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Package inclusions</Text>
            <TextInput
              style={[styles.input, { minHeight: 80 }]}
              value={packageInclusions}
              onChangeText={setPackageInclusions}
              placeholder="Decorations, refreshments, coordinator, etc."
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>
      );
    }
    if (serviceType === "fleet") {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fleet Leasing Details</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Fleet size</Text>
            <TextInput
              style={styles.input}
              value={fleetSize}
              onChangeText={setFleetSize}
              placeholder="e.g. 5"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Contract terms</Text>
            <TextInput
              style={[styles.input, { minHeight: 80 }]}
              value={contractTerms}
              onChangeText={setContractTerms}
              placeholder="Minimum contract length, mileage limits, etc."
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>
      );
    }
    return null;
  };

  if (published) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.publishedScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.publishedIconRow}>
            <View style={styles.publishedIcon}>
              <Ionicons name="checkmark" size={36} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.publishedTitle}>Congratulations!</Text>
          <Text style={styles.publishedSubtitle}>Your listing is live. Here&apos;s what to do next.</Text>

          <View style={styles.checklistCard}>
            <View style={styles.checklistItem}>
              <View style={styles.checklistIconDone}>
                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              </View>
              <View style={styles.checklistTextWrap}>
                <Text style={styles.checklistTitle}>Listing published</Text>
                <Text style={styles.checklistDesc}>Your vehicle is now visible to clients.</Text>
              </View>
            </View>
            <View style={styles.checklistItem}>
              <View style={styles.checklistIconPending}>
                <Ionicons name="calendar-outline" size={18} color="#FFFFFF" />
              </View>
              <View style={styles.checklistTextWrap}>
                <Text style={styles.checklistTitle}>Set up your calendar</Text>
                <Text style={styles.checklistDesc}>Block unavailable dates and set your availability.</Text>
              </View>
            </View>
            <View style={styles.checklistItem}>
              <View style={styles.checklistIconPending}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#FFFFFF" />
              </View>
              <View style={styles.checklistTextWrap}>
                <Text style={styles.checklistTitle}>Verify your account</Text>
                <Text style={styles.checklistDesc}>Upload ID, license, and police clearance.</Text>
              </View>
            </View>
            <View style={styles.checklistItem}>
              <View style={styles.checklistIconPending}>
                <Ionicons name="camera-outline" size={18} color="#FFFFFF" />
              </View>
              <View style={styles.checklistTextWrap}>
                <Text style={styles.checklistTitle}>Add profile photo</Text>
                <Text style={styles.checklistDesc}>Complete your owner profile.</Text>
              </View>
            </View>
            <View style={styles.checklistItem}>
              <View style={styles.checklistIconPending}>
                <Ionicons name="call-outline" size={18} color="#FFFFFF" />
              </View>
              <View style={styles.checklistTextWrap}>
                <Text style={styles.checklistTitle}>Confirm phone number</Text>
                <Text style={styles.checklistDesc}>Help clients reach you easily.</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace("/(owner)/listings")}>
            <Text style={styles.primaryButtonText}>Go to my listings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.replace("/(owner)/calendar")}>
            <Text style={styles.secondaryButtonText}>Set up calendar</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity hitSlop={8} onPress={prevStep}>
          <Ionicons name="arrow-back" size={24} color={NAVY} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>{stepTitles[step]}</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.progressRow}>
        {stepTitles.map((_, i) => (
          <View
            key={i}
            style={[styles.progressDot, i <= step && styles.progressDotActive]}
          />
        ))}
      </View>

      {step === 0 ? (
        <View style={styles.introLayout}>
          <View style={styles.introContent}>
            <IntroStep />
          </View>
          <View style={styles.introFooter}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={nextStep}
              disabled={!canProceed()}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.stepLayout}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={[
                styles.stepContent,
                {
                  transform: [
                    {
                      translateX: slideAnim.interpolate({
                        inputRange: [-1, 0, 1],
                        outputRange: [-screenWidth, 0, screenWidth],
                      }),
                    },
                  ],
                },
              ]}
            >
              {/* STEP 2 - Service type */}
              {step === 2 && (
              <View style={styles.section}>
              <Text style={styles.sectionTitle}>How Do You Want To List Your Vehicle?</Text>
              <Text style={styles.sectionHelper}>Choose the service that best fits what you&apos;re offering.</Text>
              {SERVICE_TYPES.map((svc) => (
              <TouchableOpacity
                key={svc.id}
                style={[styles.serviceCard, serviceType === svc.id && styles.serviceCardActive]}
                onPress={() => {
                  setServiceType(svc.id);
                  nextStep();
                }}
              >
                <View style={styles.serviceLeft}>
                  <View style={[styles.serviceIconBox, serviceType === svc.id && styles.serviceIconBoxActive]}>
                    <Ionicons name={svc.icon as any} size={22} color={serviceType === svc.id ? "#FFFFFF" : NAVY} />
                  </View>
                  <View>
                    <Text style={[styles.serviceLabel, serviceType === svc.id && styles.serviceLabelActive]}>{svc.label}</Text>
                    <Text style={styles.serviceDesc}>{svc.desc}</Text>
                  </View>
                </View>
                <View style={[styles.radioOuter, serviceType === svc.id && styles.radioOuterActive]}>
                  {serviceType === svc.id && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* STEP 3 - Vehicle Details */}
        {step === 3 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Give It A Title</Text>
            <View style={styles.field}>
              <Text style={styles.label}>Listing title</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. 2022 Toyota Hilux - Double Cab"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <Text style={styles.sectionTitle}>Make & Model</Text>
            <View style={styles.row}>
              <View style={[styles.field, { flex: 1, marginRight: 12 }]}>
                <Text style={styles.label}>Make</Text>
                <TextInput
                  style={styles.input}
                  value={make}
                  onChangeText={setMake}
                  placeholder="Toyota"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View style={[styles.field, { flex: 1, marginLeft: 12 }]}>
                <Text style={styles.label}>Model</Text>
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
              <View style={[styles.field, { flex: 1, marginRight: 12 }]}>
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
              <View style={[styles.field, { flex: 1, marginLeft: 12 }]}>
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

            {serviceType === "rent" || serviceType === "chauffeur" || serviceType === "event" || serviceType === "fleet" ? (
              <View style={styles.field}>
                <Text style={styles.label}>License plate</Text>
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
            ) : null}

            {renderServiceSpecificFields()}
          </View>
        )}

        {/* STEP 4 - Specs & Features */}
        {step === 4 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transmission</Text>
            <View style={styles.chipRow}>
              {TRANSMISSION_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.chip, transmission === opt && styles.chipActive]}
                  onPress={() => setTransmission(opt)}
                >
                  <Text style={[styles.chipText, transmission === opt && styles.chipTextActive]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Fuel Type</Text>
            <View style={styles.chipRow}>
              {FUEL_TYPE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.chip, fuelType === opt && styles.chipActive]}
                  onPress={() => setFuelType(opt)}
                >
                  <Text style={[styles.chipText, fuelType === opt && styles.chipTextActive]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Capacity</Text>
            <View style={styles.row}>
              <View style={[styles.field, { flex: 1, marginRight: 12 }]}>
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
              <View style={[styles.field, { flex: 1, marginLeft: 12 }]}>
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

            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.toggleGrid}>
              <TouchableOpacity style={styles.toggleCard} onPress={() => setHasAc(!hasAc)}>
                <View style={[styles.toggleBox, hasAc && styles.toggleBoxActive]}>
                  {hasAc && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                </View>
                <Text style={styles.toggleLabel}>Air conditioning</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.toggleCard} onPress={() => setHasGps(!hasGps)}>
                <View style={[styles.toggleBox, hasGps && styles.toggleBoxActive]}>
                  {hasGps && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                </View>
                <Text style={styles.toggleLabel}>GPS navigation</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Features</Text>
            <View style={styles.field}>
              <View style={styles.featureInputRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={featureText}
                  onChangeText={setFeatureText}
                  placeholder="Add a feature (e.g. Bluetooth, Leather seats)"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity style={styles.addFeatureButton} onPress={addFeature}>
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              {features.length > 0 && (
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
              )}
            </View>
          </View>
        )}

        {/* STEP 1 - Photos */}
        {step === 1 && (
          <View style={[styles.section, styles.photoSection]}>
            <Text style={styles.sectionTitle}>Vehicle Photos</Text>
            <Text style={styles.sectionHelper}>Add at least 3 photos. The first photo will be the cover image.</Text>

            {images.length === 0 ? (
              <TouchableOpacity style={styles.photoUploadCard} onPress={handleImageUpload} disabled={automationLoading}>
                {automationLoading ? (
                  <View style={styles.automationLoader} />
                ) : (
                  <>
                    <View style={styles.photoUploadIcon}>
                      <Ionicons name="camera-outline" size={32} color={NAVY} />
                    </View>
                    <Text style={styles.photoUploadTitle}>Upload photos</Text>
                    <Text style={styles.photoUploadHint}>Tap to add up to 5 photos</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <View>
                <View style={styles.photoCoverRow}>
                  <Image source={{ uri: images[0] }} style={styles.photoCoverImage} contentFit="cover" />
                  <View style={styles.photoCoverOverlay}>
                    <Text style={styles.photoCoverLabel}>Cover photo</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.photoCoverDelete}
                    onPress={() => setImages(images.filter((_, i) => i !== 0))}
                  >
                    <Ionicons name="close-circle" size={24} color="#EF4444" />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.photoRowContent}
                >
                  {images.slice(1).map((uri, idx) => (
                    <TouchableOpacity
                      key={idx + 1}
                      style={styles.photoThumb}
                      onPress={() => setSelectedImageIndex(idx + 1)}
                    >
                      <Image source={{ uri }} style={styles.photoThumbImage} contentFit="cover" />
                      <TouchableOpacity
                        style={styles.photoThumbDelete}
                        onPress={() => setImages(images.filter((_, i) => i !== idx + 1))}
                      >
                        <Ionicons name="close-circle" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                  {images.length < 5 && (
                    <TouchableOpacity style={styles.photoAddMore} onPress={handleImageUpload} disabled={automationLoading}>
                      <Ionicons name="add-outline" size={28} color="#9CA3AF" />
                      <Text style={styles.photoAddMoreText}>Add more</Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>

                <Text style={styles.photoCountText}>
                  {images.length} of 5 photos uploaded
                  {images.length < 3 && <Text style={styles.photoCountWarning}> (minimum 3 required)</Text>}
                </Text>
              </View>
            )}

            {automationLoading && analysisProgress ? (
              <View style={styles.analysisProgressRow}>
                <View style={styles.progressBar}>
                  <View style={styles.progressFill} />
                </View>
                <Text style={styles.analysisProgress}>{analysisProgress}</Text>
              </View>
            ) : null}
          </View>
        )}

        {/* STEP 5 - Pricing */}
        {step === 5 && (
          <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rental Rates</Text>
            <View style={styles.field}>
              <Text style={styles.label}>
                {serviceType === "sell" ? "Selling price (GHS) *" : "Price per day (GHS) *"}
              </Text>
              <View style={styles.priceRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={pricePerDay}
                  onChangeText={setPricePerDay}
                  placeholder={serviceType === "sell" ? "50000" : "500"}
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                />
                <TouchableOpacity style={styles.suggestButton} onPress={handlePriceSuggestion} disabled={automationLoading}>
                  <Ionicons name="bulb-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.suggestButtonText}>Suggest</Text>
                </TouchableOpacity>
              </View>
            </View>

            {serviceType === "rent" && (
              <>
                <View style={styles.row}>
                  <View style={[styles.field, { flex: 1, marginRight: 12 }]}>
                    <Text style={styles.label}>Price per week (GHS)</Text>
                    <TextInput
                      style={styles.input}
                      value={pricePerWeek}
                      onChangeText={setPricePerWeek}
                      placeholder="3000"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="number-pad"
                    />
                  </View>
                  <View style={[styles.field, { flex: 1, marginLeft: 12 }]}>
                    <Text style={styles.label}>Price per month (GHS)</Text>
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
              </>
            )}

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1, marginRight: 12 }]}>
                <Text style={styles.label}>Security deposit (GHS)</Text>
                <TextInput
                  style={styles.input}
                  value={securityDeposit}
                  onChangeText={setSecurityDeposit}
                  placeholder="1000"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                />
              </View>
              <View style={[styles.field, { flex: 1, marginLeft: 12 }]}>
                <Text style={styles.label}>Min. rental days</Text>
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

            {serviceType === "rent" && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Discounts & Adjustments</Text>
                <View style={styles.toggleRow}>
                  <TouchableOpacity style={styles.toggleCard} onPress={() => setWeekendPricingEnabled(!weekendPricingEnabled)}>
                    <View style={styles.toggleBox}>
                      {weekendPricingEnabled && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                    </View>
                    <Text style={styles.toggleLabel}>Weekend pricing</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={weekendPricingPercent}
                    onChangeText={setWeekendPricingPercent}
                    placeholder="%"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                  />
                </View>
                <View style={styles.toggleRow}>
                  <TouchableOpacity style={styles.toggleCard} onPress={() => setMonthlyDiscountEnabled(!monthlyDiscountEnabled)}>
                    <View style={styles.toggleBox}>
                      {monthlyDiscountEnabled && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                    </View>
                    <Text style={styles.toggleLabel}>Monthly discount</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={monthlyDiscountPercent}
                    onChangeText={setMonthlyDiscountPercent}
                    placeholder="%"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                  />
                </View>
                <View style={styles.toggleRow}>
                  <TouchableOpacity style={styles.toggleCard} onPress={() => setWeeklyDiscountEnabled(!weeklyDiscountEnabled)}>
                    <View style={styles.toggleBox}>
                      {weeklyDiscountEnabled && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                    </View>
                    <Text style={styles.toggleLabel}>Weekly discount</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={weeklyDiscountPercent}
                    onChangeText={setWeeklyDiscountPercent}
                    placeholder="%"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                  />
                </View>
                <View style={styles.toggleRow}>
                  <TouchableOpacity style={styles.toggleCard} onPress={() => setLastMinuteDiscountEnabled(!lastMinuteDiscountEnabled)}>
                    <View style={styles.toggleBox}>
                      {lastMinuteDiscountEnabled && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                    </View>
                    <Text style={styles.toggleLabel}>Last-minute discount</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={lastMinuteDiscountPercent}
                    onChangeText={setLastMinuteDiscountPercent}
                    placeholder="%"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                  />
                </View>
                <TouchableOpacity style={styles.toggleRow} onPress={() => setNewListingPromotionEnabled(!newListingPromotionEnabled)}>
                  <View style={styles.toggleBox}>
                    {newListingPromotionEnabled && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                  </View>
                  <Text style={styles.toggleLabel}>New listing promotion</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* STEP 6 - Location & Delivery */}
        {step === 6 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Where Is Your Vehicle Based?</Text>
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

            <TouchableOpacity style={styles.toggleRow} onPress={() => setShowPreciseLocation(!showPreciseLocation)}>
              <View style={[styles.toggleBox, showPreciseLocation && styles.toggleBoxActive]}>
                {showPreciseLocation && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
              </View>
              <View>
                <Text style={styles.toggleLabel}>Show precise location</Text>
                <Text style={styles.toggleLabelHelper}>Guests will see the exact address after booking.</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toggleRow} onPress={() => setDeliveryAvailable(!deliveryAvailable)}>
              <View style={[styles.toggleBox, deliveryAvailable && styles.toggleBoxActive]}>
                {deliveryAvailable && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
              </View>
              <View>
                <Text style={styles.toggleLabel}>Delivery available</Text>
                <Text style={styles.toggleLabelHelper}>You can deliver the vehicle to the guest.</Text>
              </View>
            </TouchableOpacity>
            {deliveryAvailable && (
              <View style={styles.field}>
                <Text style={styles.label}>Delivery fee (GHS)</Text>
                <TextInput
                  style={styles.input}
                  value={deliveryFee}
                  onChangeText={setDeliveryFee}
                  placeholder="e.g. 50"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                />
              </View>
            )}
          </View>
        )}

        {/* STEP 7 - Booking Settings */}
        {step === 7 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Booking Type</Text>
            <Text style={styles.sectionHelper}>Choose how guests can book your vehicle.</Text>
            {BOOKING_MODES.map((mode) => (
              <TouchableOpacity
                key={mode.value}
                style={[styles.bookingModeCard, bookingMode === mode.value && styles.bookingModeCardActive]}
                onPress={() => setBookingMode(mode.value as "request" | "instant")}
              >
                <View style={styles.bookingModeLeft}>
                  <View style={[styles.radioOuter, bookingMode === mode.value && styles.radioOuterActive]}>
                    {bookingMode === mode.value && <View style={styles.radioInner} />}
                  </View>
                  <View>
                    <Text style={[styles.bookingModeLabel, bookingMode === mode.value && styles.bookingModeLabelActive]}>
                      {mode.label}
                    </Text>
                    <Text style={styles.bookingModeDesc}>{mode.desc}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            <Text style={styles.sectionTitle}>Advance Notice</Text>
            <Text style={styles.sectionHelper}>How much notice do you need before a booking starts?</Text>
            <View style={styles.chipRow}>
              {ADVANCE_NOTICE.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.chip, advanceNotice === opt.value && styles.chipActive]}
                  onPress={() => setAdvanceNotice(opt.value)}
                >
                  <Text style={[styles.chipText, advanceNotice === opt.value && styles.chipTextActive]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Minimum Trip Duration</Text>
            <View style={styles.field}>
              <Text style={styles.label}>Minimum rental days</Text>
              <TextInput
                style={styles.input}
                value={tripMinDays}
                onChangeText={setTripMinDays}
                placeholder="1"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
              />
            </View>
          </View>
        )}

        {/* STEP 8 - Review & Publish */}
        {step === 8 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Review Your Listing</Text>
            <Text style={styles.sectionHelper}>Here&apos;s what guests will see. Make sure everything looks good.</Text>

            <View style={styles.reviewCard}>
              <View style={styles.reviewImageContainer}>
                {images.length > 0 ? (
                  <Image
                    source={{ uri: images[selectedImageIndex] }}
                    style={styles.reviewMainImage}
                    contentFit="cover"
                  />
                ) : (
                  <View style={styles.reviewImagePlaceholder}>
                    <Ionicons name="car-outline" size={48} color="#9CA3AF" />
                    <Text style={styles.reviewImagePlaceholderText}>No photos uploaded</Text>
                  </View>
                )}
              </View>

              {images.length > 1 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.reviewThumbnailRow}
                >
                  {images.map((uri, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSelectedImageIndex(index)}
                      activeOpacity={0.8}
                    >
                      <Image
                        source={{ uri }}
                        style={[
                          styles.reviewThumbnail,
                          index === selectedImageIndex && styles.reviewThumbnailActive,
                        ]}
                        contentFit="cover"
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              <View style={styles.reviewDetails}>
                <Text style={styles.reviewTitle}>{title || "Untitled Listing"}</Text>
                <Text style={styles.reviewCategory}>{SERVICE_TYPES.find(s => s.id === serviceType)?.label}</Text>
                <Text style={styles.reviewSubtitle}>
                  {category} · {make} {model} · {year || "N/A"} · {color || ""}
                </Text>
                <Text style={styles.reviewPrice}>
                  GHS {pricePerDay || "0"}{serviceType === "sell" ? "" : "/day"}
                  {pricePerWeek && serviceType === "rent" ? ` · GHS ${pricePerWeek}/week` : ""}
                  {pricePerMonth && serviceType === "rent" ? ` · GHS ${pricePerMonth}/month` : ""}
                </Text>
                <Text style={styles.reviewLocation}>
                  {city}, {region}
                </Text>
                <View style={styles.reviewSpecsRow}>
                  <View style={styles.reviewSpecItem}>
                    <Ionicons name="settings-outline" size={16} color="#6B7280" />
                    <Text style={styles.reviewSpecText}>
                      {transmission} · {fuelType}
                    </Text>
                  </View>
                  <View style={styles.reviewSpecItem}>
                    <Ionicons name="people-outline" size={16} color="#6B7280" />
                    <Text style={styles.reviewSpecText}>
                      {seats || "?"} seats · {doors || "?"} doors
                    </Text>
                  </View>
                </View>
                <View style={styles.reviewAmenitiesRow}>
                  {hasAc && (
                    <View style={styles.reviewAmenityChip}>
                      <Ionicons name="snow-outline" size={14} color="#6B7280" />
                      <Text style={styles.reviewAmenityText}>AC</Text>
                    </View>
                  )}
                  {hasGps && (
                    <View style={styles.reviewAmenityChip}>
                      <Ionicons name="map-outline" size={14} color="#6B7280" />
                      <Text style={styles.reviewAmenityText}>GPS</Text>
                    </View>
                  )}
                  {features.map((feature) => (
                    <View key={feature} style={styles.reviewFeatureChip}>
                      <Text style={styles.reviewFeatureChipText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
           </View>
         )}
       </Animated.View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.primaryButton,
            !canProceed() && styles.primaryButtonDisabled,
            step === 8 && styles.primaryButtonPublish,
          ]}
          onPress={step === 8 ? handleSubmit : nextStep}
          disabled={!canProceed() || saving}
        >
          <Text style={styles.primaryButtonText}>
            {saving ? "Publishing..." : step === 8 ? "Publish listing" : "Continue"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
      )}
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
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitleWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "NAVY,",
  },
  saveExitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  saveExitText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  stepContent: {
    flex: 1,
  },
  stepLayout: {
    flex: 1,
  },
  introLayout: {
    flex: 1,
  },
  introContent: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 4,
  },
  introFooter: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  progressRow: {
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 20,
    marginBottom: 16,
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
    marginBottom: 28,
  },
  photoSection: {
    paddingTop: 60,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "NAVY,",
    marginBottom: 12,
    marginTop: 4,
  },
  sectionHelper: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 16,
    lineHeight: 18,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
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
    color: "NAVY,",
    backgroundColor: "#F9FAFB",
  },
  row: {
    flexDirection: "row",
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chipCard: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  chipCardActive: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  chipCardText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  chipCardTextActive: {
    color: "#FFFFFF",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
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
  toggleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  toggleCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    flex: 1,
    minWidth: "45%",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
  },
  toggleBox: {
    width: 22,
    height: 22,
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
    fontSize: 14,
    fontWeight: "500",
    color: "NAVY,",
  },
  toggleLabelHelper: {
    fontSize: 12,
    fontWeight: "400",
    color: "#6B7280",
    marginTop: 2,
  },
  featureInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
    gap: 4,
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
  serviceCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    marginBottom: 12,
  },
  serviceCardActive: {
    borderColor: NAVY,
    backgroundColor: "#F8FAFC",
  },
  serviceLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  serviceIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  serviceIconBoxActive: {
    backgroundColor: NAVY,
  },
  serviceLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "NAVY,",
  },
  serviceLabelActive: {
    color: NAVY,
  },
  serviceDesc: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 2,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterActive: {
    borderColor: NAVY,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: NAVY,
  },
  photoUploadCard: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 48,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    backgroundColor: "#F9FAFB",
  },
  photoUploadIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  photoUploadTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "NAVY,",
  },
  photoUploadHint: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  photoCoverRow: {
    position: "relative",
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
  },
  photoCoverImage: {
    width: "100%",
    height: "100%",
  },
  photoCoverOverlay: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  photoCoverLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  photoCoverDelete: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  photoRowContent: {
    paddingHorizontal: 0,
    gap: 10,
  },
  photoThumb: {
    width: 100,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  photoThumbImage: {
    width: "100%",
    height: "100%",
  },
  photoThumbDelete: {
    position: "absolute",
    top: 4,
    right: 4,
  },
  photoAddMore: {
    width: 100,
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
  photoAddMoreText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  photoCountText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 10,
  },
  photoCountWarning: {
    color: "#EF4444",
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
    color: "NAVY,",
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
    color: "NAVY,",
  },
  placeSecondaryText: {
    fontSize: 12,
    fontWeight: "400",
    color: "#6B7280",
    marginTop: 2,
  },
  bookingModeCard: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    marginBottom: 12,
  },
  bookingModeCardActive: {
    borderColor: NAVY,
    backgroundColor: "#F8FAFC",
  },
  bookingModeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  bookingModeLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "NAVY,",
  },
  bookingModeLabelActive: {
    color: NAVY,
  },
  bookingModeDesc: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 2,
  },
  analysisProgressRow: {
    marginTop: 12,
  },
  progressBar: {
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
  analysisProgress: {
    fontSize: 12,
    fontWeight: "600",
    color: NAVY,
    marginTop: 8,
  },
  automationLoader: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#E5E7EB",
    borderTopColor: NAVY,
  },
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  reviewImageContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#F3F4F6",
  },
  reviewMainImage: {
    width: "100%",
    height: "100%",
  },
  reviewImagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  reviewImagePlaceholderText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  reviewThumbnailRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    backgroundColor: "#F9FAFB",
  },
  reviewThumbnail: {
    width: 72,
    height: 72,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
  },
  reviewThumbnailActive: {
    borderColor: NAVY,
  },
  reviewDetails: {
    padding: 20,
    gap: 4,
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "NAVY,",
  },
  reviewCategory: {
    fontSize: 12,
    fontWeight: "700",
    color: NAVY,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  reviewSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  reviewPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: NAVY,
    marginTop: 4,
  },
  reviewLocation: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginTop: 4,
  },
  reviewSpecsRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
  },
  reviewSpecItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  reviewSpecText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  reviewAmenitiesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 12,
  },
  reviewAmenityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  reviewAmenityText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  reviewFeatureChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  reviewFeatureChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
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
  primaryButtonPublish: {
    backgroundColor: "#E11D48",
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  secondaryButton: {
    marginTop: 12,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
  },
  publishedScroll: {
    padding: 24,
    paddingBottom: 40,
  },
  publishedIconRow: {
    alignItems: "center",
    marginBottom: 16,
  },
  publishedIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  publishedTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "NAVY,",
    textAlign: "center",
    marginBottom: 8,
  },
  publishedSubtitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 12,
  },
  checklistCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 20,
    marginBottom: 12,
    gap: 16,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  checklistIconDone: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  checklistIconPending: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: NAVY,
    alignItems: "center",
    justifyContent: "center",
  },
  checklistTextWrap: {
    flex: 1,
  },
  checklistTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "NAVY,",
  },
  checklistDesc: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 2,
  },
  introSection: {
    paddingTop: 32,
    paddingHorizontal: 4,
    paddingBottom: 24,
    alignItems: "center",
  },
  introIllustration: {
    width: 220,
    height: 220,
    marginBottom: 12,
  },
  introStepLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  introTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "NAVY,",
    lineHeight: 40,
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  introHelper: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
    lineHeight: 24,
    alignSelf: "flex-start",
  },
});
