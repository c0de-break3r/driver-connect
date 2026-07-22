import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Persisted store for the driver-specific 16-step onboarding flow.
 *
 * Steps 0-15 capture onboarding answers before account creation.
 * Step 16 creates the Clerk account and verifies it via OTP.
 *
 * Flow:
 * 0. Value Hook (Welcome & Earnings), 1. Experience, 2. Employment, 3. Goals,
 * 4. ID Capture, 5. License Capture, 6. Facial Verify, 7. Verification Review,
 * 8. Personal Info (auto-filled), 9. License (auto-filled),
 * 10. Vehicle Types, 11. Vehicle Details, 12. Job Type, 13. Location,
 * 14. Safety, 15. Payout, 16. OTP
 */

export type LicenseClass = "A" | "B" | "C" | "D" | "E" | "F";

export type VehicleOwnership = "own" | "lease" | "company" | "other";
export type PayoutMethod = "momo" | "bank";

/** Extracted data from OCR processing of identity documents. */
export type ExtractedIdData = {
  fullName: string;
  dateOfBirth: string;
  nationalIdNumber: string;
  address: string;
};

/** Extracted data from OCR processing of driver's license. */
export type ExtractedLicenseData = {
  fullName: string;
  dateOfBirth: string;
  licenseNumber: string;
  licenseClass: string;
  expiryDate: string;
};

/** Overall verification pipeline status. */
export type VerificationPipelineStatus =
  | "not_started"
  | "capturing"
  | "processing"
  | "review"
  | "confirmed"
  | "failed";

export type DriverOnboardingState = {
  /** Current step index (0-16) for the 17-step driver flow. */
  currentStep: number;

  // Step 0 — Value Hook (Welcome & Earnings)
  valueHookCompleted: boolean;

  // Step 1 — Driving Experience
  yearsExperience: string | null;

  // Step 2 — Employment Status
  employmentStatus: string | null;

  // Step 3 — Driver Goals
  driverGoal: string | null;

  // Step 3 — Identity Verification: Document Capture & Facial Verification
  // National ID captures
  nationalIdFrontUri: string;
  nationalIdBackUri: string;
  // License captures
  licenseFrontUri: string;
  licenseBackUri: string;
  // Selfie capture
  selfieUri: string;
  // OCR extracted data
  extractedIdData: ExtractedIdData | null;
  extractedLicenseData: ExtractedLicenseData | null;
  // Face match result
  faceMatchPassed: boolean | null;
  faceMatchConfidence: number | null;
  // Verification pipeline
  verificationPipelineStatus: VerificationPipelineStatus;
  // Document type validation (was the correct document captured?)
  nationalIdValidated: boolean | null;
  licenseValidated: boolean | null;
  documentStorageIds: {
    nationalIdFront?: string;
    nationalIdBack?: string;
    licenseFront?: string;
    licenseBack?: string;
    selfie?: string;
  };

  // Step 7 — Personal Info
  residentialAddress: string;
  hasCriminalRecord: boolean | null;
  criminalRecordDetails: string;

  // Step 8 — License Confirmation
  fullLegalName: string;
  dateOfBirth: string;
  licenseClass: LicenseClass | null;
  licenseNumber: string;
  licenseExpiryDate: string;

  // Step 10 — Vehicle Types
  vehicleTypes: string[];

  // Step 2 (new) — Qualification Pre-Check
  selectedVehicleType: "motorbike" | "sedan" | "van" | null;
  hasValidLicense: boolean;
  hasActiveGhanaCard: boolean;

  // Step 11 — Vehicle Details
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehiclePlateNumber: string;
  vehicleOwnership: VehicleOwnership | null;
  ownerConsentObtained: boolean;

  // Step 12 — Preferred Job Type
  preferredJobType: string | null;

  // Step 13 — Preferred Location
  preferredLocation: string;

  // Step 14 — Safety & Compliance
  insuranceProvider: string;
  insurancePolicyNumber: string;
  insuranceExpiryDate: string;
  roadworthinessCertDate: string;
  hasRecentViolations: boolean | null;
  violationDetails: string;

  // Step 15 — Payout
  payoutMethod: PayoutMethod | null;
  payoutAccountName: string;
  payoutAccountNumber: string;
  taxIdentificationNumber: string;

  // Auth / progress
  verificationMethod: "email" | "phone" | null;
  onboardingComplete: boolean;
  profileDocumentsUploaded: boolean;

  setStep: (step: number) => void;
  setExperience: (yearsExperience: string) => void;
  setEmploymentStatus: (employmentStatus: string) => void;
  setDriverGoal: (driverGoal: string) => void;
  setQualificationPreCheck: (
    selectedVehicleType: "motorbike" | "sedan" | "van",
    hasValidLicense: boolean,
    hasActiveGhanaCard: boolean
  ) => void;
  // Verification actions
  setDocumentCapture: (
    nationalIdFrontUri: string,
    nationalIdBackUri: string,
    licenseFrontUri: string,
    licenseBackUri: string,
  ) => void;
  setSelfieCapture: (selfieUri: string) => void;
  setExtractedData: (
    idData: ExtractedIdData | null,
    licenseData: ExtractedLicenseData | null,
  ) => void;
  setFaceMatchResult: (
    faceMatchPassed: boolean,
    faceMatchConfidence: number,
  ) => void;
  setVerificationPipelineStatus: (status: VerificationPipelineStatus) => void;
  setNationalIdValidated: (validated: boolean | null) => void;
  setLicenseValidated: (validated: boolean | null) => void;
  setDocumentStorageIds: (
    ids: Partial<{
      nationalIdFront: string;
      nationalIdBack: string;
      licenseFront: string;
      licenseBack: string;
      selfie: string;
    }>,
  ) => void;
  setPersonalInfo: (
    residentialAddress: string,
    hasCriminalRecord: boolean,
    criminalRecordDetails: string,
  ) => void;
  setLicenseInfo: (
    fullLegalName: string,
    dateOfBirth: string,
    licenseClass: LicenseClass,
  ) => void;
  setLicenseDetails: (licenseNumber: string, licenseExpiryDate: string) => void;
  setVehicleDetails: (
    vehicleMake: string,
    vehicleModel: string,
    vehicleYear: string,
    vehiclePlateNumber: string,
    vehicleOwnership: VehicleOwnership,
    ownerConsentObtained: boolean,
  ) => void;
  toggleVehicleType: (vehicleType: string) => void;
  setPreferredJobType: (preferredJobType: string) => void;
  setPreferredLocation: (preferredLocation: string) => void;
  setSafetyInfo: (
    insuranceProvider: string,
    insurancePolicyNumber: string,
    insuranceExpiryDate: string,
    roadworthinessCertDate: string,
    hasRecentViolations: boolean,
    violationDetails: string,
  ) => void;
  setPayoutInfo: (
    payoutMethod: PayoutMethod,
    payoutAccountName: string,
    payoutAccountNumber: string,
    taxIdentificationNumber: string,
  ) => void;
  setVerificationMethod: (method: "email" | "phone") => void;
  markOnboardingComplete: () => void;
  markProfileDocumentsUploaded: () => void;
  reset: () => void;
};

const initialState = {
  currentStep: 0,
  valueHookCompleted: false,
  yearsExperience: null,
  employmentStatus: null,
  driverGoal: null,
  fullLegalName: "",
  dateOfBirth: "",
  licenseClass: null as LicenseClass | null,
  licenseNumber: "",
  licenseExpiryDate: "",
  nationalIdFrontUri: "",
  nationalIdBackUri: "",
  licenseFrontUri: "",
  licenseBackUri: "",
  selfieUri: "",
  extractedIdData: null as ExtractedIdData | null,
  extractedLicenseData: null as ExtractedLicenseData | null,
  faceMatchPassed: null as boolean | null,
  faceMatchConfidence: null as number | null,
  verificationPipelineStatus: "not_started" as VerificationPipelineStatus,
  nationalIdValidated: null as boolean | null,
  licenseValidated: null as boolean | null,
  documentStorageIds: {} as {
    nationalIdFront?: string;
    nationalIdBack?: string;
    licenseFront?: string;
    licenseBack?: string;
    selfie?: string;
  },
  residentialAddress: "",
  hasCriminalRecord: null as boolean | null,
  criminalRecordDetails: "",
  vehicleTypes: [] as string[],
  selectedVehicleType: null as "motorbike" | "sedan" | "van" | null,
  hasValidLicense: false,
  hasActiveGhanaCard: false,
  vehicleMake: "",
  vehicleModel: "",
  vehicleYear: "",
  vehiclePlateNumber: "",
  vehicleOwnership: null as VehicleOwnership | null,
  ownerConsentObtained: false,
  preferredJobType: null,
  preferredLocation: "",
  insuranceProvider: "",
  insurancePolicyNumber: "",
  insuranceExpiryDate: "",
  roadworthinessCertDate: "",
  hasRecentViolations: null as boolean | null,
  violationDetails: "",
  payoutMethod: null as PayoutMethod | null,
  payoutAccountName: "",
  payoutAccountNumber: "",
  taxIdentificationNumber: "",
  verificationMethod: null as "email" | "phone" | null,
  onboardingComplete: false,
  profileDocumentsUploaded: false,
};

export const useDriverOnboardingStore = create<DriverOnboardingState>()(
  persist(
    (set) => ({
      ...initialState,
      setStep: (currentStep) => set({ currentStep }),
      setDocumentCapture: (
        nationalIdFrontUri,
        nationalIdBackUri,
        licenseFrontUri,
        licenseBackUri,
      ) =>
        set({
          nationalIdFrontUri,
          nationalIdBackUri,
          licenseFrontUri,
          licenseBackUri,
        }),
      setSelfieCapture: (selfieUri) => set({ selfieUri }),
      setExtractedData: (extractedIdData, extractedLicenseData) =>
        set({ extractedIdData, extractedLicenseData }),
      setFaceMatchResult: (faceMatchPassed, faceMatchConfidence) =>
        set({ faceMatchPassed, faceMatchConfidence }),
      setVerificationPipelineStatus: (verificationPipelineStatus) =>
        set({ verificationPipelineStatus }),
      setNationalIdValidated: (nationalIdValidated) =>
        set({ nationalIdValidated }),
      setLicenseValidated: (licenseValidated) => set({ licenseValidated }),
      setDocumentStorageIds: (ids) =>
        set((state) => ({
          documentStorageIds: { ...state.documentStorageIds, ...ids },
        })),
setExperience: (yearsExperience) => set({ yearsExperience }),
  setEmploymentStatus: (employmentStatus) => set({ employmentStatus }),
  setDriverGoal: (driverGoal) => set({ driverGoal }),
  setValueHookCompleted: (completed: boolean) => set({ valueHookCompleted: completed }),
  setQualificationPreCheck: (
    selectedVehicleType: "motorbike" | "sedan" | "van",
    hasValidLicense: boolean,
    hasActiveGhanaCard: boolean
  ) =>
    set({ selectedVehicleType, hasValidLicense, hasActiveGhanaCard }),
  setPersonalInfo: (
        residentialAddress,
        hasCriminalRecord,
        criminalRecordDetails,
      ) =>
        set({ residentialAddress, hasCriminalRecord, criminalRecordDetails }),
      setLicenseInfo: (fullLegalName, dateOfBirth, licenseClass) =>
        set({ fullLegalName, dateOfBirth, licenseClass }),
      setLicenseDetails: (licenseNumber, licenseExpiryDate) =>
        set({ licenseNumber, licenseExpiryDate }),
      setVehicleDetails: (
        vehicleMake,
        vehicleModel,
        vehicleYear,
        vehiclePlateNumber,
        vehicleOwnership,
        ownerConsentObtained,
      ) =>
        set({
          vehicleMake,
          vehicleModel,
          vehicleYear,
          vehiclePlateNumber,
          vehicleOwnership,
          ownerConsentObtained,
        }),
      toggleVehicleType: (vehicleType) =>
        set((state) => {
          const exists = state.vehicleTypes.includes(vehicleType);
          return {
            vehicleTypes: exists
              ? state.vehicleTypes.filter((v) => v !== vehicleType)
              : [...state.vehicleTypes, vehicleType],
          };
        }),
      setPreferredJobType: (preferredJobType) => set({ preferredJobType }),
      setPreferredLocation: (preferredLocation) => set({ preferredLocation }),
      setSafetyInfo: (
        insuranceProvider,
        insurancePolicyNumber,
        insuranceExpiryDate,
        roadworthinessCertDate,
        hasRecentViolations,
        violationDetails,
      ) =>
        set({
          insuranceProvider,
          insurancePolicyNumber,
          insuranceExpiryDate,
          roadworthinessCertDate,
          hasRecentViolations,
          violationDetails,
        }),
      setPayoutInfo: (
        payoutMethod,
        payoutAccountName,
        payoutAccountNumber,
        taxIdentificationNumber,
      ) =>
        set({
          payoutMethod,
          payoutAccountName,
          payoutAccountNumber,
          taxIdentificationNumber,
        }),
      setVerificationMethod: (verificationMethod) =>
        set({ verificationMethod }),
      markOnboardingComplete: () =>
        set({ onboardingComplete: true, currentStep: 16 }),
      markProfileDocumentsUploaded: () =>
        set({ profileDocumentsUploaded: true }),
      reset: () => set(initialState),
    }),
    {
      name: "africana-driver-onboarding",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
