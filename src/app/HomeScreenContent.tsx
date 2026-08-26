import { useState, useRef, useEffect, useCallback } from "react";
import { ScrollView, StyleSheet, View, Pressable, Animated, RefreshControl, FlatList, Dimensions } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LayoutGrid, List } from "lucide-react-native";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { SearchBar } from "@/components/ui/search-bar";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthProvider";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import { useQuery } from "convex/react";
import { api } from "@/lib/convexApi";
import VehicleCard from "@/components/VehicleCard";
import DriverCard from "@/components/DriverCard";
import HorizontalSection from "@/components/HorizontalSection";
import Toast from "@/components/Toast";
import { driversRepository } from "@/data/repositories/driversRepository";
import { vehiclesRepository } from "@/data/repositories/vehiclesRepository";
import { Driver, FeaturedVehicle } from "@/types/explore";
import { useDoubleTap } from "@/hooks/useDoubleTap";
import { useToast } from "@/hooks/useToast";
import { getUserRegion } from "@/lib/userLocation";

const NAVY = "#2C3E5B";
const ICON_SIZE_BASE = 20;
const ICON_SIZE_ACTIVE = 24;

const CATEGORY_OPTIONS = [
  { id: "all", label: "All", icon: "apps-outline" as const },
  { id: "drivers", label: "Drivers", icon: "person-outline" as const },
  { id: "airports", label: "Airports", icon: "airplane-outline" as const },
  { id: "monthly", label: "Monthly", icon: "calendar-outline" as const },
  { id: "nearby", label: "Nearby", icon: "location-outline" as const },
  { id: "delivered", label: "Delivered", icon: "checkmark-done-outline" as const },
  { id: "cities", label: "Cities", icon: "business-outline" as const },
];

type HomeScreenContentProps = {
  onLoginPress?: () => void;
};

type SortOption = "recommended" | "price_asc" | "price_desc" | "rating";

export function HomeScreenContent({ onLoginPress }: HomeScreenContentProps = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResult, setSelectedResult] = useState<any | null>(null);
  const [focused, setFocused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [placesResults, setPlacesResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("recommended");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showAllVehicles, setShowAllVehicles] = useState(false);
  const [userRegion, setUserRegion] = useState<string | null>(null);

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [driversLoading, setDriversLoading] = useState(true);
  const [featuredVehicles, setFeaturedVehicles] = useState<FeaturedVehicle[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);

  const categoryScrollRef = useRef<ScrollView>(null);
  const chipMeasurements = useRef<{ [key: string]: { x: number; width: number } }>({}).current;

  const handleCategoryPress = (id: string) => {
    setSelectedCategory(id);
    const measurement = chipMeasurements[id];
    if (measurement && categoryScrollRef.current) {
      const screenWidth = Dimensions.get("window").width;
      const targetX = measurement.x - screenWidth / 2 + measurement.width / 2;
      categoryScrollRef.current.scrollTo({ x: Math.max(0, targetX), animated: true });
    }
  };

  const handleChipLayout = (id: string, event: any) => {
    const { x, width } = event.nativeEvent.layout;
    chipMeasurements[id] = { x, width };
  };

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

  const { signedIn, email } = useAuth();
  const savedItems = useFavoritesStore((state) => state.savedItems);
  const loadFavoritesForUser = useFavoritesStore((state) => state.loadForUser);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    loadFavoritesForUser(email);
  }, [email, loadFavoritesForUser]);

  useEffect(() => {
    getUserRegion().then((region) => {
      setUserRegion(region);
    });
  }, []);

  useEffect(() => {
    driversRepository.getTopRated(userRegion ?? undefined).then((data) => {
      setDrivers(data);
      setDriversLoading(false);
    });
  }, [userRegion]);

  useEffect(() => {
    vehiclesRepository.getFeatured(userRegion ?? undefined).then((data) => {
      setFeaturedVehicles(data);
      setVehiclesLoading(false);
    });
  }, [userRegion]);

  const iconAnim = useRef(new Animated.Value(ICON_SIZE_BASE)).current;
  const heartAnims = useRef<Map<string, Animated.Value>>(new Map()).current;
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const peopleSearchResults = useQuery(
    api.users.searchUsers,
    searchQuery.trim().length > 0 ? { searchTerm: searchQuery.trim() } : "skip"
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    setDriversLoading(true);
    setVehiclesLoading(true);
    try {
      const [driversData, vehiclesData] = await Promise.all([
        driversRepository.getTopRated(userRegion ?? undefined),
        vehiclesRepository.getFeatured(userRegion ?? undefined),
      ]);
      setDrivers(driversData);
      setFeaturedVehicles(vehiclesData);
    } finally {
      setDriversLoading(false);
      setVehiclesLoading(false);
      setRefreshing(false);
    }
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

  const sortDrivers = (list: Driver[]) => {
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

  const sortedDrivers = sortDrivers(drivers);
  const sortedFeaturedVehicles = sortVehicles(featuredVehicles as any[]);
  const displayedVehicles = sortVehicles(vehicles);

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

  const renderDriverCard = useCallback((driver: Driver) => {
    const heartScale = getHeartAnim(driver.id);
    return (
      <DriverCard
        driver={driver}
        isFavorite={savedItems.some((item) => item.id === driver.id)}
        onPress={() => handleDriverPress(driver.id)}
        onFavoritePress={() => handleFavoritePress(driver.id, driver.name, driver.image, driver.hourlyRate, driver.location, driver.rating)}
      />
    );
  }, [savedItems, handleDriverPress, handleFavoritePress]);

  const renderVehicleCard = useCallback((vehicle: FeaturedVehicle) => {
    const heartScale = getHeartAnim(vehicle.id);
    return (
      <Pressable onPress={() => handleVehiclePress(vehicle.id)}>
        <VehicleCard
          vehicle={{
            id: vehicle.id,
            title: vehicle.title,
            category: vehicle.subtitle.split("·")[0]?.trim() || "",
            location: vehicle.subtitle.split("·").pop()?.trim() || "",
            region: "",
            price: `GH₵ ${vehicle.pricePerDay}`,
            originalPrice: "",
            period: "per day",
            rating: 0,
            image: vehicle.image,
            ownerName: "",
            ownerAvatar: "",
            isVerified: false,
            condition: "Listed",
            transmission: "Automatic",
            yearsOnPlatform: "New",
          }}
          isFavorite={savedItems.some((item) => item.id === vehicle.id)}
          onPress={() => handleVehiclePress(vehicle.id)}
          onFavoritePress={() => handleFavoritePress(vehicle.id, vehicle.title, vehicle.image, `GH₵ ${vehicle.pricePerDay}`, vehicle.subtitle, 0)}
        />
      </Pressable>
    );
  }, [savedItems, handleVehiclePress, handleFavoritePress]);

  return (
    <View className="flex-1 bg-white">
      {/* Fixed header */}
      <View className="bg-white pt-4 pb-3">
        {/* Unified search */}
        <View className="mx-5 relative z-20">
          <SearchBar
            size="md"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={clearSearch}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Search places or people"
            icon={
              selectedResult ? (
                <Pressable onPress={clearSearch}>
                  <Ionicons name="arrow-back" size={ICON_SIZE_BASE} color={NAVY} />
                </Pressable>
              ) : undefined
            }
            className="rounded-[20px] border-[1.5px] border-[#E5E7EB] bg-white"
          />

          {focused && (searchQuery.trim().length > 0 || isSearching) && (
            <View className="mt-1 bg-white rounded-xl border border-gray-200 overflow-hidden" style={{ height: 210, zIndex: 30, elevation: 30 }}>
              {isSearching ? (
                <View className="px-4 py-3 gap-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <View key={index} className="flex-row items-center gap-3">
                      <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
                      <View className="flex-1 gap-1.5">
                        <Skeleton className="h-4 w-3/4 rounded-full" />
                        <Skeleton className="h-3 w-1/2 rounded-full" />
                      </View>
                    </View>
                  ))}
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

        {/* Active chips + count + view toggle */}
        <View className="flex-row items-center justify-between px-5 mt-3 gap-2">
          <Text variant="small" className="text-gray-400 h-9 flex items-center">Found {vehicles.length} ads</Text>
          <View className="flex-row items-center gap-2">
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
          <ScrollView
            ref={categoryScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingHorizontal: 20 }}
          >
            {CATEGORY_OPTIONS.map((chip) => (
              <Pressable
                key={chip.id}
                onLayout={(e) => handleChipLayout(chip.id, e)}
                className={`flex-row items-center gap-1.5 px-[18px] py-[10px] rounded-full border ${selectedCategory === chip.id ? "bg-[#2C3E5B] border-[#2C3E5B]" : "bg-white border-gray-200"}`}
                onPress={() => handleCategoryPress(chip.id)}
              >
                <Ionicons
                  name={chip.icon}
                  size={14}
                  color={selectedCategory === chip.id ? "#FFFFFF" : "#6B7280"}
                />
                <Text
                  className={`text-xs font-semibold ${selectedCategory === chip.id ? "text-white" : "text-gray-500"}`}
                >
                  {chip.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
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

            <View style={viewMode === "list" ? styles.list : styles.grid}>
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
            </View>
          </>
        ) : (
          <>
            {/* Top Rated Drivers Section */}
            <HorizontalSection<Driver>
              title="Top Rated"
              subtitle="Drivers"
              data={sortedDrivers}
              loading={driversLoading}
              emptyTitle="No drivers found"
              emptySubtitle="Check back later for verified drivers"
              seeAllRoute="/drivers"
              seeAllLabel="See All"
              renderItem={renderDriverCard}
              cardWidth={160}
              keyExtractor={(driver) => driver.id}
            />

            {/* Featured Vehicles Section */}
            <HorizontalSection<FeaturedVehicle>
              title="Popular"
              subtitle="Vehicles"
              data={sortedFeaturedVehicles}
              loading={vehiclesLoading}
              emptyTitle="No featured vehicles"
              emptySubtitle="Check back later for new listings"
              seeAllRoute="/vehicles"
              seeAllLabel="See All"
              renderItem={renderVehicleCard}
              cardWidth={160}
              keyExtractor={(vehicle) => vehicle.id}
            />

            {/* All Vehicles Section */}
            {!showAllVehicles ? (
              <HorizontalSection<any>
                title="All"
                subtitle="Vehicles"
                data={vehicles.slice(0, 8)}
                loading={convexVehicles === undefined}
                emptyTitle="No vehicles found"
                emptySubtitle="Check back later for new listings"
                seeAllLabel="See All"
                renderItem={(vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle as any}
                    isFavorite={savedItems.some((item) => item.id === vehicle.id)}
                    onPress={() => handleVehiclePress(vehicle.id)}
                    onFavoritePress={() => handleFavoritePress(vehicle.id, vehicle.title, vehicle.image, vehicle.price, vehicle.location, vehicle.rating)}
                    list={false}
                  />
                )}
                cardWidth={160}
                onSeeAll={() => setShowAllVehicles(true)}
                keyExtractor={(vehicle) => vehicle.id}
              />
            ) : (
              <View className="mt-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-lg font-extrabold text-[#2C3E5B]">All Vehicles</Text>
                  <Pressable onPress={() => setShowAllVehicles(false)}>
                    <Text className="text-xs font-bold text-gray-400">Show Less</Text>
                  </Pressable>
                </View>
                <View style={viewMode === "list" ? styles.list : styles.grid}>
                  {vehicles.map((vehicle) => (
                    <VehicleCard
                      key={vehicle.id}
                      vehicle={vehicle as any}
                      isFavorite={savedItems.some((item) => item.id === vehicle.id)}
                      onPress={() => handleVehiclePress(vehicle.id)}
                      onFavoritePress={() => handleFavoritePress(vehicle.id, vehicle.title, vehicle.image, vehicle.price, vehicle.location, vehicle.rating)}
                      list={viewMode === "list"}
                      style={viewMode === "list" ? styles.listCard : undefined}
                    />
                  ))}
                </View>
              </View>
            )}
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
});
