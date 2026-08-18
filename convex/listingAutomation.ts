import { v } from "convex/values";
import { action } from "./_generated/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemma-4-26b-a4b-it:free";

function buildVehiclePrompt() {
  return `You are an expert vehicle identification and listing assistant. Carefully analyze the uploaded image and return ONLY valid JSON. If this is NOT a vehicle photo, return {"category":"Other","make":"Unknown","model":"Unknown","year":2024,"color":"Unknown","features":[],"confidence":0,"serviceType":"rent","suggestedPricePerDay":0}. If it IS a vehicle, identify as precisely as possible: make, model, year, color, category (Car|Van|Bus|Truck|Motorcycle|Heavy Equipment). Also suggest the most appropriate listing service type: rent, sell, work_and_pay, chauffeur, event, or fleet. Also suggest a reasonable daily price in USD based on the vehicle type and apparent condition. Pay special attention to brand badges, grilles, headlights, and body shape. Also detect body style from: Sedan, Hatchback, SUV, Pickup, Van, Bus, Truck, Motorcycle, Convertible, Other. Also detect drive type from: FWD, RWD, AWD, 4WD. If the license plate is clearly visible, extract the plate number/registration text. Return only JSON with keys: category, make, model, year, color, features[], transmission, fuelType, serviceType, suggestedPricePerDay, confidence, bodyStyle, driveType, licensePlate, seats (number), doors (number). Common makes include Toyota, Honda, Nissan, Mercedes-Benz, BMW, Audi, Volkswagen, Hyundai, Kia, Ford, Chevrolet, Mazda, Subaru, Lexus, Land Rover, Range Rover, etc. For Mercedes-Benz, look for the star emblem and distinctive grille. For BMW, look for the kidney grille and roundel. For Audi, look for the single-frame grille and four rings. For Toyota Hilux, look for the rugged body and Toyota badge. For Nissan, look for the distinctive grille. For Hyundai/Kia, look for the modern design and badge. Visible features from: Air Conditioning, GPS Navigation, Bluetooth, Reverse Camera, Sunroof, Leather Seats, Heated Seats, Parking Sensors, Backup Camera, Cruise Control, Keyless Entry, Push Start, Apple CarPlay, Android Auto. Likely transmission type: Automatic or Manual. Likely fuel type: Petrol, Diesel, Electric, Hybrid, or CNG. Return only JSON with keys: category, make, model, year, color, features[], transmission, fuelType, serviceType, suggestedPricePerDay, confidence. No markdown, no explanation.`;
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
      serviceType: parsed.serviceType || "rent",
      suggestedPricePerDay: typeof parsed.suggestedPricePerDay === "number" ? parsed.suggestedPricePerDay : undefined,
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.7,
      bodyStyle: parsed.bodyStyle || "",
      driveType: parsed.driveType || "",
      licensePlate: parsed.licensePlate || "",
      seats: typeof parsed.seats === "number" ? parsed.seats : undefined,
      doors: typeof parsed.doors === "number" ? parsed.doors : undefined,
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
      serviceType: "rent",
      suggestedPricePerDay: undefined,
      confidence: 0,
      bodyStyle: "",
      driveType: "",
      licensePlate: "",
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

async function callOpenAIVision(imageUri: string, prompt: string, retries = 2) {
  if (!OPENROUTER_API_KEY) {
    return null;
  }

  try {
    const base64 = extractBase64(imageUri);

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${base64}` },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 429 && retries > 0) {
        const retryAfterHeader = response.headers.get("retry-after");
        const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader) : Math.pow(2, 2 - retries) * 1000;
        console.warn(`OpenRouter rate limited, retrying in ${retryAfter}ms...`);
        await new Promise((resolve) => setTimeout(resolve, retryAfter));
        return callOpenAIVision(imageUri, prompt, retries - 1);
      }
      console.error("OpenRouter vision call failed:", response.status, response.statusText, errorText);
      return null;
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";
    return text;
  } catch (error) {
    console.error("OpenRouter vision call failed:", error);
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
    serviceType: v.optional(v.string()),
    suggestedPricePerDay: v.optional(v.number()),
    confidence: v.number(),
    bodyStyle: v.optional(v.string()),
    driveType: v.optional(v.string()),
    licensePlate: v.optional(v.string()),
    seats: v.optional(v.number()),
    doors: v.optional(v.number()),
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
      serviceType: "rent",
      suggestedPricePerDay: undefined,
      confidence: 0,
      bodyStyle: "",
      driveType: "",
      licensePlate: "",
      seats: undefined,
      doors: undefined,
    };

    const prompt = buildVehiclePrompt();
    let text = await callOpenAIVision(args.imageUri, prompt);
    let parsed = text ? parseVehicleJson(text) : null;

    if (!parsed || parsed.confidence < 0.3) {
      const retryPrompt = `Analyze this vehicle image. Return ONLY valid JSON with keys: make, model, year, color, category (Car|Van|Bus|Truck|Motorcycle|Heavy Equipment), features[], transmission, fuelType, serviceType (rent|sell|work_and_pay|chauffeur|event|fleet), suggestedPricePerDay (number), confidence. Be precise with the make and model.`;
      text = await callOpenAIVision(args.imageUri, retryPrompt);
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
    licensePlate: v.optional(v.string()),
    mileage: v.optional(v.number()),
    vin: v.optional(v.string()),
    seats: v.optional(v.number()),
    doors: v.optional(v.number()),
  }),
  handler: async (_ctx, args) => {
    const fallback = {
      make: "Unknown",
      model: "Unknown",
      year: 2024,
      color: "Unknown",
      transmission: "Automatic",
      fuelType: "Petrol",
      confidence: 0,
      licensePlate: undefined,
      mileage: undefined,
      vin: undefined,
      seats: undefined,
      doors: undefined,
    };

    const prompt = `Analyze this image of a vehicle. First, extract the license plate number/registration if visible. Then identify the vehicle's make, model, year, color, transmission type, and fuel type. Also extract the mileage/odometer reading if visible, and the VIN if visible on any plate or sticker. Return ONLY valid JSON with these exact keys: licensePlate (string or null), make, model, year (number), color, transmission (Automatic/Manual/Semi-Automatic), fuelType (Petrol/Diesel/Electric/Hybrid/CNG), confidence (0 to 1), mileage (number in km if visible, or null), vin (string if visible, or null), seats (number if visible, or null), doors (number if visible, or null). Do not include any markdown or explanation.`;

    const text = await callOpenAIVision(args.imageUri, prompt);
    if (!text) {
      return fallback;
    }

    try {
      const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const firstBrace = cleaned.indexOf("{");
      const lastBrace = cleaned.lastIndexOf("}");
      const jsonText =
        firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace
          ? cleaned.slice(firstBrace, lastBrace + 1)
          : cleaned;

      const parsed = JSON.parse(jsonText);
      return {
        make: parsed.make || "Unknown",
        model: parsed.model || "Unknown",
        year: parsed.year || 2024,
        color: parsed.color || "Unknown",
        transmission: parsed.transmission || "Automatic",
        fuelType: parsed.fuelType || "Petrol",
        confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0,
        licensePlate: parsed.licensePlate || undefined,
        mileage: parsed.mileage || undefined,
        vin: parsed.vin || undefined,
        seats: typeof parsed.seats === "number" ? parsed.seats : undefined,
        doors: typeof parsed.doors === "number" ? parsed.doors : undefined,
      };
    } catch {
      return fallback;
    }
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
