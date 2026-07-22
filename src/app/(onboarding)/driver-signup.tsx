import { useCallback, useRef, useState } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
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

type Gender = "male" | "female" | "other" | "";

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export default function DriverSignupScreen() {
  const setDriverOnboardingData = useDriverOnboardingStore(
    (s) => s.setPersonalInfo,
  );
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<Gender>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [atEnd, setAtEnd] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = useCallback(
    (event: any) => {
      const { layoutMeasurement, contentOffset, contentSize } =
        event.nativeEvent;
      const isEnd =
        layoutMeasurement.height + contentOffset.y >= contentSize.height - 8;
      setAtEnd(isEnd);
    },
    [],
  );

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!phone.trim()) newErrors.phone = "Phone number is required";
    if (!gender) newErrors.gender = "Gender is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validate()) {
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error,
      );
      return;
    }

    Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success,
    );

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    setDriverOnboardingData(fullName, false, "");

    router.push("/(onboarding)/driver-signup-success" as any);
  };

  const canProceed =
    firstName.trim().length > 0 &&
    phone.trim().length > 0 &&
    gender !== "";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={Platform.OS === "ios"}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>
        </View>

        {/* ── Title ── */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Provide Basic Info</Text>
          <Text style={styles.subtitle}>
            Enter your information to create account
          </Text>
        </View>

        {/* ── Form ── */}
        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>First Name</Text>
              <Text style={styles.requiredStar}>*</Text>
            </View>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIcon}>
                <Ionicons name="person-outline" size={18} color="#6E7E91" />
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your first name"
                placeholderTextColor="#6E7E91"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>
            {errors.firstName && (
              <Text style={styles.errorText}>{errors.firstName}</Text>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Last Name</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIcon}>
                <Ionicons name="person-outline" size={18} color="#6E7E91" />
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your last name"
                placeholderTextColor="#6E7E91"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>Phone</Text>
              <Text style={styles.requiredStar}>*</Text>
            </View>
            <View style={styles.inputWrapper}>
              <Pressable style={styles.countryButton}>
                <Text style={styles.flag}>🇬🇭</Text>
                <Text style={styles.countryCode}>+233</Text>
              </Pressable>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your phone number"
                placeholderTextColor="#6E7E91"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                returnKeyType="next"
              />
            </View>
            {errors.phone && (
              <Text style={styles.errorText}>{errors.phone}</Text>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Gender</Text>
            <Pressable
              style={styles.inputWrapper}
              onPress={() => {
                Haptics.impactAsync(
                  Haptics.ImpactFeedbackStyle.Light,
                );
                setShowGenderModal(true);
              }}
            >
              <View style={styles.inputIcon}>
                <View style={styles.genderQuestionIcon}>
                  <Text style={styles.genderQuestionText}>?</Text>
                </View>
              </View>
              <View style={styles.genderRow}>
                <Text
                  style={[
                    styles.genderText,
                    !gender && styles.genderPlaceholder,
                  ]}
                >
                  {gender === "" ? "Select Gender" : gender}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#6E7E91" />
              </View>
            </Pressable>
            {errors.gender && (
              <Text style={styles.errorText}>{errors.gender}</Text>
            )}
          </View>
        </View>

        {atEnd && (
          <View style={styles.endIndicator}>
            <View style={styles.endPill} />
          </View>
        )}
      </ScrollView>

      {/* ── Gender Picker Modal ── */}
      <Modal
        visible={showGenderModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGenderModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowGenderModal(false)}
        >
          <View style={styles.modalContent}>
            {GENDER_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.modalOption,
                  gender === option.value && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  Haptics.impactAsync(
                    Haptics.ImpactFeedbackStyle.Light,
                  );
                  setGender(option.value);
                  setShowGenderModal(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    gender === option.value && styles.modalOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {gender === option.value && (
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
          title="Next"
          onPress={handleNext}
          disabled={!canProceed}
        />
      </View>
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
    paddingHorizontal: 8,
    paddingTop: 0,
    paddingBottom: 8,
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
    fontSize: 30,
    fontWeight: "800",
    color: "#2C3E5B",
    textAlign: "center",
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 14,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  form: {
    gap: 18,
    marginTop: 8,
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2C3E5B",
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
  countryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: "#EAE1D9",
    paddingVertical: 4,
  },
  flag: {
    fontSize: 16,
  },
  countryCode: {
    fontSize: 14,
    color: "#2C3E5B",
    fontWeight: "500",
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
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  requiredStar: {
    fontSize: 14,
    color: "#FF7B54",
    fontWeight: "700",
  },
  genderQuestionIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F5ECE5",
    alignItems: "center",
    justifyContent: "center",
  },
  genderQuestionText: {
    fontSize: 14,
    color: "#6E7E91",
    fontWeight: "700",
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
    textTransform: "capitalize",
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
