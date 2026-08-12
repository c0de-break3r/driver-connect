import { v } from "convex/values";
import { action } from "./_generated/server";

function buildVehiclePrompt() {
  return `You are an expert vehicle identification assistant. Carefully analyze the uploaded image and return ONLY valid JSON. If this is NOT a vehicle photo, return {"category":"Other","make":"Unknown","model":"Unknown","year":2024,"color":"Unknown","features":[],"confidence":0}. If it IS a vehicle, identify as precisely as possible: make, model, year, color, category (Car|Van|Bus|Truck|Motorcycle|Heavy Equipment). Pay special attention to brand badges, grilles, headlights, and body shape. Common makes include Toyota, Honda, Nissan, Mercedes-Benz, BMW, Audi, Volkswagen, Hyundai, Kia, Ford, Chevrolet, Mazda, Subaru, Lexus, Land Rover, Range Rover, etc. For Mercedes-Benz, look for the star emblem and distinctive grille. For BMW, look for the kidney grille and roundel. For Audi, look for the single-frame grille and four rings. For Toyota Hilux, look for the rugged body and Toyota badge. For Nissan, look for the distinctive grille. For Hyundai/Kia, look for the modern design and badge. Visible features from: Air Conditioning, GPS Navigation, Bluetooth, Reverse Camera, Sunroof, Leather Seats, Heated Seats, Parking Sensors, Backup Camera, Cruise Control, Keyless Entry, Push Start, Apple CarPlay, Android Auto. Likely transmission type: Automatic or Manual. Likely fuel type: Petrol, Diesel, Electric, Hybrid, or CNG. Return only JSON with keys: category, make, model, year, color, features[], transmission, fuelType, confidence. No markdown, no explanation.`;
}

function cleanJsonText(text: string) {
  const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return cleaned.slice(firstBrace, lastBrace + 1);
  }
  return cleaned;
}

function parseVehicleJson(text: string) {
  try {
    const parsed = JSON.parse(cleanJsonText(text));
    return {
      category: parsed.category || "Car",
      make: parsed.make || "Unknown",
      model: parsed.model || "Unknown",
      year: parsed.year || 2024,
      color: parsed.color || "Unknown",
      features: Array.isArray(parsed.features) ? parsed.features : [],
      transmission: parsed.transmission || "Automatic",
      fuelType: parsed.fuelType || "Petrol",
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.7,
    };
  } catch {
    return {
      category: "Car",
      make: "Unknown",
      model: "Unknown",
      year: 2024,
      color: "Unknown",
      features: [],
      transmission: "Automatic",
      fuelType: "Petrol",
      confidence: 0,
    };
  }
}

function parsePlateJson(text: string) {
  try {
    const parsed = JSON.parse(cleanJsonText(text));
    return {
      make: parsed.make || "Unknown",
      model: parsed.model || "Unknown",
      year: parsed.year || 2024,
      color: parsed.color || "Unknown",
      transmission: parsed.transmission || "Automatic",
      fuelType: parsed.fuelType || "Petrol",
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.6,
    };
  } catch {
    return {
      make: "Unknown",
      model: "Unknown",
      year: 2024,
      color: "Unknown",
      transmission: "Automatic",
      fuelType: "Petrol",
      confidence: 0,
    };
  }
}

function extractBase64(dataUri: string): string {
  const match = dataUri.match(/^data:image\/[a-zA-Z]+;base64,(.+)$/);
  if (!match) {
    return dataUri;
  }
  return match[1];
}

async function callGeminiVision(imageUri: string, prompt: string) {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const base64 = extractBase64(imageUri);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
                {
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: base64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 256,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      return null;
    }

    const data = await response.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return text;
  } catch (error) {
    console.error("Gemini vision call failed:", error);
    return null;
  }
}

export const suggestVehicleFromImage = action({
  args: { imageUri: v.string() },
  returns: v.object({
    category: v.optional(v.string()),
    make: v.optional(v.string()),
    model: v.optional(v.string()),
    year: v.optional(v.number()),
    color: v.optional(v.string()),
    features: v.array(v.string()),
    transmission: v.optional(v.string()),
    fuelType: v.optional(v.string()),
    confidence: v.number(),
  }),
  handler: async (_ctx, args) => {
    const fallback = {
      category: "Car",
      make: "Unknown",
      model: "Unknown",
      year: 2024,
      color: "Unknown",
      features: [],
      transmission: "Automatic",
      fuelType: "Petrol",
      confidence: 0,
    };

    const prompt = buildVehiclePrompt();
    let text = await callGeminiVision(args.imageUri, prompt);
    let parsed = text ? parseVehicleJson(text) : null;

    // Retry once with a simpler prompt if parsing fails or confidence is low
    if (!parsed || parsed.confidence < 0.3) {
      const retryPrompt = `Analyze this vehicle image. Return ONLY valid JSON with keys: make, model, year, color, category (Car|Van|Bus|Truck|Motorcycle|Heavy Equipment), features[], transmission, fuelType, confidence. Be precise with the make and model.`;
      text = await callGeminiVision(args.imageUri, retryPrompt);
      parsed = text ? parseVehicleJson(text) : null;
    }

    if (!parsed || parsed.confidence === 0) {
      return { ...fallback, confidence: 0 };
    }

    return parsed;
  },
});

export const lookupVehicleByPlate = action({
  args: { imageUri: v.string() },
  returns: v.object({
    make: v.optional(v.string()),
    model: v.optional(v.string()),
    year: v.optional(v.number()),
    color: v.optional(v.string()),
    transmission: v.optional(v.string()),
    fuelType: v.optional(v.string()),
    confidence: v.number(),
  }),
  handler: async (_ctx, args) => {
    const fallback = {
      make: "Unknown",
      model: "Unknown",
      year: 2024,
      color: "Unknown",
      transmission: "Automatic",
      fuelType: "Petrol",
      confidence: 0.5,
    };

    const text = await callGeminiVision(
      args.imageUri,
      "This image contains a vehicle license plate. Read the plate if visible, and return the vehicle's likely make, model, year, color, transmission, and fuel type as JSON only. Keys: make, model, year, color, transmission, fuelType, confidence. No markdown."
    );
    if (!text) {
      return fallback;
    }

    return parsePlateJson(text);
  },
});

export const suggestListingPrice = action({
  args: {
    category: v.string(),
    make: v.string(),
    model: v.string(),
    year: v.number(),
  },
  returns: v.object({
    suggestedPricePerDay: v.number(),
    suggestedPricePerWeek: v.number(),
    suggestedPricePerMonth: v.number(),
    comparableCount: v.number(),
  }),
  handler: async (ctx, args) => {
    const comparable = await ctx.runQuery(
      "listingQueries:getComparableListings" as any,
      {
        category: args.category,
        year: args.year,
      }
    );

    const comparableCount = (comparable as any[]).length;

    if (comparableCount === 0) {
      const basePrice = 500;
      const ageFactor = Math.max(0.6, 1 - (2026 - args.year) * 0.02);
      const suggestedPricePerDay = Math.round(basePrice * ageFactor);
      return {
        suggestedPricePerDay,
        suggestedPricePerWeek: suggestedPricePerDay * 6,
        suggestedPricePerMonth: suggestedPricePerDay * 25,
        comparableCount: 0,
      };
    }

    const prices = (comparable as any[]).map((listing: any) => listing.pricePerDay);
    const avgPrice = prices.reduce((sum: number, price: number) => sum + price, 0) / prices.length;
    const suggestedPricePerDay = Math.round(avgPrice);
    const suggestedPricePerWeek = Math.round(avgPrice * 6);
    const suggestedPricePerMonth = Math.round(avgPrice * 25);

    return {
      suggestedPricePerDay,
      suggestedPricePerWeek,
      suggestedPricePerMonth,
      comparableCount,
    };
  },
});
