import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type VerificationStatus = "not_started" | "capturing" | "processing" | "review" | "confirmed" | "failed" | "pending_review";

export type DocumentType = "passport" | "drivers_license" | "national_id";

export type KycFlowState = {
  currentStep: 1 | 2 | 3;
  status: VerificationStatus;
  documentType: DocumentType | null;
  documentFrontUri: string;
  documentBackUri: string;
  selfieUri: string;
  livenessResult: {
    passed: boolean;
    confidence: number;
    reason?: string;
  } | null;
  dojahSessionId: string | null;
  verificationId: string | null;
  consentGiven: boolean;
  
  setStep: (step: 1 | 2 | 3) => void;
  setStatus: (status: VerificationStatus) => void;
  setDocumentType: (type: DocumentType | null) => void;
  setDocumentCapture: (front: string, back?: string) => void;
  setSelfieCapture: (uri: string) => void;
  setLivenessResult: (result: { passed: boolean; confidence: number; reason?: string }) => void;
  setDojahSessionId: (id: string | null) => void;
  setVerificationId: (id: string | null) => void;
  setConsentGiven: (given: boolean) => void;
  reset: () => void;
};

const initialState: KycFlowState = {
  currentStep: 1,
  status: "not_started",
  documentType: null,
  documentFrontUri: "",
  documentBackUri: "",
  selfieUri: "",
  livenessResult: null,
  dojahSessionId: null,
  verificationId: null,
  consentGiven: false,
  setStep: () => {},
  setStatus: () => {},
  setDocumentType: () => {},
  setDocumentCapture: () => {},
  setSelfieCapture: () => {},
  setLivenessResult: () => {},
  setDojahSessionId: () => {},
  setVerificationId: () => {},
  setConsentGiven: () => {},
  reset: () => {},
};

export const useKycFlowStore = create<KycFlowState>()(
  persist(
    (set) => ({
      ...initialState,
      setStep: (step) => set({ currentStep: step }),
      setStatus: (status) => set({ status }),
      setDocumentType: (type) => set({ documentType: type }),
      setDocumentCapture: (front, back = "") => set({ documentFrontUri: front, documentBackUri: back }),
      setSelfieCapture: (uri) => set({ selfieUri: uri }),
      setLivenessResult: (result) => set({ livenessResult: result }),
      setDojahSessionId: (id) => set({ dojahSessionId: id }),
      setVerificationId: (id) => set({ verificationId: id }),
      setConsentGiven: (given) => set({ consentGiven: given }),
      reset: () => set({
        currentStep: 1,
        status: "not_started",
        documentType: null,
        documentFrontUri: "",
        documentBackUri: "",
        selfieUri: "",
        livenessResult: null,
        dojahSessionId: null,
        verificationId: null,
        consentGiven: false,
      }),
    }),
    {
      name: "africana-kyc-flow",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);