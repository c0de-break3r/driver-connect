declare module "dojah-js" {
  export interface DojahConfig {
    appId: string;
    secretKey: string;
    environment?: "sandbox" | "production";
  }

  export interface VerificationSession {
    entity: {
      id: string;
      type: "individual" | "business";
      verification_type: "document" | "biometric" | "address" | "phone" | "email";
    };
    redirect_url?: string;
    callback_url?: string;
    metadata?: Record<string, string>;
  }

  export interface VerificationResult {
    status: "pending" | "verified" | "rejected" | "failed";
    entity_id: string;
    verification_type: string;
    data?: Record<string, unknown>;
    created_at: string;
    updated_at: string;
  }

  export interface DocumentVerificationRequest {
    document_type: "passport" | "drivers_license" | "national_id" | "voters_card";
    document_front: string;
    document_back?: string;
    selfie?: string;
    country?: string;
  }

  export interface BiometricVerificationRequest {
    selfie: string;
    document_type?: string;
    document_number?: string;
  }

  export interface AddressVerificationRequest {
    address: string;
    city: string;
    state: string;
    country: string;
    postal_code?: string;
  }

  export class Dojah {
    constructor(config: DojahConfig);
    verification: {
      createSession(params: VerificationSession): Promise<{ session_id: string; redirect_url: string }>;
      verifyDocument(params: DocumentVerificationRequest): Promise<VerificationResult>;
      verifyBiometric(params: BiometricVerificationRequest): Promise<VerificationResult>;
      verifyAddress(params: AddressVerificationRequest): Promise<VerificationResult>;
      getStatus(entityId: string): Promise<VerificationResult>;
    };
    webhook: {
      verify(signature: string, payload: string): boolean;
    };
  }

  export default Dojah;
}