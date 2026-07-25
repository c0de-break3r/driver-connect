export type SmileIdCountry = string;
export type SmileIdDocumentType =
  | "PASSPORT"
  | "DRIVERS_LICENSE"
  | "NATIONAL_ID"
  | "VOTER_ID"
  | "RESIDENT_ID"
  | "IDENTITY_CARD";

export interface SmileIdUserDetails {
  given_names: string;
  last_name: string;
  email?: string;
  phone_number?: string;
}

export interface SmileIdConsent {
  granted: boolean;
  granted_at: string;
  notice_language: string;
  notice_privacy_policy_url: string;
}

export interface SmileIdBiometricKycRequest {
  selfie_image: Blob;
  liveness_images: Blob[];
  consent: SmileIdConsent;
  country: SmileIdCountry;
  id_type: SmileIdDocumentType;
  id_number: string;
  user_details: SmileIdUserDetails;
  callback_url?: string;
  partner_params?: Record<string, string>;
}

export interface SmileIdAcceptedResponse {
  status: "accepted";
  message: string;
  job_id: string;
  user_id: string;
  created_at: string;
}

export interface SmileIdJobStatusResponse {
  status: "clear" | "block" | "attention" | "error" | "processing" | "not_found";
  job_id: string;
  user_id: string;
  message: string;
  created_at: string;
}

export interface SmileIdWebhookResult {
  job_id: string;
  user_id: string;
  status: "clear" | "block" | "attention" | "error";
  message: string;
  reason?: string;
  id_fields?: Record<string, unknown>;
  image_links?: {
    selfie_image?: string;
    document_front?: string;
    document_back?: string;
  };
  kyc_receipt?: string;
  antifraud?: Record<string, unknown>;
  created_at: string;
}
