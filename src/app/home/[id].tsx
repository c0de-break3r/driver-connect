import { useState, useRef, useEffect } from "react";
import { Platform, ScrollView, StyleSheet, Text, View, Pressable, Animated, Dimensions, Modal, TextInput, Alert } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthProvider";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import { useQuery } from "convex/react";
import { api } from "@/lib/convexApi";
import * as Haptics from "expo-haptics";

const NAVY = "#2C3E5B";
const GREEN = "#10B981";
const { width: SCREEN_WIDTH } = Dimensions.get("window");

type MockVehicle = {
  id: string;
  title: string;
  year: number;
  rating: number;
  reviewCount: number;
  pricePerDay: number;
  price: string;
  image: string;
  images?: string[];
  category: string;
  location: string;
  region: string;
  isVerified: boolean;
  condition: string;
  transmission: string;
  fuelType?: string;
  seats?: number;
  doors?: number;
  hasAc?: boolean;
  hasGps?: boolean;
  features?: string[];
  description?: string;
  ownerName: string;
  ownerAvatar: string;
  deliveryAvailable?: boolean;
  hostTrips?: number;
  hostJoinDate?: string;
  yourTrip?: { start: string; end: string; location: string };
  includedFeatures?: { icon: string; title: string; description: string }[];
  rulesOfTheRoad?: { icon: string; title: string; description: string }[];
  extras?: {
    total: number;
    categories: { category: string; items: { name: string; price: string; available: number }[] }[];
  };
  ratingBreakdown?: { label: string; value: number }[];
  reviews?: { name: string; date: string; rating: number; text: string }[];
  tripSavings?: { label: string; amount: string };
  cancellationPolicy?: { title: string; description: string };
  paymentOptions?: { title: string; description: string };
  milesIncluded?: { amount: string; extraCharge: string };
  insurance?: string;
  vehicleFeatures?: { category: string; items: string[] }[];
};

type Vehicle = {
  id: string;
  title: string;
  year: number;
  rating: number;
  reviewCount: number;
  pricePerDay: number;
  price: string;
  image: string;
  images: string[];
  category: string;
  location: string;
  region: string;
  isVerified: boolean;
  condition: string;
  transmission: string;
  fuelType?: string;
  seats?: number;
  doors?: number;
  hasAc?: boolean;
  hasGps?: boolean;
  features: string[];
  description?: string;
  ownerName: string;
  ownerAvatar: string;
  deliveryAvailable?: boolean;
  hostTrips?: number;
  hostJoinDate?: string;
  yourTrip?: { start: string; end: string; location: string };
  includedFeatures?: { icon: string; title: string; description: string }[];
  rulesOfTheRoad?: { icon: string; title: string; description: string }[];
  extras?: {
    total: number;
    categories: { category: string; items: { name: string; price: string; available: number }[] }[];
  };
  ratingBreakdown?: { label: string; value: number }[];
  reviews?: { name: string; date: string; rating: number; text: string }[];
  tripSavings?: { label: string; amount: string };
  cancellationPolicy?: { title: string; description: string };
  paymentOptions?: { title: string; description: string };
  milesIncluded?: { amount: string; extraCharge: string };
  insurance?: string;
  vehicleFeatures?: { category: string; items: string[] }[];
};

const MOCK_VEHICLES: MockVehicle[] = [
  {
    id: "mv1",
    title: "Nissan Kicks",
    year: 2025,
    rating: 4.7,
    reviewCount: 22,
    pricePerDay: 36,
    price: "GH₵ 36",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80"],
    category: "SUV",
    location: "Orlando",
    region: "Florida",
    isVerified: true,
    condition: "New",
    transmission: "Automatic",
    fuelType: "Petrol",
    seats: 5,
    doors: 4,
    hasAc: true,
    hasGps: true,
    features: ["Bluetooth", "Backup Camera", "USB Port"],
    description: "A sleek and modern SUV perfect for city drives and weekend getaways. The Nissan Kicks offers excellent fuel efficiency and a comfortable ride for up to 5 passengers.",
    ownerName: "John Doe",
    ownerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
    deliveryAvailable: true,
  },
  {
    id: "mv2",
    title: "Hyundai Kona",
    year: 2023,
    rating: 5.0,
    reviewCount: 2,
    pricePerDay: 36,
    price: "GH₵ 36",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80"],
    category: "SUV",
    location: "Orlando",
    region: "Florida",
    isVerified: true,
    condition: "New",
    transmission: "Automatic",
    fuelType: "Petrol",
    seats: 5,
    doors: 4,
    hasAc: true,
    hasGps: true,
    features: ["Bluetooth", "USB Port"],
    description: "The Hyundai Kona is a compact SUV with bold styling and advanced safety features. Great for urban commuting and short trips.",
    ownerName: "Jane Smith",
    ownerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    deliveryAvailable: true,
  },
  {
    id: "mv3",
    title: "Cherokee L",
    year: 2025,
    rating: 5.0,
    reviewCount: 8,
    pricePerDay: 49,
    price: "GH₵ 49",
    image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80"],
    category: "SUV",
    location: "Orlando",
    region: "Florida",
    isVerified: true,
    condition: "New",
    transmission: "Automatic",
    fuelType: "Petrol",
    seats: 5,
    doors: 4,
    hasAc: true,
    hasGps: true,
    features: ["Bluetooth", "Backup Camera", "USB Port", "Sunroof"],
    description: "The Cherokee L is a premium SUV with three rows of seating, perfect for families and group trips. Loaded with luxury features.",
    ownerName: "Robert Johnson",
    ownerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80",
    deliveryAvailable: true,
  },
  {
    id: "mv4",
    title: "Tesla Cybertruck",
    year: 2024,
    rating: 4.99,
    reviewCount: 201,
    pricePerDay: 151,
    price: "GH₵ 151",
    image: "https://images.unsplash.com/photo-1716438367806-222dc3d7e6b8?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1716438367806-222dc3d7e6b8?w=800&q=80"],
    category: "Truck",
    location: "Dallas",
    region: "Texas",
    isVerified: true,
    condition: "New",
    transmission: "Automatic",
    fuelType: "Electric",
    seats: 5,
    doors: 4,
    hasAc: true,
    hasGps: true,
    features: ["Autopilot", "Bluetooth", "USB Port"],
    description: "Experience the future with the Tesla Cybertruck. All-electric, ultra-strong, and packed with cutting-edge technology.",
    ownerName: "Elon M.",
    ownerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    deliveryAvailable: true,
  },
  {
    id: "mv5",
    title: "Tesla Cybertruck",
    year: 2025,
    rating: 4.83,
    reviewCount: 64,
    pricePerDay: 112,
    price: "GH₵ 112",
    image: "https://images.unsplash.com/photo-1745969920943-9a13bddb54a4?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1745969920943-9a13bddb54a4?w=800&q=80"],
    category: "Truck",
    location: "Dallas",
    region: "Texas",
    isVerified: true,
    condition: "New",
    transmission: "Automatic",
    fuelType: "Electric",
    seats: 5,
    doors: 4,
    hasAc: true,
    hasGps: true,
    features: ["Autopilot", "Bluetooth"],
    description: "The latest Cybertruck with improved range and performance. A true head-turner on any road.",
    ownerName: "Sarah T.",
    ownerAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
    deliveryAvailable: true,
  },
  {
    id: "mv6",
    title: "Toyota RAV4 Hybrid",
    year: 2025,
    rating: 4.9,
    reviewCount: 10,
    pricePerDay: 46,
    price: "GH₵ 46",
    image: "https://images.unsplash.com/photo-1621007947382-bb3c3968e3bb?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1621007947382-bb3c3968e3bb?w=800&q=80"],
    category: "SUV",
    location: "San Francisco",
    region: "California",
    isVerified: true,
    condition: "New",
    transmission: "Automatic",
    fuelType: "Hybrid",
    seats: 5,
    doors: 4,
    hasAc: true,
    hasGps: true,
    features: ["Bluetooth", "Backup Camera", "USB Port", "Apple CarPlay"],
    description: "The Toyota RAV4 Hybrid combines excellent fuel economy with spacious comfort. Perfect for long drives and daily commutes alike.",
    ownerName: "Mike Chen",
    ownerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
    deliveryAvailable: true,
  },
  {
    id: "mv7",
    title: "Toyota RAV4 Hybrid",
    year: 2022,
    rating: 5.0,
    reviewCount: 1,
    pricePerDay: 49,
    price: "GH₵ 49",
    image: "https://images.unsplash.com/photo-1578844251768-53d2b226bf6c?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1578844251768-53d2b226bf6c?w=800&q=80"],
    category: "SUV",
    location: "San Francisco",
    region: "California",
    isVerified: true,
    condition: "New",
    transmission: "Automatic",
    fuelType: "Hybrid",
    seats: 5,
    doors: 4,
    hasAc: true,
    hasGps: true,
    features: ["Bluetooth", "USB Port"],
    description: "Well-maintained Toyota RAV4 Hybrid with low mileage. Reliable, efficient, and ready for your next adventure.",
    ownerName: "Emily Davis",
    ownerAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80",
    deliveryAvailable: true,
  },
  {
    id: "mv8",
    title: "Nissan Sentra",
    year: 2019,
    rating: 4.96,
    reviewCount: 241,
    pricePerDay: 43,
    price: "GH₵ 43",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80"],
    category: "Sedan",
    location: "Dallas",
    region: "Texas",
    isVerified: true,
    condition: "New",
    transmission: "Automatic",
    fuelType: "Petrol",
    seats: 5,
    doors: 4,
    hasAc: true,
    hasGps: true,
    features: ["Bluetooth", "Backup Camera"],
    description: "A reliable and affordable sedan with excellent safety ratings. Perfect for business trips and daily commuting.",
    ownerName: "David Wilson",
    ownerAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f15?w=200&q=80",
    deliveryAvailable: true,
  },
  {
    id: "mv9",
    title: "Chevrolet Corvette",
    year: 2026,
    rating: 5.0,
    reviewCount: 1,
    pricePerDay: 287,
    price: "GH₵ 287",
    image: "https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=800&q=80"],
    category: "Sports",
    location: "Dallas",
    region: "Texas",
    isVerified: true,
    condition: "New",
    transmission: "Automatic",
    fuelType: "Petrol",
    seats: 2,
    doors: 2,
    hasAc: true,
    hasGps: true,
    features: ["Bluetooth", "Backup Camera", "Leather Seats"],
    description: "The iconic Chevrolet Corvette. Pure American muscle with breathtaking performance and head-turning design.",
    ownerName: "Alex R.",
    ownerAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80",
    deliveryAvailable: true,
  },
  {
    id: "mv10",
    title: "Audi RS 7",
    year: 2023,
    rating: 5.0,
    reviewCount: 1,
    pricePerDay: 3297,
    price: "GH₵ 3,297",
    image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&q=80"],
    category: "Luxury",
    location: "Newark",
    region: "New Jersey",
    isVerified: true,
    condition: "New",
    transmission: "Automatic",
    fuelType: "Petrol",
    seats: 4,
    doors: 4,
    hasAc: true,
    hasGps: true,
    features: ["Bluetooth", "Backup Camera", "USB Port", "Sunroof", "Heated Seats", "Leather Seats"],
    description: "The Audi RS 7 Sportback. Luxury meets performance in this stunning grand tourer. Available for monthly rental.",
    ownerName: "Luxury Fleet Inc.",
    ownerAvatar: "https://images.unsplash.com/photo-1560179707-f14e90b7c8c8?w=200&q=80",
    deliveryAvailable: true,
  },
  {
    id: "mv11",
    title: "Mercedes-Benz S-Class",
    year: 2026,
    rating: 5.0,
    reviewCount: 1,
    pricePerDay: 9271,
    price: "GH₵ 9,271",
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80"],
    category: "Luxury",
    location: "Newark",
    region: "New Jersey",
    isVerified: true,
    condition: "New",
    transmission: "Automatic",
    fuelType: "Petrol",
    seats: 4,
    doors: 4,
    hasAc: true,
    hasGps: true,
    features: ["Bluetooth", "Backup Camera", "USB Port", "Sunroof", "Heated Seats", "Leather Seats"],
    description: "The pinnacle of luxury sedans. The Mercedes-Benz S-Class offers unmatched comfort, technology, and prestige.",
    ownerName: "Prestige Cars Ltd.",
    ownerAvatar: "https://images.unsplash.com/photo-1560179707-f14e90b7c8c8?w=200&q=80",
    deliveryAvailable: true,
  },
  {
    id: "mv12",
    title: "Jeep Gladiator",
    year: 2020,
    rating: 4.6,
    reviewCount: 121,
    pricePerDay: 51,
    price: "GH₵ 51",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80"],
    category: "Truck",
    location: "Honolulu",
    region: "Hawaii",
    isVerified: true,
    condition: "New",
    transmission: "Automatic",
    fuelType: "Petrol",
    seats: 4,
    doors: 4,
    hasAc: true,
    hasGps: true,
    features: ["Bluetooth", "Backup Camera", "4x4"],
    description: "Rugged and ready for adventure. The Jeep Gladiator is the only pickup with genuine off-road capability and open-air freedom.",
    ownerName: "Rochelle",
    ownerAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
    deliveryAvailable: true,
    hostTrips: 3785,
    hostJoinDate: "Apr 2021",
    yourTrip: { start: "Sat, 26 Sep, 10:00 am", end: "Tue, 29 Sep, 10:00 am", location: "On-site at Daniel K. Inouye International Airport" },
    includedFeatures: [
      { icon: "car-outline", title: "Skip the rental counter", description: "Use the app for pickup and return instructions" },
      { icon: "people-outline", title: "Add additional drivers for free", description: "" },
      { icon: "time-outline", title: "30-minute return grace period", description: "No need to extend your trip unless you're running more than 30 minutes late" },
      { icon: "call-outline", title: "24/7 customer support", description: "" },
    ],
    rulesOfTheRoad: [
      { icon: "close-circle-outline", title: "No smoking allowed", description: "Smoking in any Africana vehicle would result in a GH₵150 fee" },
      { icon: "sparkles-outline", title: "Keep the vehicle tidy", description: "Unreasonably dirty vehicles may result in a GH₵150 fee" },
      { icon: "water-outline", title: "Refuel the vehicle", description: "Missing fuel may result in an additional fee" },
      { icon: "git-branch-outline", title: "No off-roading", description: "" },
    ],
    extras: {
      total: 7,
      categories: [
        {
          category: "Beach gear",
          items: [
             { name: "Beach chair", price: "GH₵25/trip", available: 3 },
             { name: "Beach umbrella", price: "GH₵25/trip", available: 2 },
          ],
        },
      ],
    },
    ratingBreakdown: [
      { label: "Cleanliness", value: 4.9 },
      { label: "Maintenance", value: 4.9 },
      { label: "Communication", value: 5.0 },
      { label: "Convenience", value: 5.0 },
      { label: "Listing accuracy", value: 5.0 },
    ],
    reviews: [
      {
        name: "Ingrid",
        date: "28 Jul 2026",
        rating: 5.0,
        text: "Vehicle worked perfectly. Owner was totally flexible and communicative with me. Vehicle handles the driving through vario...",
      },
    ],
    tripSavings: { label: "3+ day discount", amount: "GH₵18" },
    cancellationPolicy: { title: "Free cancellation", description: "Full refund within 24 hours of booking. More flexible options available at checkout." },
    paymentOptions: { title: "Flexible payment", description: "GH₵0 due now when you choose the Refundable option at checkout." },
    milesIncluded: { amount: "600 MI", extraCharge: "GH₵0.26 charge for each additional mile" },
    insurance: "Insurance via Travelers",
    vehicleFeatures: [
      { category: "Safety", items: ["All-wheel drive", "Backup camera"] },
      { category: "Device connectivity", items: ["Android Auto", "Apple CarPlay", "Bluetooth", "USB charger"] },
    ],
  },
  {
    id: "mv13",
    title: "Toyota Tacoma",
    year: 2026,
    rating: 4.82,
    reviewCount: 17,
    pricePerDay: 48,
    price: "GH₵ 48",
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80"],
    category: "Truck",
    location: "Honolulu",
    region: "Hawaii",
    isVerified: true,
    condition: "New",
    transmission: "Automatic",
    fuelType: "Petrol",
    seats: 4,
    doors: 4,
    hasAc: true,
    hasGps: true,
    features: ["Bluetooth", "Backup Camera", "USB Port"],
    description: "The Toyota Tacoma is a mid-size pickup built for work and play. Dependable, capable, and ready for anything.",
    ownerName: "Island Auto Co.",
    ownerAvatar: "https://images.unsplash.com/photo-1560179707-f14e90b7c8c8?w=200&q=80",
    deliveryAvailable: true,
  },
  {
    id: "mv14",
    title: "Jeep Gladiator",
    year: 2025,
    rating: 5.0,
    reviewCount: 21,
    pricePerDay: 51,
    price: "GH₵ 51",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80"],
    category: "Truck",
    location: "Atlanta",
    region: "Georgia",
    isVerified: true,
    condition: "New",
    transmission: "Automatic",
    fuelType: "Petrol",
    seats: 4,
    doors: 4,
    hasAc: true,
    hasGps: true,
    features: ["Bluetooth", "Backup Camera", "4x4"],
    description: "Brand new Jeep Gladiator with the latest features. Perfect for both urban driving and off-road adventures.",
    ownerName: "Atlanta Motors",
    ownerAvatar: "https://images.unsplash.com/photo-1560179707-f14e90b7c8c8?w=200&q=80",
    deliveryAvailable: true,
  },
  {
    id: "mv15",
    title: "Ram 1500",
    year: 2014,
    rating: 4.88,
    reviewCount: 18,
    pricePerDay: 43,
    price: "GH₵ 43",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80"],
    category: "Truck",
    location: "Atlanta",
    region: "Georgia",
    isVerified: true,
    condition: "New",
    transmission: "Automatic",
    fuelType: "Petrol",
    seats: 5,
    doors: 4,
    hasAc: true,
    hasGps: true,
    features: ["Bluetooth", "Backup Camera"],
    description: "A well-kept Ram 1500 with plenty of power and towing capacity. Great for moving or towing trailers.",
    ownerName: "Southern Trucks LLC",
    ownerAvatar: "https://images.unsplash.com/photo-1560179707-f14e90b7c8c8?w=200&q=80",
    deliveryAvailable: true,
  },
];

function normalizeVehicle(v: any): Vehicle | null {
  if (!v) return null;
  if ("_id" in v && !("id" in v)) {
    return {
      id: v._id,
      title: v.title,
      year: v.year,
      rating: v.rating,
      reviewCount: v.reviewCount ?? 0,
      pricePerDay: v.pricePerDay,
      price: `GH₵ ${v.pricePerDay}`,
      image: v.images?.[0] ?? "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
      images: v.images ?? [],
      category: v.category,
      location: v.city,
      region: v.region,
      isVerified: true,
      condition: "Listed",
      transmission: v.transmission ?? "Automatic",
      fuelType: v.fuelType,
      seats: v.seats,
      doors: v.doors,
      hasAc: v.hasAc,
      hasGps: v.hasGps,
      features: v.features ?? [],
      description: v.description,
      ownerName: v.ownerId,
      ownerAvatar: "",
      deliveryAvailable: v.deliveryAvailable,
      hostTrips: undefined,
      hostJoinDate: undefined,
      yourTrip: undefined,
      includedFeatures: undefined,
      rulesOfTheRoad: undefined,
      extras: undefined,
      ratingBreakdown: undefined,
      reviews: undefined,
      tripSavings: undefined,
      cancellationPolicy: undefined,
      paymentOptions: undefined,
      milesIncluded: undefined,
      insurance: undefined,
      vehicleFeatures: undefined,
    };
  }
  return {
    id: v.id,
    title: v.title,
    year: v.year,
    rating: v.rating,
    reviewCount: v.reviewCount,
    pricePerDay: v.pricePerDay,
    price: v.price || `GH₵ ${v.pricePerDay}`,
    image: v.image,
    images: v.images?.length ? v.images : [v.image],
    category: v.category,
    location: v.location,
    region: v.region,
    isVerified: v.isVerified,
    condition: v.condition,
    transmission: v.transmission,
    fuelType: v.fuelType,
    seats: v.seats,
    doors: v.doors,
    hasAc: v.hasAc,
    hasGps: v.hasGps,
    features: v.features || [],
    description: v.description,
    ownerName: v.ownerName,
    ownerAvatar: v.ownerAvatar,
    deliveryAvailable: v.deliveryAvailable,
  };
}

export default function VehicleDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const vehicleId = params.id;
  const { signedIn } = useAuth();
  const favorites = useFavoritesStore((state) => state.favorites);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const loadFavoritesForUser = useFavoritesStore((state) => state.loadForUser);

  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageScrollRef = useRef<ScrollView>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingStartDate, setBookingStartDate] = useState("");
  const [bookingEndDate, setBookingEndDate] = useState("");
  const heartScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadFavoritesForUser(null);
  }, [loadFavoritesForUser]);

  useEffect(() => {
    setIsFavorite(!!favorites[vehicleId]);
  }, [favorites, vehicleId]);

  const convexVehicle = useQuery(
    api.jobs.getVehicle,
    vehicleId?.startsWith("vehicles:") ? { id: vehicleId as any } : "skip"
  );

  const rawVehicle = convexVehicle ?? MOCK_VEHICLES.find((v) => v.id === vehicleId);
  const vehicle = normalizeVehicle(rawVehicle);

  const handleFavoritePress = () => {
    if (!vehicle) return;
    triggerHeartBeat();
    toggleFavorite(vehicle.id);
    setIsFavorite((prev) => !prev);
  };

  const triggerHeartBeat = () => {
    heartScale.setValue(1);
    Animated.sequence([
      Animated.timing(heartScale, { toValue: 1.4, duration: 120, useNativeDriver: true }),
      Animated.timing(heartScale, { toValue: 0.85, duration: 120, useNativeDriver: true }),
      Animated.timing(heartScale, { toValue: 1.15, duration: 120, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, tension: 180, friction: 3 }),
    ]).start();
  };

  const handleBookNow = () => {
    if (!signedIn) {
      Alert.alert("Sign in required", "Please sign in to book this vehicle.", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign in", onPress: () => router.replace("/home") },
      ]);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowBookingModal(true);
  };

  const handleImageScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    setCurrentImageIndex(index);
  };

  const handleConfirmBooking = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowBookingModal(false);
    Alert.alert("Booking submitted", "Your booking request has been received.");
  };

  const handleContactOwner = () => {
    if (!signedIn) {
      Alert.alert("Sign in required", "Please sign in to message the owner.", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign in", onPress: () => router.replace("/home") },
      ]);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert("Message sent", "Your message has been sent to the owner.");
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    for (let i = 0; i < fullStars; i++) stars.push(<Ionicons key={`full-${i}`} name="star" size={14} color="#FFB800" />);
    if (hasHalf) stars.push(<Ionicons key="half" name="star-half" size={14} color="#FFB800" />);
    const empty = 5 - fullStars - (hasHalf ? 1 : 0);
    for (let i = 0; i < empty; i++) stars.push(<Ionicons key={`empty-${i}`} name="star-outline" size={14} color="#D1D5DB" />);
    return stars;
  };

  if (!vehicle) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading vehicle...</Text>
      </View>
    );
  }

  const images = vehicle.images?.length ? vehicle.images : [vehicle.image];
  const features = vehicle.features || [];
  const specs = [
    { icon: "car-outline", label: "Transmission", value: vehicle.transmission },
    { icon: "flash-outline", label: "Fuel", value: vehicle.fuelType },
    { icon: "people-outline", label: "Seats", value: vehicle.seats?.toString() },
    { icon: "git-branch-outline", label: "Doors", value: vehicle.doors?.toString() },
    { icon: "snow-outline", label: "AC", value: vehicle.hasAc ? "Yes" : "No" },
    { icon: "navigate-outline", label: "GPS", value: vehicle.hasGps ? "Yes" : "No" },
  ].filter((s) => s.value);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image Carousel */}
        <View style={styles.imageContainer}>
          <ScrollView
            ref={imageScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleImageScroll}
          >
            {images.map((uri, idx) => (
              <Image key={idx} source={{ uri }} style={styles.heroImage} contentFit="cover" />
            ))}
          </ScrollView>
          <View style={styles.imageOverlay}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </Pressable>
            <Pressable style={styles.favoriteButton} onPress={handleFavoritePress}>
              <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={24} color={isFavorite ? "#EF4444" : "#FFFFFF"} />
              </Animated.View>
            </Pressable>
          </View>
          {images.length > 1 && (
            <View style={styles.imageIndicatorRow}>
              <Text style={styles.imageCounter}>{currentImageIndex + 1} of {images.length}</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title & Price */}
          <View style={styles.titleRow}>
            <View style={styles.titleWrap}>
              <Text style={styles.title}>{vehicle.title}</Text>
              <View style={styles.ratingRow}>
                <View style={styles.starsRow}>{renderStars(vehicle.rating)}</View>
                <Text style={styles.ratingText}>{vehicle.rating}</Text>
                <Text style={styles.reviewCount}>({vehicle.reviewCount} reviews)</Text>
              </View>
            </View>
            <View style={styles.priceBox}>
              <Text style={styles.price}>GH₵ {vehicle.pricePerDay.toLocaleString()}</Text>
              <Text style={styles.pricePeriod}>/ day</Text>
            </View>
          </View>

          {/* Location */}
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={18} color={NAVY} />
            <Text style={styles.locationText}>
              {vehicle.location}, {vehicle.region}
            </Text>
            {vehicle.deliveryAvailable && (
              <View style={styles.deliveryBadge}>
                <Ionicons name="car-outline" size={12} color={GREEN} />
                <Text style={styles.deliveryText}>Delivery available</Text>
              </View>
            )}
          </View>

          {/* Specs Grid */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vehicle Details</Text>
            <View style={styles.specsGrid}>
              {specs.map((spec, idx) => (
                <View key={idx} style={styles.specItem}>
                  <View style={styles.specIconWrap}>
                    <Ionicons name={spec.icon as any} size={20} color={NAVY} />
                  </View>
                  <Text style={styles.specLabel}>{spec.label}</Text>
                  <Text style={styles.specValue}>{spec.value}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Features */}
          {features.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Features</Text>
              <View style={styles.featuresRow}>
                {features.map((feature, idx) => (
                  <View key={idx} style={styles.featureTag}>
                    <Ionicons name="checkmark-circle" size={14} color={GREEN} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Description */}
          {vehicle.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About this vehicle</Text>
              <Text style={styles.descriptionText}>{vehicle.description}</Text>
            </View>
          )}

          {/* Owner Card */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hosted by</Text>
            <View style={styles.ownerCard}>
              <Image source={{ uri: vehicle.ownerAvatar }} style={styles.ownerAvatar} contentFit="cover" />
              <View style={styles.ownerInfo}>
                <Text style={styles.ownerName}>{vehicle.ownerName}</Text>
                <Text style={styles.ownerMeta}>
                  {typeof vehicle.hostTrips === "number" ? `${vehicle.hostTrips} trips` : "Vehicle Owner"}
                  {vehicle.hostJoinDate ? ` • Joined ${vehicle.hostJoinDate}` : ""}
                </Text>
              </View>
              <Pressable style={styles.contactButton} onPress={handleContactOwner}>
                <Ionicons name="chatbubble-outline" size={18} color={NAVY} />
                <Text style={styles.contactButtonText}>Message</Text>
              </Pressable>
            </View>
          </View>

          {/* Your trip */}
          {vehicle.yourTrip && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your trip</Text>
              <View style={styles.tripCard}>
                <View style={styles.tripRow}>
                  <View style={styles.tripItem}>
                    <Ionicons name="calendar-outline" size={20} color={NAVY} />
                    <View style={styles.tripItemBody}>
                      <Text style={styles.tripLabel}>Trip dates</Text>
                      <Text style={styles.tripValue}>{vehicle.yourTrip.start}</Text>
                      <Text style={styles.tripValue}>{vehicle.yourTrip.end}</Text>
                    </View>
                  </View>
                  <Pressable style={styles.tripEditButton}>
                    <Ionicons name="pencil-outline" size={18} color={NAVY} />
                  </Pressable>
                </View>
                <View style={[styles.tripRow, styles.tripRowBorderTop]}>
                  <View style={styles.tripItem}>
                    <Ionicons name="airplane-outline" size={20} color={NAVY} />
                    <View style={styles.tripItemBody}>
                      <Text style={styles.tripLabel}>Pickup & return location</Text>
                      <Text style={styles.tripValue}>{vehicle.yourTrip.location}</Text>
                    </View>
                  </View>
                  <Pressable style={styles.tripEditButton}>
                    <Ionicons name="pencil-outline" size={18} color={NAVY} />
                  </Pressable>
                </View>
              </View>
            </View>
          )}

          {/* Included in the price */}
          {vehicle.includedFeatures && vehicle.includedFeatures.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Included in the price</Text>
              <View style={styles.includedCard}>
                {vehicle.includedFeatures.map((feature, idx) => (
                  <View key={idx} style={styles.includedRow}>
                    <Ionicons name={feature.icon as any} size={20} color={NAVY} />
                    <View style={styles.includedTextWrap}>
                      <Text style={styles.includedTitle}>{feature.title}</Text>
                      {!!feature.description && (
                        <Text style={styles.includedDesc}>{feature.description}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Rules of the road */}
          {vehicle.rulesOfTheRoad && vehicle.rulesOfTheRoad.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rules of the road</Text>
              <View style={styles.rulesCard}>
                {vehicle.rulesOfTheRoad.map((rule, idx) => (
                  <View key={idx} style={styles.ruleRow}>
                    <Ionicons name={rule.icon as any} size={20} color={NAVY} />
                    <View style={styles.ruleTextWrap}>
                      <Text style={styles.ruleTitle}>{rule.title}</Text>
                      {!!rule.description && (
                        <Text style={styles.ruleDesc}>{rule.description}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Extras */}
          {vehicle.extras && (
            <View style={styles.section}>
              <View style={styles.extrasHeaderRow}>
                <Text style={styles.sectionTitle}>Extras ({vehicle.extras.total})</Text>
              </View>
              <Text style={styles.extrasSubtext}>Add optional Extras to your trip at checkout.</Text>
              {vehicle.extras.categories.map((cat, catIdx) => (
                <View key={catIdx} style={styles.extrasCategory}>
                  <Text style={styles.extrasCategoryTitle}>{cat.category}</Text>
                  {cat.items.map((item, itemIdx) => (
                    <View key={itemIdx} style={styles.extrasRow}>
                      <View style={styles.extrasItemInfo}>
                        <Text style={styles.extrasItemName}>{item.name}</Text>
                        <Text style={styles.extrasItemPrice}>{item.price}</Text>
                      </View>
                      <Text style={styles.extrasAvailability}>{item.available} available</Text>
                    </View>
                  ))}
                </View>
              ))}
              <Pressable style={styles.extrasViewMore}>
                <Text style={styles.extrasViewMoreText}>View {vehicle.extras.total - (vehicle.extras.categories[0]?.items.length ?? 0)} more</Text>
              </Pressable>
            </View>
          )}

          {/* Trip savings */}
          {vehicle.tripSavings && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trip savings</Text>
              <View style={styles.savingsRow}>
                <Text style={styles.savingsLabel}>{vehicle.tripSavings.label}</Text>
                <Text style={styles.savingsAmount}>{vehicle.tripSavings.amount}</Text>
              </View>
            </View>
          )}

          {/* Cancellation policy */}
          {vehicle.cancellationPolicy && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cancellation policy</Text>
              <View style={styles.infoRow}>
                <View style={styles.infoIconWrap}>
                  <Ionicons name="thumbs-up-outline" size={20} color={NAVY} />
                </View>
                <View style={styles.infoTextWrap}>
                  <Text style={styles.infoTitle}>{vehicle.cancellationPolicy.title}</Text>
                  <Text style={styles.infoDesc}>{vehicle.cancellationPolicy.description}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Payment options */}
          {vehicle.paymentOptions && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment options</Text>
              <View style={styles.infoRow}>
                <View style={styles.infoIconWrap}>
                  <Ionicons name="card-outline" size={20} color={NAVY} />
                </View>
                <View style={styles.infoTextWrap}>
                  <Text style={styles.infoTitle}>{vehicle.paymentOptions.title}</Text>
                  <Text style={styles.infoDesc}>{vehicle.paymentOptions.description}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Miles included */}
          {vehicle.milesIncluded && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Miles included</Text>
              <View style={styles.infoRow}>
                <View style={styles.infoIconWrap}>
                  <Ionicons name="speedometer-outline" size={20} color={NAVY} />
                </View>
                <View style={styles.infoTextWrap}>
                  <Text style={styles.infoTitle}>{vehicle.milesIncluded.amount}</Text>
                  <Text style={styles.infoDesc}>{vehicle.milesIncluded.extraCharge}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Insurance & Protection */}
          {vehicle.insurance && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Insurance & Protection</Text>
              <View style={styles.infoRow}>
                <View style={styles.infoIconWrap}>
                  <Ionicons name="shield-checkmark-outline" size={20} color={NAVY} />
                </View>
                <View style={styles.infoTextWrap}>
                  <Text style={styles.infoTitle}>{vehicle.insurance}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Vehicle features */}
          {vehicle.vehicleFeatures && vehicle.vehicleFeatures.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Vehicle features</Text>
              {vehicle.vehicleFeatures.map((group, idx) => (
                <View key={idx} style={styles.featureGroup}>
                  <Text style={styles.featureGroupTitle}>{group.category}</Text>
                  {group.items.map((item, itemIdx) => (
                    <Text key={itemIdx} style={styles.featureListItem}>{item}</Text>
                  ))}
                </View>
              ))}
              <Pressable style={styles.featureSeeAllButton}>
                <Text style={styles.featureSeeAllText}>See all {vehicle.features.length + 6} features</Text>
              </Pressable>
            </View>
          )}

          {/* Ratings breakdown */}
          {vehicle.ratingBreakdown && vehicle.ratingBreakdown.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ratings and reviews</Text>
              <Text style={styles.ratingsSummary}>
                {vehicle.rating} <Ionicons name="star" size={16} color="#FFB800" /> ({vehicle.reviewCount} ratings)
              </Text>
              {vehicle.ratingBreakdown.map((item, idx) => (
                <View key={idx} style={styles.ratingRowItem}>
                  <Text style={styles.ratingRowLabel}>{item.label}</Text>
                  <View style={styles.ratingBarBg}>
                    <View style={[styles.ratingBarFill, { width: `${(item.value / 5) * 100}%` }]} />
                  </View>
                  <Text style={styles.ratingRowValue}>{item.value}</Text>
                </View>
              ))}
              <Text style={styles.ratingsSubtext}>Based on {vehicle.reviewCount} guest ratings</Text>
            </View>
          )}

          {/* Reviews */}
          {vehicle.reviews && vehicle.reviews.length > 0 && (
            <View style={styles.section}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.reviewsScroll}>
                {vehicle.reviews.map((review, idx) => (
                  <View key={idx} style={styles.reviewCard}>
                    <Image source={{ uri: `https://i.pravatar.cc/150?u=${review.name}` }} style={styles.reviewAvatar} contentFit="cover" />
                    <View style={styles.reviewHeader}>
                      <Text style={styles.reviewName}>{review.name}</Text>
                      <Text style={styles.reviewDate}>{review.date}</Text>
                    </View>
                    <View style={styles.reviewStars}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Ionicons key={i} name="star" size={14} color="#FFB800" />
                      ))}
                    </View>
                    <Text style={styles.reviewText} numberOfLines={3}>{review.text}</Text>
                    <Pressable style={styles.reviewMoreButton}>
                      <Text style={styles.reviewMoreText}>Read more</Text>
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
              <Pressable style={styles.reviewsSeeAll}>
                <Text style={styles.reviewsSeeAllText}>See all reviews</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Continue Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceWrap}>
          <Text style={styles.bottomPriceOriginal}>GH₵ 169</Text>
          <Text style={styles.bottomPrice}> GH₵ 152 total</Text>
          <Text style={styles.bottomPriceLabel}>Before taxes</Text>
        </View>
        <Pressable style={styles.continueButton} onPress={handleBookNow}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </Pressable>
      </View>

      {/* Booking Modal */}
      <Modal visible={showBookingModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book {vehicle.title}</Text>
              <Pressable onPress={() => setShowBookingModal(false)}>
                <Ionicons name="close" size={24} color={NAVY} />
              </Pressable>
            </View>
            <View style={styles.modalBody}>
              <View style={styles.modalPriceRow}>
                <Text style={styles.modalPrice}>GH₵ {vehicle.pricePerDay.toLocaleString()}</Text>
                <Text style={styles.modalPriceLabel}>per day</Text>
              </View>
              <Text style={styles.modalLabel}>Start Date</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
                value={bookingStartDate}
                onChangeText={setBookingStartDate}
              />
              <Text style={styles.modalLabel}>End Date</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
                value={bookingEndDate}
                onChangeText={setBookingEndDate}
              />
              <Pressable style={styles.confirmButton} onPress={handleConfirmBooking}>
                <Text style={styles.confirmButtonText}>Confirm Booking</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
    position: "relative",
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  titleWrap: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: NAVY,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "700",
    color: NAVY,
  },
  reviewCount: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  priceBox: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 20,
    fontWeight: "800",
    color: GREEN,
  },
  pricePeriod: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 24,
  },
  locationText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    flex: 1,
  },
  deliveryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  deliveryText: {
    fontSize: 12,
    fontWeight: "600",
    color: GREEN,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: NAVY,
    marginBottom: 12,
  },
  specsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  specItem: {
    width: "47%",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  specIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  specLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#6B7280",
    textTransform: "uppercase",
  },
  specValue: {
    fontSize: 13,
    fontWeight: "700",
    color: NAVY,
  },
  featuresRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  featureTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  featureText: {
    fontSize: 13,
    fontWeight: "500",
    color: NAVY,
  },
  descriptionText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#4B5563",
    lineHeight: 22,
  },
  ownerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
  },
  ownerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E5E7EB",
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
    marginBottom: 2,
  },
  ownerMeta: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  contactButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: NAVY,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
    paddingBottom: Platform.OS === "ios" ? 28 : 16,
  },
  bottomPriceWrap: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "wrap",
  },
  bottomPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: NAVY,
  },
  bottomPriceLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
    marginLeft: 4,
  },
  bookButton: {
    backgroundColor: NAVY,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 28,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: NAVY,
  },
  modalBody: {
    gap: 12,
  },
  modalPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginBottom: 8,
  },
  modalPrice: {
    fontSize: 22,
    fontWeight: "800",
    color: GREEN,
  },
  modalPriceLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: NAVY,
    marginTop: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: NAVY,
    backgroundColor: "#F9FAFB",
  },
  confirmButton: {
    backgroundColor: GREEN,
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: "center",
    marginTop: 16,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  tripCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  tripRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tripRowBorderTop: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
    paddingTop: 12,
    marginTop: 4,
  },
  tripItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    flex: 1,
  },
  tripItemBody: {
    flex: 1,
  },
  tripLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  tripValue: {
    fontSize: 14,
    fontWeight: "600",
    color: NAVY,
  },
  tripEditButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  includedCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  includedRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  includedTextWrap: {
    flex: 1,
  },
  includedTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: NAVY,
    marginBottom: 2,
  },
  includedDesc: {
    fontSize: 13,
    fontWeight: "400",
    color: "#6B7280",
    lineHeight: 18,
  },
  rulesCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  ruleTextWrap: {
    flex: 1,
  },
  ruleTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: NAVY,
    marginBottom: 2,
  },
  ruleDesc: {
    fontSize: 13,
    fontWeight: "400",
    color: "#6B7280",
    lineHeight: 18,
  },
  extrasHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  extrasSubtext: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6B7280",
    marginTop: -8,
    marginBottom: 12,
    lineHeight: 20,
  },
  extrasCategory: {
    marginBottom: 16,
  },
  extrasCategoryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: NAVY,
    marginBottom: 8,
  },
  extrasRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  extrasItemInfo: {
    flex: 1,
  },
  extrasItemName: {
    fontSize: 14,
    fontWeight: "500",
    color: NAVY,
    marginBottom: 2,
  },
  extrasItemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: NAVY,
  },
  extrasAvailability: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  extrasViewMore: {
    alignItems: "flex-end",
    marginTop: 4,
  },
  extrasViewMoreText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6366F1",
  },
  savingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
  },
  savingsLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: NAVY,
  },
  savingsAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: GREEN,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  infoTextWrap: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: NAVY,
    marginBottom: 2,
  },
  infoDesc: {
    fontSize: 13,
    fontWeight: "400",
    color: "#6B7280",
    lineHeight: 18,
  },
  featureGroup: {
    marginBottom: 12,
  },
  featureGroupTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
    marginBottom: 6,
  },
  featureListItem: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
    marginBottom: 4,
    paddingLeft: 8,
  },
  featureSeeAllButton: {
    marginTop: 8,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  featureSeeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: NAVY,
  },
  ratingsSummary: {
    fontSize: 14,
    fontWeight: "600",
    color: NAVY,
    marginBottom: 12,
  },
  ratingRowItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  ratingRowLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#4B5563",
    width: 140,
  },
  ratingBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  ratingBarFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#6366F1",
  },
  ratingRowValue: {
    fontSize: 13,
    fontWeight: "700",
    color: NAVY,
    width: 32,
    textAlign: "right",
  },
  ratingsSubtext: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 4,
  },
  reviewsScroll: {
    gap: 12,
    paddingBottom: 8,
  },
  reviewCard: {
    width: SCREEN_WIDTH * 0.75,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E5E7EB",
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reviewName: {
    fontSize: 14,
    fontWeight: "700",
    color: NAVY,
  },
  reviewDate: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  reviewStars: {
    flexDirection: "row",
    gap: 2,
  },
  reviewText: {
    fontSize: 13,
    fontWeight: "400",
    color: "#4B5563",
    lineHeight: 18,
  },
  reviewMoreButton: {
    alignSelf: "flex-start",
  },
  reviewMoreText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6366F1",
  },
  reviewsSeeAll: {
    alignItems: "center",
    marginTop: 8,
  },
  reviewsSeeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6366F1",
  },
  imageIndicatorRow: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  imageCounter: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bottomPriceOriginal: {
    fontSize: 14,
    fontWeight: "500",
    color: "#9CA3AF",
    textDecorationLine: "line-through",
  },
  continueButton: {
    backgroundColor: NAVY,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 28,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
