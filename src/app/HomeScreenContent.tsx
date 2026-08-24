import { useState, useRef, useEffect } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable, TextInput, Animated, RefreshControl, FlatList } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Search, X, SlidersHorizontal, LayoutGrid, List } from "lucide-react-native";
import { Card } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthProvider";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import { useQuery } from "convex/react";
import { api } from "@/lib/convexApi";
import VehicleCard from "@/components/VehicleCard";
import Toast from "@/components/Toast";
import { DRIVERS } from "@/data/drivers";
import { useDoubleTap } from "@/hooks/useDoubleTap";
import { useToast } from "@/hooks/useToast";

const NAVY = "#2C3E5B";
const ICON_SIZE_BASE = 20;
const ICON_SIZE_ACTIVE = 24;

const FEATURED_VEHICLES = [
  {
    id: "f1",
    title: "Toyota Hilux 2022",
    subtitle: "Double Cab · 4x4 · Ashanti",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
    pricePerDay: 169,
  },
  {
    id: "f2",
    title: "Mercedes-Benz C300",
    subtitle: "Luxury sedan · Greater Accra",
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
    pricePerDay: 220,
  },
  {
    id: "f3",
    title: "Toyota Hiace 2021",
    subtitle: "14-seater bus · Central Region",
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&q=80",
    pricePerDay: 180,
  },
  {
    id: "f4",
    title: "Yamaha YZF-R3",
    subtitle: "Sport motorcycle · Accra",
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80",
    pricePerDay: 85,
  },
  {
    id: "f5",
    title: "Ford Ranger 2023",
    subtitle: "Pickup · 4x4 · Eastern Region",
    image: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&q=80",
    pricePerDay: 195,
  },
  {
    id: "f6",
    title: "Honda Accord 2022",
    subtitle: "Sedan · Greater Accra",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80",
    pricePerDay: 140,
  },
  {
    id: "f7",
    title: "Nissan Patrol 2021",
    subtitle: "SUV · 7 seats · Northern Region",
    image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80",
    pricePerDay: 210,
  },
  {
    id: "f8",
    title: "Suzuki GSX-R750",
    subtitle: "Sport bike · Ashanti",
    image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80",
    pricePerDay: 95,
  },
];

type HomeScreenContentProps = {
  onLoginPress?: () => void;
};

type SortOption = "recommended" | "price_asc" | "price_desc" | "rating";

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: "recommended", label: "Recommended" },
  { id: "price_asc", label: "Price: Low to High" },
  { id: "price_desc", label: "Price: High to Low" },
  { id: "rating", label: "Highest Rated" },
];

const CATEGORY_OPTIONS = [
  { id: "all", label: "All" },
  { id: "drivers", label: "Drivers" },
  { id: "airports", label: "Airports" },
  { id: "monthly", label: "Monthly" },
  { id: "nearby", label: "Nearby" },
  { id: "delivered", label: "Delivered" },
  { id: "cities", label: "Cities" },
];

export function HomeScreenContent({ onLoginPress }: HomeScreenContentProps = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResult, setSelectedResult] = useState<any | null>(null);
  const [focused, setFocused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [placesResults, setPlacesResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("recommended");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const convexVehicles = useQuery(api.jobs.listVehicles, {});
  const vehicles = (convexVehicles ?? []).map((v: any) => ({
    id: v._id,
    title: v.title,
    category: v.category,
    location: v.city,
    region: v.region,
    price: `GH₵ ${v.pricePerDay}`,
    originalPrice: v.pricePerWeek ? `GH₵ ${v.pricePerWeek}` : undefined,
    period: "per day",
    rating: v.rating,
    image: v.images?.[0] ?? "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
    images: v.images ?? [],
    message: "Explore this vehicle",
    ownerName: v.ownerId,
    ownerAvatar: "",
    isVerified: true,
    condition: "Listed",
    transmission: v.transmission ?? "Automatic",
    yearsOnPlatform: "New",
    pricePerDay: v.pricePerDay,
  }));

  const sectionAnims = useRef<Animated.Value[]>(
    Array.from({ length: 6 }, () => new Animated.Value(1))
  ).current;
  const { signedIn, email } = useAuth();
  const savedItems = useFavoritesStore((state) => state.savedItems);
  const loadFavoritesForUser = useFavoritesStore((state) => state.loadForUser);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    loadFavoritesForUser(email);
  }, [email, loadFavoritesForUser]);

  const iconAnim = useRef(new Animated.Value(ICON_SIZE_BASE)).current;
  const heartAnims = useRef<Map<string, Animated.Value>>(new Map()).current;
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const peopleSearchResults = useQuery(
    api.users.searchUsers,
    searchQuery.trim().length > 0 ? { searchTerm: searchQuery.trim() } : "skip"
  );

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const getHeartAnim = (id: string) => {
    if (!heartAnims.has(id)) {
      heartAnims.set(id, new Animated.Value(1));
    }
    return heartAnims.get(id)!;
  };

  const handleVehiclePress = useDoubleTap((id: string) => {
    router.push(`/vehicle-details?id=${id}` as any);
  });

  const handleDriverPress = useDoubleTap((driverId: string) => {
    router.push(`/driver-details?id=${driverId}` as any);
  });

  const handleFavoritePress = (id: string, title: string, image: string, price: string, location: string, rating: number) => {
    if (!signedIn) {
      showToast("Please sign in to save favorites", "warning");
      onLoginPress?.();
      return;
    }
    const anim = getHeartAnim(id);
    anim.setValue(1);
    Animated.sequence([
      Animated.timing(anim, { toValue: 1.35, duration: 120, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0.85, duration: 120, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 1.15, duration: 120, useNativeDriver: true }),
      Animated.spring(anim, { toValue: 1, useNativeDriver: true, tension: 180, friction: 3 }),
    ]).start();
    showToast(`Saved ${title} to favorites`, "success");
    router.push(`/favorites/save-to-favorites?vehicle=${encodeURIComponent(JSON.stringify({
      id, title, image, price, location, rating,
    }))}` as any);
  };

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const query = searchQuery.trim();
    if (!query) {
      setPlacesResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&components=country:gh&locationbias=circle:80000000@7.9465,-1.0232&key=${apiKey}`
        );
        const data = await response.json();

        if (data.status === "OK" && data.predictions) {
          setPlacesResults(data.predictions);
        } else {
          setPlacesResults([]);
        }
      } catch (error) {
        console.log("Places search error:", error);
        setPlacesResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleFocus = () => {
    setFocused(true);
    Animated.spring(iconAnim, {
      toValue: ICON_SIZE_ACTIVE,
      useNativeDriver: true,
      damping: 14,
      stiffness: 180,
    }).start();
  };

  const handleBlur = () => {
    setFocused(false);
    Animated.spring(iconAnim, {
      toValue: ICON_SIZE_BASE,
      useNativeDriver: true,
      damping: 14,
      stiffness: 180,
    }).start();
  };

  const handleResultSelect = (item: any) => {
    setSelectedResult(item);
    setSearchQuery(item.title);
    setFocused(false);
  };

  const clearSearch = () => {
    setSelectedResult(null);
    setSearchQuery("");
    setPlacesResults([]);
    setIsSearching(false);
  };

  const handleViewModeToggle = () => {
    setViewMode((prev) => (prev === "grid" ? "list" : "grid"));
  };

  const sortVehicles = (list: any[]) => {
    const sorted = [...list];
    switch (sortBy) {
      case "price_asc":
        return sorted.sort((a, b) => (a.pricePerDay ?? 0) - (b.pricePerDay ?? 0));
      case "price_desc":
        return sorted.sort((a, b) => (b.pricePerDay ?? 0) - (a.pricePerDay ?? 0));
      case "rating":
        return sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      default:
        return sorted;
    }
  };

  const sortDrivers = (list: typeof DRIVERS) => {
    const sorted = [...list];
    switch (sortBy) {
      case "price_asc":
        return sorted.sort((a, b) => parseFloat(a.hourlyRate.replace(/[^0-9.]/g, "")) - parseFloat(b.hourlyRate.replace(/[^0-9.]/g, "")));
      case "price_desc":
        return sorted.sort((a, b) => parseFloat(b.hourlyRate.replace(/[^0-9.]/g, "")) - parseFloat(a.hourlyRate.replace(/[^0-9.]/g, "")));
      case "rating":
        return sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      default:
        return sorted;
    }
  };

  const displayedVehicles = sortVehicles(vehicles);
  const sortedFeaturedVehicles = sortVehicles(FEATURED_VEHICLES);
  const sortedDrivers = sortDrivers(DRIVERS);

  const handleSort = (option: SortOption) => {
    setSortBy(option);
  };

  const iconScale = iconAnim.interpolate({
    inputRange: [ICON_SIZE_BASE, ICON_SIZE_ACTIVE],
    outputRange: [1, 1.25],
  });

  const combinedResults = (() => {
    const results: any[] = [];

    if (peopleSearchResults && peopleSearchResults.length > 0) {
      peopleSearchResults.forEach((user: any) => {
        results.push({
          id: `person-${user._id}`,
          type: "person",
          title: user.firstName || "Unknown",
          subtitle: user.role === "owner" || user.role === "corporate" ? "Owner" : user.role === "client" ? "Guest" : user.role,
          image: user.avatarUri || null,
          data: user,
        });
      });
    }

    if (placesResults.length > 0) {
      placesResults.forEach((place: any) => {
        results.push({
          id: `place-${place.place_id}`,
          type: "place",
          title: place.structured_formatting?.main_text || place.description,
          subtitle: place.structured_formatting?.secondary_text || "",
          image: null,
          data: place,
        });
      });
    }

    return results;
  })();

  return (
    <View className="flex-1 bg-white">
      {/* Fixed header */}
      <View className="bg-white pt-4 pb-3">
        {/* Unified search */}
        <View className="mx-5 relative z-20">
          <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-3.5 py-2.5 gap-2.5">
            {selectedResult ? (
              <Pressable onPress={clearSearch}>
                <Ionicons name="arrow-back" size={ICON_SIZE_BASE} color={NAVY} />
              </Pressable>
            ) : (
              <Animated.View style={{ transform: [{ scale: iconScale }] }}>
                <Search size={ICON_SIZE_BASE} color={NAVY} />
              </Animated.View>
            )}
            <TextInput
              className="flex-1 text-base text-[#2C3E5B]"
              placeholder="Search places or people"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={clearSearch}>
                <X size={ICON_SIZE_BASE} color="#9CA3AF" />
              </Pressable>
            )}
          </View>

          {focused && (searchQuery.trim().length > 0 || isSearching) && (
            <View className="mt-1 bg-white rounded-xl border border-gray-200 overflow-hidden" style={{ height: 180, zIndex: 30, elevation: 30 }}>
              {isSearching ? (
                <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
                  <Text className="text-sm text-gray-500">Searching...</Text>
                </View>
              ) : combinedResults.length > 0 ? (
                <FlatList
                  data={combinedResults}
                  keyExtractor={(item) => item.id}
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <Pressable
                      className="flex-row items-center px-4 py-3 border-b border-gray-100 gap-3"
                      onPress={() => handleResultSelect(item)}
                    >
                      <View className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center">
                        {item.type === "person" && item.image ? (
                          <Image
                            source={{ uri: item.image }}
                            className="w-9 h-9 rounded-full"
                            contentFit="cover"
                          />
                        ) : item.type === "place" ? (
                          <Ionicons name="location-outline" size={ICON_SIZE_BASE} color={NAVY} />
                        ) : (
                          <Ionicons name="person-outline" size={ICON_SIZE_BASE} color={NAVY} />
                        )}
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-[#2C3E5B]">{item.title}</Text>
                        {item.subtitle ? (
                          <Text className="text-xs text-gray-500 mt-0.5">{item.subtitle}</Text>
                        ) : null}
                      </View>
                      <Text className="text-[10px] font-semibold text-gray-400 uppercase">
                        {item.type === "place" ? "Place" : item.data?.role === "client" ? "Guest" : "Person"}
                      </Text>
                    </Pressable>
                  )}
                />
              ) : (
                <View className="px-4 py-6 items-center">
                  <Text className="text-sm text-gray-500 text-center">No results found</Text>
                  <Text className="text-xs text-gray-400 text-center mt-1">Try a different search term</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Active chips + count + sort + view toggle */}
        <View className="flex-row items-center justify-between px-5 mt-3 gap-2">
          <Text className="text-xs font-semibold text-gray-400">Found {displayedVehicles.length} ads</Text>
          <View className="flex-row items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Pressable className="flex-row items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-gray-200">
                  <SlidersHorizontal size={14} color={NAVY} />
                  <Text className="text-xs font-semibold text-[#2C3E5B]">Sort</Text>
                  <Ionicons name="chevron-down" size={12} color={NAVY} />
                </Pressable>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="end" className="min-w-[200px]">
                {SORT_OPTIONS.map((option) => (
                  <DropdownMenuItem key={option.id} onPress={() => handleSort(option.id)}>
                    <Text className={sortBy === option.id ? "text-sm font-bold text-[#2C3E5B]" : "text-sm text-[#2C3E5B]"}>
                      {option.label}
                    </Text>
                    {sortBy === option.id && (
                      <Ionicons name="checkmark" size={16} color={NAVY} className="ml-auto" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Pressable
              className="w-9 h-9 rounded-full bg-white border border-gray-200 items-center justify-center"
              onPress={handleViewModeToggle}
            >
              {viewMode === "grid" ? (
                <LayoutGrid size={18} color={NAVY} />
              ) : (
                <List size={18} color={NAVY} />
              )}
            </Pressable>
          </View>
        </View>

        {/* Category filter chips */}
        <View className="mt-3">
          <SegmentedControl
            options={CATEGORY_OPTIONS.map(opt => opt.label)}
            value={CATEGORY_OPTIONS.find(opt => opt.id === selectedCategory)?.label || "All"}
            onValueChange={(label) => {
              const found = CATEGORY_OPTIONS.find(opt => opt.label === label);
              if (found) setSelectedCategory(found.id);
            }}
            size="sm"
          />
        </View>
      </View>

      {/* Scrollable content */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, gap: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#2C3E5B" colors={["#2C3E5B"]} />
        }
      >
        {selectedResult ? (
          <>
            {/* Search results */}
            <View className="flex-row items-center justify-between mt-2">
              <View>
                <Text className="text-base font-bold text-[#2C3E5B]">
                  Results for <Text className="text-[#2C3E5B]">{searchQuery}</Text>
                </Text>
                <Text className="text-xs text-gray-500 mt-0.5">
                  {selectedResult.type === "place" ? "Place" : "Person"} • Ghana
                </Text>
              </View>
            </View>

            <Animated.View
              style={[
                viewMode === "list" ? styles.list : styles.grid,
                {
                  opacity: sectionAnims[0],
                  transform: [
                    {
                      scale: sectionAnims[0].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.96, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              {displayedVehicles.filter((v) => {
                const query = searchQuery.toLowerCase();
                return (
                  v.title.toLowerCase().includes(query) ||
                  (v.location ?? "").toLowerCase().includes(query) ||
                  (v.category ?? "").toLowerCase().includes(query)
                );
              }).map((vehicle) => {
                return (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle as any}
                  isFavorite={savedItems.some((item) => item.id === vehicle.id)}
                  onPress={() => handleVehiclePress(vehicle.id)}
                  onFavoritePress={() => handleFavoritePress(vehicle.id, vehicle.title, vehicle.image, vehicle.price, vehicle.location, vehicle.rating)}
                  list={viewMode === "list"}
                  style={viewMode === "list" ? styles.listCard : undefined}
                />
                );
              })}
            </Animated.View>
          </>
        ) : (
          <>
            {/* Top Rated Drivers */}
            <View className="flex-row items-center justify-between mt-2">
              <Text className="text-lg font-extrabold text-white">Top Rated Drivers</Text>
            </View>
            <Animated.View
              style={[
                viewMode === "list" ? styles.list : styles.grid,
                {
                  opacity: sectionAnims[1],
                  transform: [
                    {
                      scale: sectionAnims[1].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.96, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
               {sortedDrivers.map((driver) => {
                const heartScale = getHeartAnim(driver.id);
                const triggerHeartBeat = () => {
                  heartScale.setValue(1);
                  Animated.sequence([
                    Animated.timing(heartScale, { toValue: 1.35, duration: 120, useNativeDriver: true }),
                    Animated.timing(heartScale, { toValue: 0.85, duration: 120, useNativeDriver: true }),
                    Animated.timing(heartScale, { toValue: 1.15, duration: 120, useNativeDriver: true }),
                    Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, tension: 180, friction: 3 }),
                  ]).start();
                };
                return (
                <Pressable key={driver.id} style={[styles.card, viewMode === "list" ? styles.listCard : undefined]} onPress={() => handleDriverPress(driver.id)}>
                  <Card className={`p-0 overflow-hidden ${viewMode === "list" ? "flex-row" : ""}`}>
                    <View style={[styles.imageWrap, viewMode === "list" && styles.listImageWrap]}>
                      <Image source={{ uri: driver.image }} style={styles.cardImage} contentFit="cover" />
                        <Pressable style={styles.favoriteBadge} onPress={() => {
                          triggerHeartBeat();
                          handleFavoritePress(driver.id, driver.name, driver.image, driver.hourlyRate, driver.location, driver.rating);
                        }}>
                          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                            <Ionicons
                              name={savedItems.some((item) => item.id === driver.id) ? "heart" : "heart-outline"}
                              size={22}
                              color={savedItems.some((item) => item.id === driver.id) ? "#E74C3C" : "#FFFFFF"}
                            />
                          </Animated.View>
                        </Pressable>
                    </View>
                    <View style={[styles.cardBody, viewMode === "list" && styles.listCardBody]}>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {driver.name}
                      </Text>
                      <Text style={styles.cardSubtitle}>{driver.location}</Text>
                      <View style={styles.ratingRow}>
                        <Ionicons name="star" size={12} color="#FFB800" />
                        <Text style={styles.ratingText}>{driver.rating}</Text>
                        <Text style={styles.tripsText}>({driver.trips} trips)</Text>
                      </View>
                      <View style={styles.rateRow}>
                        <Text style={styles.rateText}>{driver.hourlyRate}/hr</Text>
                        {driver.isVerified && (
                          <View className="flex-row items-center gap-1 ml-auto px-2 py-0.5 rounded-md bg-emerald-50">
                            <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                            <Text className="text-[#10B981] font-bold text-[11px]">Verified</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.metaRow}>
                        <Text style={styles.yearsText}>{driver.yearsOnPlatform}</Text>
                        <Text style={styles.vehicleTypeText}>{driver.vehicleType}</Text>
                      </View>
                    </View>
                  </Card>
                </Pressable>
              );
            })}
            </Animated.View>

            {/* Featured Vehicles */}
            <View className="flex-row items-center justify-between mt-2">
              <Text className="text-lg font-extrabold text-white">Featured Vehicles</Text>
            </View>

            <Animated.View
              style={[
                viewMode === "list" ? styles.list : styles.grid,
                {
                  opacity: sectionAnims[2],
                  transform: [
                    {
                      scale: sectionAnims[2].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.96, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              {sortedFeaturedVehicles.map((vehicle) => {
                const heartScale = getHeartAnim(vehicle.id);
                const triggerHeartBeat = () => {
                  heartScale.setValue(1);
                  Animated.sequence([
                    Animated.timing(heartScale, { toValue: 1.35, duration: 120, useNativeDriver: true }),
                    Animated.timing(heartScale, { toValue: 0.85, duration: 120, useNativeDriver: true }),
                    Animated.timing(heartScale, { toValue: 1.15, duration: 120, useNativeDriver: true }),
                    Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, tension: 180, friction: 3 }),
                  ]).start();
                };
                return (
                <Pressable key={vehicle.id} style={[styles.featuredCard, viewMode === "list" ? styles.listCard : undefined]} onPress={() => handleVehiclePress(vehicle.id)}>
                  <Card className={`p-0 overflow-hidden ${viewMode === "list" ? "flex-row" : ""}`}>
                    <View style={[styles.imageWrap, viewMode === "list" && styles.listImageWrap]}>
                      <Image
                        source={{ uri: vehicle.image }}
                        style={styles.cardImage}
                        contentFit="cover"
                        onError={() => handleImageError(vehicle.id)}
                      />
                      {imageErrors[vehicle.id] && (
                        <View style={styles.imageFallback}>
                          <Ionicons name="image-outline" size={24} color="#9CA3AF" />
                        </View>
                      )}
                      <View style={styles.topRightActions}>
                        <Pressable style={styles.favoriteBadge} onPress={() => {
                          triggerHeartBeat();
                          handleFavoritePress(vehicle.id, vehicle.title, vehicle.image, `GH₵ ${vehicle.pricePerDay}`, vehicle.location, vehicle.rating);
                        }}>
                          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                            <Ionicons
                              name={savedItems.some((item) => item.id === vehicle.id) ? "heart" : "heart-outline"}
                              size={22}
                              color={savedItems.some((item) => item.id === vehicle.id) ? "#E74C3C" : "#FFFFFF"}
                            />
                          </Animated.View>
                        </Pressable>
                      </View>
                    </View>
                    <View style={[styles.cardBody, viewMode === "list" && styles.listCardBody]}>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {vehicle.title}
                      </Text>
                      <Text style={styles.cardSubtitle}>{vehicle.subtitle}</Text>
                    </View>
                  </Card>
                </Pressable>
              );
            })}
            </Animated.View>
          </>
        )}
      </ScrollView>

        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={hideToast}
        />

    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    flexDirection: "column",
    gap: 14,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  listCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  card: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
  },
  featuredCard: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  imageWrap: {
    position: "relative",
    width: "100%",
    height: 120,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  favoriteBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  topRightActions: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    gap: 8,
  },
  imageFallback: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  cardBody: {
    padding: 10,
    gap: 4,
    flex: 1,
  },
  listCardBody: {
    padding: 12,
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: NAVY,
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  rateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "700",
    color: NAVY,
  },
  tripsText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#6B7280",
  },
  rateText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#10B981",
    marginTop: 4,
  },
  vehicleTypeText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  yearsText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  listImageWrap: {
    width: 140,
    aspectRatio: 1.5,
    flexShrink: 1,
  },
});
