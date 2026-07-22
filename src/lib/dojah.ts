export interface DojahVerificationSession {
  entity: {
    id: string;
    type: "individual" | "business";
    verification_type: "document" | "biometric" | "address" | "phone" | "email";
  };
  redirect_url?: string;
  callback_url?: string;
  metadata?: Record<string, string>;
}

export interface DojahVerificationResult {
  entity_id: string;
  status: "pending" | "verified" | "rejected" | "failed";
  verification_type: string;
  data?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DojahDocumentVerificationRequest {
  document_type: "passport" | "drivers_license" | "national_id" | "voters_card";
  document_front: string;
  document_back?: string;
  selfie?: string;
  country?: string;
}

export interface DojahBiometricVerificationRequest {
  selfie: string;
  document_type?: string;
  document_number?: string;
}

export interface DojahAddressVerificationRequest {
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code?: string;
}