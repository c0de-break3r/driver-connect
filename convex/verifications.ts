import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

<<<<<<< HEAD
type VerificationStatus = "not_started" | "capturing" | "processing" | "review" | "confirmed" | "failed" | "pending_review";

function stripBase64Prefix(value: string): string {
  return value.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
}

function base64ToBlob(base64: string, mimeType: string = "image/jpeg"): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

export const submitDocumentVerification = action({
=======
export const submitDocumentVerification = mutation({
>>>>>>> 33eb3cd (updates)
  args: {
    userId: v.string(),
    documentType: v.string(),
<<<<<<< HEAD
    idNumber: v.string(),
    email: v.string(),
    address: v.string(),
    documentFront: v.string(),
    documentBack: v.optional(v.string()),
    selfie: v.optional(v.string()),
  },
  returns: v.object({
    jobId: v.optional(v.string()),
    status: v.string(),
    raw: v.optional(v.any()),
  }),
  handler: async (ctx, args) => {
    const partnerId = process.env.SMILE_ID_PARTNER_ID;
    const apiKey = process.env.SMILE_ID_API_KEY;
    const environment = process.env.SMILE_ID_ENVIRONMENT ?? "sandbox";

    if (!partnerId || !apiKey) {
      throw new Error("Missing Smile ID credentials in Convex env");
    }

    const baseUrl =
      environment === "production"
        ? "https://api.smileidentity.com"
        : "https://testapi.smileidentity.com";

    const names = (args.email || "").split(" ");
    const givenNames = names.slice(0, -1).join(" ") || names[0] || "User";
    const lastName = names.slice(-1)[0] || "User";

    const tokenResponse = await fetch(`${baseUrl}/v3/token`, {
      method: "POST",
      headers: {
        "smileid-partner-id": partnerId,
        "smileid-api-key": apiKey,
        "Content-Type": "multipart/form-data",
      },
      body: JSON.stringify({
        product: "biometric_kyc",
        user_id: args.userId,
        payload: {
          country: "GH",
          id_type: args.documentType.toUpperCase(),
          id_number: args.idNumber,
          given_names: givenNames,
          last_name: lastName,
          email: args.email,
        },
      }),
    });

    if (!tokenResponse.ok) {
      const text = await tokenResponse.text();
      throw new Error(`Smile ID token request failed: ${tokenResponse.status} ${text}`);
    }

    const tokenData = (await tokenResponse.json()) as { token: string };
    const accessToken = tokenData.token;

    const selfieBlob = args.selfie
      ? base64ToBlob(stripBase64Prefix(args.selfie))
      : base64ToBlob(stripBase64Prefix(args.documentFront));

    const livenessImages = [
      selfieBlob,
      selfieBlob,
      selfieBlob,
      selfieBlob,
      selfieBlob,
      selfieBlob,
    ];

    const formData = new FormData();
    formData.append("selfie_image", selfieBlob, "selfie.jpg");
    livenessImages.forEach((blob, index) => {
      formData.append("liveness_images", blob, `liveness_${index}.jpg`);
    });
    formData.append("consent", JSON.stringify({
      granted: true,
      granted_at: new Date().toISOString(),
      notice_language: "en",
      notice_privacy_policy_url: "https://africanadriverconnect.com/privacy",
    }));
    formData.append("country", "GH");
    formData.append("id_type", args.documentType.toUpperCase());
    formData.append("id_number", args.idNumber);
    formData.append("user_details", JSON.stringify({
      given_names: givenNames,
      last_name: lastName,
      email: args.email,
    }));

    const response = await fetch(`${baseUrl}/v3/biometric_kyc`, {
      method: "POST",
      headers: {
        "SmileID-Partner-ID": partnerId,
        "SmileID-Token": accessToken,
      },
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Smile ID verification failed: ${response.status} ${text}`);
    }

    const data = (await response.json()) as {
      status: string;
      message: string;
      job_id: string;
      user_id: string;
      created_at: string;
    };

    const jobId = data.job_id;

    await ctx.runMutation(api.verifications.recordVerification, {
      userId: args.userId,
      smileIdJobId: jobId,
      status: "processing",
      documentType: args.documentType,
      confidence: undefined,
      livenessPassed: undefined,
    });

    return {
      jobId,
      status: "processing",
      raw: data,
    };
  },
});

export const checkVerificationStatus = action({
  args: { jobId: v.string() },
  returns: v.object({
    status: v.string(),
    confidence: v.optional(v.number()),
    livenessPassed: v.optional(v.boolean()),
    raw: v.optional(v.any()),
  }),
  handler: async (ctx, args) => {
    const partnerId = process.env.SMILE_ID_PARTNER_ID;
    const apiKey = process.env.SMILE_ID_API_KEY;
    const environment = process.env.SMILE_ID_ENVIRONMENT ?? "sandbox";

    if (!partnerId || !apiKey) {
      throw new Error("Missing Smile ID credentials in Convex env");
    }

    const baseUrl =
      environment === "production"
        ? "https://api.smileidentity.com"
        : "https://testapi.smileidentity.com";

    const tokenResponse = await fetch(`${baseUrl}/v3/token`, {
      method: "POST",
      headers: {
        "smileid-partner-id": partnerId,
        "smileid-api-key": apiKey,
        "Content-Type": "multipart/form-data",
      },
      body: JSON.stringify({
        product: "biometric_kyc",
      }),
    });

    if (!tokenResponse.ok) {
      const text = await tokenResponse.text();
      throw new Error(`Smile ID token request failed: ${tokenResponse.status} ${text}`);
    }

    const tokenData = (await tokenResponse.json()) as { token: string };
    const accessToken = tokenData.token;

    const response = await fetch(
      `${baseUrl}/v3/status/${encodeURIComponent(args.jobId)}`,
      {
        method: "GET",
        headers: {
          "SmileID-Partner-ID": partnerId,
          "SmileID-Token": accessToken,
        },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Smile ID status check failed: ${response.status} ${text}`);
    }

    const data = (await response.json()) as {
      status: string;
      message: string;
      job_id: string;
      user_id: string;
      created_at: string;
    };

    let status: VerificationStatus = "processing";
    if (data.status === "clear") {
      status = "confirmed";
    } else if (data.status === "block" || data.status === "error") {
      status = "failed";
    } else if (data.status === "attention") {
      status = "review";
    }

    return {
      status,
      confidence: data.status === "clear" ? 98 : undefined,
      livenessPassed: data.status === "clear" ? true : undefined,
      raw: data,
    };
  },
});

export const recordVerification = mutation({
  args: {
    userId: v.id("users"),
    smileIdJobId: v.optional(v.string()),
    status: v.string(),
    documentType: v.optional(v.string()),
=======
    status: v.string(),
    livenessPassed: v.optional(v.boolean()),
>>>>>>> 33eb3cd (updates)
    confidence: v.optional(v.number()),
  },
  returns: v.id("driverProfiles"),
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("driverProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
<<<<<<< HEAD
        status: args.status,
        documentType: args.documentType ?? existing.documentType,
        confidence: args.confidence ?? existing.confidence,
        livenessPassed: args.livenessPassed ?? existing.livenessPassed,
        smileIdJobId: args.smileIdJobId ?? existing.smileIdJobId,
=======
        verificationStatus: args.status,
>>>>>>> 33eb3cd (updates)
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("driverProfiles", {
      userId: args.userId,
<<<<<<< HEAD
      documentType: args.documentType,
      status: args.status,
      confidence: args.confidence,
      livenessPassed: args.livenessPassed,
      smileIdJobId: args.smileIdJobId,
=======
      verificationStatus: args.status,
      availableForHire: false,
      preferredVehicleTypes: [],
      rating: 0,
      totalTrips: 0,
>>>>>>> 33eb3cd (updates)
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getVerificationStatus = query({
  args: { userId: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("driverProfiles"),
      _creationTime: v.number(),
<<<<<<< HEAD
      userId: v.id("users"),
      documentType: v.optional(v.string()),
      status: v.string(),
      livenessPassed: v.optional(v.boolean()),
      confidence: v.optional(v.number()),
      smileIdJobId: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
=======
      userId: v.string(),
      verificationStatus: v.string(),
      availableForHire: v.boolean(),
      rating: v.number(),
      totalTrips: v.number(),
>>>>>>> 33eb3cd (updates)
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("driverProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
  },
});
