import { useCallback, useMemo, useRef, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton } from "@/components/ui";
import { useDriverOnboardingStore } from "@/store/useDriverOnboardingStore";
import { Image } from "expo-image";
import { useSlideEntrance } from "@/hooks/useSlideEntrance";

type IdType = "national_id" | "passport" | "drivers_license" | "";
type Ownership = "personal" | "work_pay" | "";
type ImageTarget = "profile" | "idFront";

const ID_TYPES: { value: IdType; label: string }[] = [
  { value: "national_id", label: "National ID" },
  { value: "passport", label: "Passport" },
  { value: "drivers_license", label: "Driver's License" },
];

export default function DriverIdentityScreen() {
  const setIdentityInfo = useDriverOnboardingStore(
    (s) => s.setIdentityInfo,
  );
  const [address, setAddress] = useState("");
  const [idType, setIdType] = useState<IdType>("");
  const [idNumber, setIdNumber] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showIdTypeModal, setShowIdTypeModal] = useState(false);
  const [atEnd, setAtEnd] = useState(false);
  const [ownership, setOwnership] = useState<Ownership>("");
  const [profileUri, setProfileUri] = useState<string | null>(null);
  const [idFrontUris, setIdFrontUris] = useState<string[]>([]);
  const scrollRef = useRef<ScrollView>(null);

  const formFields = useMemo(
    () => [
      { key: "address", label: "Address", required: true },
      { key: "identityType", label: "Identity Type", required: true },
      { key: "idNumber", label: "Identification Number", required: true },
      { key: "uploads", label: "Uploads", required: false },
      { key: "ownership", label: "Vehicle Ownership", required: true },
    ],
    [],
  );

  const { anims, start } = useSlideEntrance({
    count: formFields.length,
    direction: "left",
    initialDelay: 150,
    staggerDelay: 90,
  });

  useFocusEffect(
    useCallback(() => {
      start();
    }, [start]),
  );

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access media library is required.");
      return false;
    }
    return true;
  };

  const handleImagePick = async (target: ImageTarget) => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (target === "profile") setProfileUri(uri);
      else if (target === "idFront") setIdFrontUris((prev) => [...prev, uri]);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!address.trim()) newErrors.address = "Address is required";
    if (!idType) newErrors.idType = "Identity type is required";
    if (!idNumber.trim()) newErrors.idNumber = "ID number is required";
    if (!ownership) newErrors.ownership = "Vehicle ownership is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error,
      );
      return;
    }

    Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success,
    );

    setIdentityInfo("", address, idType, idNumber);

    router.push("/(auth)/sign-in?from=driver-identity");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Fixed Header ── */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={Platform.OS === "ios"}
          alwaysBounceVertical={Platform.OS === "ios"}
          overScrollMode="always"
          onScroll={(e) => {
            const { layoutMeasurement, contentOffset, contentSize } =
              e.nativeEvent;
            setAtEnd(
              layoutMeasurement.height + contentOffset.y >=
                contentSize.height - 8,
            );
          }}
          scrollEventThrottle={16}
        >
        {/* ── Title ── */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Provide Your Identity</Text>
          <Text style={styles.subtitleTop}>
            This information will help to confirm your identity
          </Text>
        </View>

        {/* ── Profile Photo ── */}
        <View style={styles.photoContainer}>
          <Pressable
            style={styles.photoCirclePressable}
            onPress={() => handleImagePick("profile")}
          >
            <View style={styles.photoCircle}>
              {profileUri ? (
                <Image
                  source={{ uri: profileUri }}
                  style={styles.photoImage}
                  contentFit="cover"
                />
              ) : (
                <Ionicons name="person" size={48} color="#6E7E91" />
              )}
            </View>
            <View style={styles.photoBadge}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </View>
          </Pressable>
        </View>

        {/* ── Form ── */}
        <View style={styles.form}>
          <Animated.View
            style={[
              styles.animatedField,
              {
                opacity: anims[0].opacity,
                transform: [{ translateX: anims[0].translate }],
              },
            ]}
          >
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>Address</Text>
                <Text style={styles.requiredStar}>*</Text>
              </View>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIcon}>
                  <Ionicons name="location-outline" size={18} color="#6E7E91" />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your address"
                  placeholderTextColor="#6E7E91"
                  value={address}
                  onChangeText={setAddress}
                  returnKeyType="next"
                />
              </View>
              {errors.address && (
                <Text style={styles.errorText}>{errors.address}</Text>
              )}
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.animatedField,
              {
                opacity: anims[1].opacity,
                transform: [{ translateX: anims[1].translate }],
              },
            ]}
          >
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>Identity Type</Text>
                <Text style={styles.requiredStar}>*</Text>
              </View>
              <Pressable
                style={styles.inputWrapper}
                onPress={() => {
                  Haptics.impactAsync(
                    Haptics.ImpactFeedbackStyle.Light,
                  );
                  setShowIdTypeModal(true);
                }}
              >
                <View style={styles.inputIcon}>
                  <Ionicons name="card-outline" size={18} color="#6E7E91" />
                </View>
                <View style={styles.genderRow}>
                  <Text
                    style={[
                      styles.genderText,
                      !idType && styles.genderPlaceholder,
                    ]}
                  >
                    {idType === ""
                      ? "Select identity type"
                      : ID_TYPES.find((t) => t.value === idType)?.label}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color="#6E7E91" />
                </View>
              </Pressable>
              {errors.idType && (
                <Text style={styles.errorText}>{errors.idType}</Text>
              )}
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.animatedField,
              {
                opacity: anims[2].opacity,
                transform: [{ translateX: anims[2].translate }],
              },
            ]}
          >
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>Identification Number</Text>
                <Text style={styles.requiredStar}>*</Text>
              </View>
              <View style={styles.inputWrapper}>
                <View style={styles.inputIcon}>
                  <Ionicons
                    name="document-text-outline"
                    size={18}
                    color="#6E7E91"
                  />
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your identity number"
                  placeholderTextColor="#6E7E91"
                  value={idNumber}
                  onChangeText={setIdNumber}
                  returnKeyType="next"
                />
              </View>
              {errors.idNumber && (
                <Text style={styles.errorText}>{errors.idNumber}</Text>
              )}
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.animatedField,
              {
                opacity: anims[3].opacity,
                transform: [{ translateX: anims[3].translate }],
              },
            ]}
          >
            {/* ── Upload Identity Image Front ── */}
            <View style={styles.uploadSection}>
              <View style={styles.labelRow}>
                <Text style={styles.uploadLabel}>Upload Identity Image</Text>
                <Text style={styles.requiredStar}>*</Text>
              </View>
              <Text style={styles.uploadHint}>
                png, jpg, jpeg, gif, webp File size : max 2.0 MB
              </Text>

              {idFrontUris.map((uri, index) => (
                <View key={index} style={styles.uploadedImageContainer}>
                  <Image
                    source={{ uri }}
                    style={styles.uploadedImage}
                    contentFit="cover"
                  />
                  <Pressable
                    style={styles.removeImageButton}
                    onPress={() => setIdFrontUris((prev) => prev.filter((_, i) => i !== index))}
                  >
                    <Ionicons name="close-circle" size={24} color="#EF4444" />
                  </Pressable>
                </View>
              ))}

              <Pressable
                style={styles.uploadBox}
                onPress={() => handleImagePick("idFront")}
              >
                <Ionicons name="images-outline" size={32} color="#6E7E91" />
                <Text style={styles.uploadText}>Click to Add</Text>
              </Pressable>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.animatedField,
              {
                opacity: anims[4].opacity,
                transform: [{ translateX: anims[4].translate }],
              },
            ]}
          >
            {/* ── Vehicle Ownership ── */}
            <View style={styles.uploadSection}>
              <View style={styles.labelRow}>
                <Text style={styles.uploadLabel}>Vehicle Ownership</Text>
                <Text style={styles.requiredStar}>*</Text>
              </View>
              <View style={styles.ownershipRow}>
                <Pressable
                  style={[
                    styles.ownershipCard,
                    ownership === "personal" && styles.ownershipCardSelected,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(
                      Haptics.ImpactFeedbackStyle.Light,
                    );
                    setOwnership("personal");
                  }}
                >
                  <View style={styles.ownershipIconRow}>
                    <View style={styles.ownershipIcon}>
                      <Ionicons name="person" size={20} color="#6E7E91" />
                    </View>
                    {ownership === "personal" && (
                      <View style={styles.ownershipCheck}>
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      </View>
                    )}
                  </View>
                  <Text style={styles.ownershipTitle}>Personal Vehicle</Text>
                  <Text style={styles.ownershipSubtitle}>I own this vehicle</Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.ownershipCard,
                    ownership === "work_pay" && styles.ownershipCardSelected,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(
                      Haptics.ImpactFeedbackStyle.Light,
                    );
                    setOwnership("work_pay");
                  }}
                >
                  <View style={styles.ownershipIconRow}>
                    <View style={styles.ownershipIcon}>
                      <Ionicons name="car" size={20} color="#6E7E91" />
                    </View>
                    {ownership === "work_pay" && (
                      <View style={styles.ownershipCheck}>
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      </View>
                    )}
                  </View>
                  <Text style={styles.ownershipTitle}>Work & Pay</Text>
                  <Text style={styles.ownershipSubtitle}>Pay weekly to own</Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>
        </View>

        {atEnd && (
          <View style={styles.endIndicator}>
            <View style={styles.endPill} />
          </View>
        )}
      </ScrollView>

      {/* ── Identity Type Modal ── */}
      <Modal
        visible={showIdTypeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowIdTypeModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowIdTypeModal(false)}
        >
          <View style={styles.modalContent}>
            {ID_TYPES.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.modalOption,
                  idType === option.value && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  Haptics.impactAsync(
                    Haptics.ImpactFeedbackStyle.Light,
                  );
                  setIdType(option.value);
                  setShowIdTypeModal(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    idType === option.value && styles.modalOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {idType === option.value && (
                  <Ionicons name="checkmark" size={20} color="#FF7B54" />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* ── Footer CTA ── */}
      <View style={styles.footer}>
        <PrimaryButton
          title="Submit"
          onPress={handleSubmit}
          disabled={
            !address.trim() ||
            !idType ||
            !idNumber.trim() ||
            !ownership ||
            idFrontUris.length === 0
          }
        />
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF8F3",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 26,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: "#FFF8F3",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  backArrow: {
    fontSize: 28,
    color: "#2C3E5B",
    fontWeight: "300",
    lineHeight: 28,
  },
  titleBlock: {
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2C3E5B",
    textAlign: "center",
    lineHeight: 34,
  },
  subtitleTop: {
    fontSize: 16,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  photoContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  photoCirclePressable: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  photoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: "#EAE1D9",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  photoImage: {
    width: "100%",
    height: "100%",
    borderRadius: 48,
  },
  photoBadge: {
    position: "absolute",
    bottom: -4,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FF7B54",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFF8F3",
  },
  form: {
    gap: 18,
    marginTop: 8,
  },
  animatedField: {
    flex: 0,
  },
  fieldGroup: {
    gap: 8,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2C3E5B",
  },
  requiredStar: {
    fontSize: 14,
    color: "#FF7B54",
    fontWeight: "700",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#EAE1D9",
    paddingHorizontal: 16,
    height: 56,
    gap: 12,
    backgroundColor: "#FFFFFF",
  },
  inputIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F5ECE5",
    alignItems: "center",
    justifyContent: "center",
  },
  textInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#2C3E5B",
  },
  genderText: {
    fontSize: 16,
    color: "#2C3E5B",
    textTransform: "capitalize",
  },
  genderPlaceholder: {
    color: "#6E7E91",
  },
  genderRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
  },
  uploadSection: {
    gap: 8,
  },
  uploadLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2C3E5B",
  },
  uploadHint: {
    fontSize: 12,
    color: "#6E7E91",
    lineHeight: 16,
  },
  uploadBox: {
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#EAE1D9",
    borderRadius: 16,
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
  },
  uploadText: {
    fontSize: 14,
    color: "#2C3E5B",
    fontWeight: "500",
  },
  uploadedImage: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    marginBottom: 12,
  },
  uploadedImageContainer: {
    position: "relative",
    marginBottom: 12,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  ownershipRow: {
    flexDirection: "row",
    gap: 12,
  },
  ownershipCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EAE1D9",
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
  },
  ownershipCardSelected: {
    borderWidth: 2,
    borderColor: "#FF7B54",
    backgroundColor: "#FFF8F3",
  },
  ownershipIconRow: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  ownershipIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F5ECE5",
    alignItems: "center",
    justifyContent: "center",
  },
  ownershipCheck: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FF7B54",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  ownershipTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E5B",
    textAlign: "center",
  },
  ownershipSubtitle: {
    fontSize: 12,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 16,
  },
  endIndicator: {
    alignItems: "center",
    paddingVertical: 12,
    opacity: 0.6,
  },
  endPill: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#2C3E5B",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#EAE1D9",
  },
  modalOptionSelected: {
    backgroundColor: "#FFF8F3",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#2C3E5B",
    fontWeight: "500",
  },
  modalOptionTextSelected: {
    color: "#FF7B54",
    fontWeight: "700",
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});
