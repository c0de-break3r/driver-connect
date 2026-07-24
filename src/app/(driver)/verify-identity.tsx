import { useState, useCallback } from "react";
import { Alert, Animated, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";

import { useDriverOnboardingStore } from "@/store/useDriverOnboardingStore";
import { useKycFlowStore } from "@/store/useKycFlowStore";
import { useSlideEntrance } from "@/hooks/useSlideEntrance";
import { api } from "@/lib/convexApi";
import { useAction, useQuery } from "convex/react";

const NAVY = "#2C3E5B";
const ORANGE = "#FF7B54";

const ID_TYPES = [
  { label: "Ghana Card", value: "national_id" },
  { label: "Passport", value: "passport" },
  { label: "Driver's License", value: "drivers_license" },
];

export default function VerifyIdentityScreen() {
  const {
    identityEmail,
    identityAddress,
    identityType,
    identityNumber,
    setIdentityInfo,
    selfieUri,
    setSelfieCapture,
    nationalIdFrontUri,
    nationalIdBackUri,
    setDocumentCapture,
    verificationPipelineStatus,
    setVerificationPipelineStatus,
    faceMatchPassed,
    setFaceMatchResult,
  } = useDriverOnboardingStore();

  const { setStatus, setDocumentCapture: setKycDocument } = useKycFlowStore();

  const [step, setStep] = useState(0);
  const [email, setEmail] = useState(identityEmail || "");
  const [address, setAddress] = useState(identityAddress || "");
  const [idType, setIdType] = useState(identityType || "");
  const [idNumber, setIdNumber] = useState(identityNumber || "");
  const [profileUri, setProfileUri] = useState<string | null>(selfieUri || null);
  const [idFrontUri, setIdFrontUri] = useState<string | null>(nationalIdFrontUri || null);
  const [idBackUri, setIdBackUri] = useState<string | null>(nationalIdBackUri || null);
  const [profileBase64, setProfileBase64] = useState<string>("");
  const [idFrontBase64, setIdFrontBase64] = useState<string>("");
  const [idBackBase64, setIdBackBase64] = useState<string>("");
  const [scanning, setScanning] = useState(false);
  const [verified, setVerified] = useState(
    verificationPipelineStatus === "confirmed" || faceMatchPassed === true,
  );
  const [showIdTypeModal, setShowIdTypeModal] = useState(false);

  const { anims, start } = useSlideEntrance({ count: 1, direction: "up" });

  const submitDocumentVerificationAction = useAction(api.verifications.submitDocumentVerification);
  const convexUser = useQuery(api.users.getByClerkUserId, identityEmail ? { clerkUserId: identityEmail } : "skip");

  useFocusEffect(
    useCallback(() => {
      start();
    }, [start]),
  );

  const requestPermission = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please allow access to your photos.");
      return false;
    }
    return true;
  }, []);

  const handleImagePick = useCallback(async (target: "profile" | "idFront" | "idBack") => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
      aspect: [4, 3],
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      const base64 = result.assets[0].base64 ?? "";
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (target === "profile") {
        setProfileUri(uri);
        setProfileBase64(base64);
      } else if (target === "idFront") {
        setIdFrontUri(uri);
        setIdFrontBase64(base64);
      } else {
        setIdBackUri(uri);
        setIdBackBase64(base64);
      }
    }
  }, [requestPermission]);

  const handleSubmitIdentity = () => {
    if (!email.trim() || !address.trim() || !idType || !idNumber.trim()) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }
    setIdentityInfo(email.trim(), address.trim(), idType as any, idNumber.trim());
    setStep(1);
  };

  const handleSubmitVerification = async () => {
    if (!profileBase64 || !idFrontBase64) {
      Alert.alert("Missing data", "Please capture all required images.");
      return;
    }

    if (!email.trim() || !address.trim() || !idType || !idNumber.trim()) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }

    setScanning(true);

    try {
      if (!convexUser) {
        throw new Error("User not found");
      }

      const result = await submitDocumentVerificationAction({
        userId: convexUser._id,
        documentType: idType,
        idNumber: idNumber.trim(),
        email: email.trim(),
        address: address.trim(),
        documentFront: idFrontBase64,
        documentBack: idBackBase64 || undefined,
        selfie: profileBase64 || undefined,
      });

      setSelfieCapture(profileUri ?? "");
      setDocumentCapture(idFrontUri ?? "", idBackUri ?? "", "", "");

      if (result.status === "confirmed") {
        setFaceMatchResult(true, result.confidence ?? 98);
        setVerificationPipelineStatus("confirmed");
        setStatus("confirmed");
        setVerified(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Verified", "Your identity has been verified successfully.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        setVerificationPipelineStatus("failed");
        setStatus("failed");
        Alert.alert(
          "Verification failed",
          "We could not verify your identity with the provided documents. Please try again with clearer images."
        );
      }
    } catch (e: any) {
      Alert.alert("Verification failed", e?.message ?? "Something went wrong. Please try again.");
    } finally {
      setScanning(false);
    }
  };

  const handleIdSubmit = () => {
    if (!idFrontUri) {
      Alert.alert("Document required", "Please upload your ID front image.");
      return;
    }
    setDocumentCapture(idFrontUri, idBackUri || "", "", "");
    setKycDocument(idFrontUri, idBackUri || "");
    setStep(2);
  };

  if (verified) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: anims[0].opacity, transform: [{ translateY: anims[0].translate }] }}>
            <View style={styles.successIconWrap}>
              <View style={styles.successCircle}>
                <Ionicons name="checkmark" size={64} color="#FFFFFF" />
              </View>
            </View>
            <Text style={styles.successTitle}>Identity Verified!</Text>
            <Text style={styles.successSubtitle}>
              Now you are a verified Driver
            </Text>
            <Pressable style={styles.primaryButton} onPress={() => router.back()}>
              <Text style={styles.primaryButtonText}>Continue Driving</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {step === 0 && (
          <Animated.View style={{ opacity: anims[0].opacity, transform: [{ translateY: anims[0].translate }] }}>
            <Text style={styles.title}>Verify your identity</Text>
            <Text style={styles.subtitle}>
              Please complete face verification to become a verified driver. It will more trusted
            </Text>

            <View style={styles.photoContainer}>
              <Pressable style={styles.photoCirclePressable} onPress={() => handleImagePick("profile")}>
                <View style={styles.photoCircle}>
                  {profileUri ? (
                    <Image source={{ uri: profileUri }} style={styles.photoImage} contentFit="cover" />
                  ) : (
                    <Ionicons name="person" size={48} color="#6E7E91" />
                  )}
                </View>
                <View style={styles.photoBadge}>
                  <Ionicons name="camera" size={16} color="#FFFFFF" />
                </View>
              </Pressable>
            </View>

            <View style={styles.formCard}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Email*</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Email"
                    placeholderTextColor="#6E7E91"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Address*</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Address"
                    placeholderTextColor="#6E7E91"
                    value={address}
                    onChangeText={setAddress}
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Identity Type*</Text>
                <Pressable style={styles.dropdownButton} onPress={() => setShowIdTypeModal(true)}>
                  <Text style={[styles.dropdownText, !idType && styles.dropdownPlaceholder]}>
                    {idType ? ID_TYPES.find((t) => t.value === idType)?.label : "Select ID Type"}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={idType ? NAVY : "#6E7E91"} />
                </Pressable>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Identification Number*</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="ID Number"
                    placeholderTextColor="#6E7E91"
                    value={idNumber}
                    onChangeText={setIdNumber}
                    autoCapitalize="characters"
                  />
                </View>
              </View>
            </View>

            <Pressable style={styles.primaryButton} onPress={handleSubmitIdentity}>
              <Text style={styles.primaryButtonText}>Continue</Text>
            </Pressable>
          </Animated.View>
        )}

        {step === 1 && (
          <Animated.View style={{ opacity: anims[0].opacity, transform: [{ translateY: anims[0].translate }] }}>
            <Text style={styles.title}>Upload ID</Text>
            <Text style={styles.subtitle}>
              Upload your identity document to verify your identity
            </Text>

            <View style={styles.formCard}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Upload Identity Image Front*</Text>
                <Pressable style={styles.uploadArea} onPress={() => handleImagePick("idFront")}>
                  {idFrontUri ? (
                    <Image source={{ uri: idFrontUri }} style={styles.uploadImage} contentFit="cover" />
                  ) : (
                    <View style={styles.uploadPlaceholder}>
                      <Ionicons name="image-outline" size={32} color="#6E7E91" />
                      <Text style={styles.uploadText}>Click to Add</Text>
                    </View>
                  )}
                </Pressable>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Upload Identity Image Back (If any)</Text>
                <Pressable style={styles.uploadArea} onPress={() => handleImagePick("idBack")}>
                  {idBackUri ? (
                    <Image source={{ uri: idBackUri }} style={styles.uploadImage} contentFit="cover" />
                  ) : (
                    <View style={styles.uploadPlaceholder}>
                      <Ionicons name="image-outline" size={32} color="#6E7E91" />
                      <Text style={styles.uploadText}>Click to Add</Text>
                    </View>
                  )}
                </Pressable>
              </View>
            </View>

            <Pressable style={styles.primaryButton} onPress={handleIdSubmit}>
              <Text style={styles.primaryButtonText}>Submit</Text>
            </Pressable>
          </Animated.View>
        )}

        {step === 2 && (
          <Animated.View style={{ opacity: anims[0].opacity, transform: [{ translateY: anims[0].translate }] }}>
            <Text style={styles.title}>Verify Identity</Text>
            <Text style={styles.subtitle}>
              Submit your documents for verification. This usually takes a few minutes.
            </Text>

            <View style={styles.faceFrame}>
              <View style={styles.faceCircle}>
                {profileUri ? (
                  <Image source={{ uri: profileUri }} style={styles.faceImage} contentFit="cover" />
                ) : (
                  <Ionicons name="person" size={64} color="#6E7E91" />
                )}
              </View>
            </View>

            {scanning && (
              <View style={styles.scanningOverlay}>
                <Text style={styles.scanningText}>Verifying documents</Text>
                <View style={styles.progressBar}>
                  <View style={styles.progressFill} />
                </View>
              </View>
            )}

            {!scanning && (
              <Pressable style={styles.primaryButton} onPress={handleSubmitVerification}>
                <Text style={styles.primaryButtonText}>Submit for Verification</Text>
              </Pressable>
            )}
          </Animated.View>
        )}
      </ScrollView>

      {/* ID Type Modal */}
      <Modal
        visible={showIdTypeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowIdTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Identity Type</Text>
            <ScrollView>
              {ID_TYPES.map((item) => (
                <Pressable
                  key={item.value}
                  style={styles.pickerItem}
                  onPress={() => {
                    setIdType(item.value);
                    setShowIdTypeModal(false);
                  }}
                >
                  <Text style={[styles.pickerItemText, idType === item.value && styles.pickerItemActive]}>
                    {item.label}
                  </Text>
                  {idType === item.value && <Ionicons name="checkmark" size={20} color={ORANGE} />}
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
    gap: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: NAVY,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6E7E91",
    lineHeight: 20,
    marginBottom: 8,
  },
  formCard: {
    gap: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EAE1D9",
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: NAVY,
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
  photoContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  photoCirclePressable: {
    position: "relative",
  },
  photoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F5ECE5",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  photoImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  uploadArea: {
    borderWidth: 1.5,
    borderColor: "#EAE1D9",
    borderStyle: "dashed",
    borderRadius: 16,
    minHeight: 130,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  uploadImage: {
    width: "100%",
    height: 140,
  },
  uploadPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 20,
  },
  uploadText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6E7E91",
  },
  primaryButton: {
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
  primaryButtonText: {
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
  faceFrame: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#F5ECE5",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginVertical: 20,
    position: "relative",
  },
  faceCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  faceImage: {
    width: 200,
    height: 200,
  },
  faceCornerTL: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: ORANGE,
    borderTopLeftRadius: 12,
  },
  faceCornerTR: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: ORANGE,
    borderTopRightRadius: 12,
  },
  faceCornerBL: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: ORANGE,
    borderBottomLeftRadius: 12,
  },
  faceCornerBR: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: ORANGE,
    borderBottomRightRadius: 12,
  },
  scanningOverlay: {
    alignItems: "center",
    gap: 12,
    marginTop: 24,
  },
  scanningText: {
    fontSize: 14,
    fontWeight: "700",
    color: NAVY,
  },
  progressBar: {
    width: 200,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#EAE1D9",
    overflow: "hidden",
  },
  progressFill: {
    width: "70%",
    height: 4,
    borderRadius: 2,
    backgroundColor: ORANGE,
  },
  successIconWrap: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 24,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: NAVY,
    textAlign: "center",
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6E7E91",
    textAlign: "center",
    marginBottom: 24,
  },
});
