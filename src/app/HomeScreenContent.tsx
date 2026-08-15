import { useState, useRef, useEffect } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable, TextInput, Animated, RefreshControl, FlatList, Dimensions, Alert } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthProvider";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import { useQuery } from "convex/react";
import { api } from "@/lib/convexApi";
import { VehicleCard } from "@/components/VehicleCard";

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
];

const DRIVERS = [
  {
    id: "d1",
    name: "Kwame Asante",
    role: "Driver",
    location: "Kumasi, Ashanti",
    rating: 4.98,
    trips: 342,
    hourlyRate: "GH₵ 35",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    isVerified: true,
    yearsOnPlatform: "5+ years",
    vehicleType: "Sedan, SUV",
  },
  {
    id: "d2",
    name: "Ama Serwaa",
    role: "Driver",
    location: "Accra, Greater Accra",
    rating: 4.95,
    trips: 518,
    hourlyRate: "GH₵ 45",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
    isVerified: true,
    yearsOnPlatform: "6+ years",
    vehicleType: "Luxury, SUV",
  },
  {
    id: "d3",
    name: "Kofi Mensah",
    role: "Driver",
    location: "Tema, Greater Accra",
    rating: 4.88,
    trips: 215,
    hourlyRate: "GH₵ 30",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
    isVerified: true,
    yearsOnPlatform: "4+ years",
    vehicleType: "Van, Bus",
  },
  {
    id: "d4",
    name: "Abena Osei",
    role: "Driver",
    location: "Cape Coast, Central",
    rating: 4.92,
    trips: 289,
    hourlyRate: "GH₵ 40",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
    isVerified: true,
    yearsOnPlatform: "5+ years",
    vehicleType: "Sedan, Truck",
  },
];

type HomeScreenContentProps = {
  onLoginPress?: () => void;
};

export function HomeScreenContent({ onLoginPress }: HomeScreenContentProps = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResult, setSelectedResult] = useState<any | null>(null);
  const [focused, setFocused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [placesResults, setPlacesResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortBy, setSortBy] = useState<"recommended" | "price_asc" | "price_desc" | "rating">("recommended");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

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

  const topRatedVehicles = vehicles.filter((v: any) => (v.rating ?? 0) >= 4.9);
  const verifiedVehicles = vehicles.filter((v: any) => v.isVerified);
  const topOwnersNearby = verifiedVehicles.slice(0, 4);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const sectionAnims = useRef<Animated.Value[]>(
    Array.from({ length: 6 }, () => new Animated.Value(1))
  ).current;
  const { signedIn, email } = useAuth();
  const favorites = useFavoritesStore((state) => state.favorites);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const loadFavoritesForUser = useFavoritesStore((state) => state.loadForUser);

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

  const handleVehiclePress = (id: string) => {
    router.push(`/vehicle-details?id=${id}` as any);
  };

  const handleFavoritePress = (id: string, title: string, image: string, price: string, location: string, rating: number) => {
    if (!signedIn) {
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

  const displayedVehicles = sortVehicles(vehicles);
  const sortedFeaturedVehicles = sortVehicles(FEATURED_VEHICLES);

  const chips = [
    { id: "all", label: "All", icon: "people-outline", family: "ion" as const },
    { id: "drivers", label: "Drivers", icon: "car-outline", family: "ion" as const },
    { id: "airports", label: "Airports", icon: "airplane-outline", family: "ion" as const },
    { id: "monthly", label: "Monthly", icon: "calendar-outline", family: "ion" as const },
    { id: "nearby", label: "Nearby", icon: "location-outline", family: "ion" as const },
    { id: "delivered", label: "Delivered", icon: "car-sport-outline", family: "ion" as const },
    { id: "cities", label: "Cities", icon: "business-outline", family: "ion" as const },
  ];

  const handleSort = (option: "recommended" | "price_asc" | "price_desc" | "rating") => {
    setSortBy(option);
    setShowSortDropdown(false);
  };

  const categoryScrollViewRef = useRef<ScrollView>(null);
  const chipLayouts = useRef<{ [key: string]: { x: number; width: number } }>({}).current;

  const handleCategoryPress = (id: string) => {
    setSelectedCategory(id);

    const layout = chipLayouts[id];
    if (layout && categoryScrollViewRef.current) {
      const scrollViewWidth = Dimensions.get("window").width - 40;
      const targetX = layout.x - scrollViewWidth / 2 + layout.width / 2;
      categoryScrollViewRef.current.scrollTo({ x: Math.max(0, targetX), animated: true });
    }
  };

  const handleChipLayout = (id: string, event: any) => {
    const { x, width } = event.nativeEvent.layout;
    chipLayouts[id] = { x, width };
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
    <View style={styles.container}>
      {/* Fixed header */}
      <View style={styles.header}>
        {/* Unified search */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchTextInputContainer}>
            {selectedResult ? (
              <Pressable onPress={clearSearch}>
                <Ionicons name="arrow-back" size={ICON_SIZE_BASE} color={NAVY} />
              </Pressable>
            ) : (
              <Animated.View style={{ transform: [{ scale: iconScale }] }}>
                <Ionicons name="search-outline" size={ICON_SIZE_BASE} color={NAVY} />
              </Animated.View>
            )}
            <TextInput
              style={styles.searchInput}
              placeholder="Search places or people"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={clearSearch}>
                <Ionicons name="close-circle" size={ICON_SIZE_BASE} color="#9CA3AF" />
              </Pressable>
            )}
          </View>

          {focused && (searchQuery.trim().length > 0 || isSearching) && (
            <View style={styles.unifiedSearchResults}>
              {isSearching ? (
                <View style={styles.searchResultRow}>
                  <Text style={styles.searchResultText}>Searching...</Text>
                </View>
              ) : combinedResults.length > 0 ? (
                <FlatList
                  data={combinedResults}
                  keyExtractor={(item) => item.id}
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  style={styles.unifiedSearchFlatList}
                  renderItem={({ item }) => (
                    <Pressable
                      style={styles.searchResultRow}
                      onPress={() => handleResultSelect(item)}
                    >
                      <View style={styles.searchResultIcon}>
                        {item.type === "person" && item.image ? (
                          <Image
                            source={{ uri: item.image }}
                            style={styles.searchResultAvatar}
                            contentFit="cover"
                          />
                        ) : item.type === "place" ? (
                          <Ionicons name="location-outline" size={ICON_SIZE_BASE} color={NAVY} />
                        ) : (
                          <Ionicons name="person-outline" size={ICON_SIZE_BASE} color={NAVY} />
                        )}
                      </View>
                      <View style={styles.searchResultInfo}>
                        <Text style={styles.searchResultTitle}>{item.title}</Text>
                        {item.subtitle ? (
                          <Text style={styles.searchResultSubtitle}>{item.subtitle}</Text>
                        ) : null}
                      </View>
                      <Text style={styles.searchResultType}>
                        {item.type === "place" ? "Place" : item.data?.role === "client" ? "Guest" : "Person"}
                      </Text>
                    </Pressable>
                  )}
                />
              ) : (
                <View style={styles.searchResultRow}>
                  <Text style={styles.searchResultText}>No results found</Text>
                  <Text style={styles.searchResultSubtext}>Try a different search term</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Active chips + count + sort + view toggle */}
        <View style={styles.exploreControls}>
          <Text style={styles.adsCount}>Found {displayedVehicles.length} ads</Text>
          <View style={styles.controlsRight}>
            <View style={styles.sortWrapper}>
              <Pressable style={styles.sortButton} onPress={() => setShowSortDropdown(!showSortDropdown)}>
                <Text style={styles.sortButtonText}>Sort</Text>
                <Ionicons name={showSortDropdown ? "chevron-up" : "chevron-down"} size={14} color={NAVY} />
              </Pressable>
              {showSortDropdown && (
                <View style={styles.sortDropdown}>
                  {[
                    { id: "recommended", label: "Recommended" },
                    { id: "price_asc", label: "Price: Low to High" },
                    { id: "price_desc", label: "Price: High to Low" },
                    { id: "rating", label: "Highest Rated" },
                  ].map((option) => (
                    <Pressable
                      key={option.id}
                      style={[styles.sortOption, sortBy === option.id && styles.sortOptionActive]}
                      onPress={() => handleSort(option.id as any)}
                    >
                      <Text style={[styles.sortOptionText, sortBy === option.id && styles.sortOptionTextActive]}>
                        {option.label}
                      </Text>
                      {sortBy === option.id && (
                        <Ionicons name="checkmark" size={18} color={NAVY} />
                      )}
                     </Pressable>
                   ))}
                </View>
              )}
            </View>
            <Pressable
              style={styles.viewToggle}
              onPress={handleViewModeToggle}
            >
              <Ionicons name={viewMode === "grid" ? "grid-outline" : "list-outline"} size={18} color={NAVY} />
            </Pressable>
          </View>
        </View>

        {/* Category filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryChipsRow}
          ref={categoryScrollViewRef}
        >
          {chips.map((chip) => (
            <Pressable
              key={chip.id}
              style={[styles.categoryChip, selectedCategory === chip.id && styles.categoryChipActive]}
              onPress={() => handleCategoryPress(chip.id)}
              onLayout={(e) => handleChipLayout(chip.id, e)}
            >
              <Ionicons name={chip.icon as any} size={18} color={selectedCategory === chip.id ? "#FFFFFF" : NAVY} />
              <Text style={[styles.categoryChipText, selectedCategory === chip.id && styles.categoryChipTextActive]}>{chip.label}</Text>
            </Pressable>
          )
        )}
        </ScrollView>
      </View>

      {/* Scrollable content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#10B981" colors={["#10B981"]} />
        }
      >
        {selectedResult ? (
          <>
            {/* Search results */}
            <View style={styles.sectionHeader}>
              <Text style={styles.searchResultsTitle}>
                <Text>Results for </Text>
                <Text style={styles.searchResultsQuery}>{searchQuery}</Text>
              </Text>
              <Text style={styles.searchResultsSubtitle}>
                {selectedResult.type === "place" ? "Place" : "Person"} • Ghana
              </Text>
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
                if (vehicle.id === "7") {
                  return (
                    <Pressable key={vehicle.id} style={styles.mosaicCard} onPress={() => handleVehiclePress(vehicle.id)}>
                      <View style={styles.mosaicGrid}>
                        <View style={styles.mosaicItem}>
                          <Image source={{ uri: vehicle.images?.[0] }} style={styles.mosaicImage} contentFit="cover" />
                        </View>
                        <View style={styles.mosaicItem}>
                          <Image source={{ uri: vehicle.images?.[1] }} style={styles.mosaicImage} contentFit="cover" />
                        </View>
                        <View style={styles.mosaicItem}>
                          <Image source={{ uri: vehicle.images?.[2] }} style={styles.mosaicImage} contentFit="cover" />
                        </View>
                        <View style={styles.mosaicItem}>
                          <Image source={{ uri: vehicle.images?.[3] }} style={styles.mosaicImage} contentFit="cover" />
                        </View>
                      </View>
                      <View style={styles.mosaicOverlay}>
                        <Text style={styles.mosaicTitle}>{vehicle.title}</Text>
                        <Text style={styles.mosaicMessage}>{vehicle.message}</Text>
                      </View>
                    </Pressable>
                  );
                }

                return (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle as any}
                  isFavorite={!!favorites[vehicle.id]}
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
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Rated Drivers</Text>
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
               {DRIVERS.map((driver) => {
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
                <Pressable key={driver.id} style={[styles.card, viewMode === "list" ? styles.listCard : undefined]} onPress={() => router.push(`/driver-details?id=${driver.id}` as any)}>
                  <View style={[styles.imageWrap, viewMode === "list" && styles.listImageWrap]}>
                    <Image source={{ uri: driver.image }} style={styles.cardImage} contentFit="cover" />
                      <Pressable style={styles.favoriteBadge} onPress={() => {
                        triggerHeartBeat();
                        handleFavoritePress(driver.id, driver.name, driver.image, driver.hourlyRate, driver.location, driver.rating);
                      }}>
                        <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                          <Ionicons
                            name={favorites[driver.id] ? "heart" : "heart-outline"}
                            size={22}
                            color={favorites[driver.id] ? "#E74C3C" : "#FFFFFF"}
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
                        <View style={styles.verifiedBadgeInline}>
                          <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                          <Text style={styles.verifiedBadgeText}>Verified</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={styles.yearsText}>{driver.yearsOnPlatform}</Text>
                      <Text style={styles.vehicleTypeText}>{driver.vehicleType}</Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
            </Animated.View>

            {/* Featured Vehicles */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Vehicles</Text>
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
                            name={favorites[vehicle.id] ? "heart" : "heart-outline"}
                            size={22}
                            color={favorites[vehicle.id] ? "#E74C3C" : "#FFFFFF"}
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
                </Pressable>
              );
            })}
            </Animated.View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) {
  return (
    <View style={[styles.cardStyle, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: 16,
    paddingBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 20,
  },

  /* Search */
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    paddingHorizontal: 16,
    height: 52,
    gap: 12,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#2C3E5B",
    paddingVertical: 0,
    backgroundColor: "transparent",
    borderBottomWidth: 0,
    borderBottomColor: "transparent",
    textDecorationLine: "none",
  },
   searchTextInputContainer: {
     flexDirection: "row",
     alignItems: "center",
     backgroundColor: "#FFFFFF",
     borderRadius: 20,
     paddingHorizontal: 14,
     paddingVertical: 10,
     height: 44,
     gap: 10,
     borderWidth: 1.5,
     borderColor: "#E5E7EB",
   },
   searchAutocompleteContainer: {
     marginHorizontal: 20,
     position: "relative",
     zIndex: 10,
   },
   searchListView: {
     marginTop: 4,
     backgroundColor: "#FFFFFF",
     borderRadius: 14,
     borderWidth: 1,
     borderColor: "#E5E7EB",
     maxHeight: 240,
     width: "100%",
     zIndex: 10,
     elevation: 10,
   },
  searchRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  searchWrapper: {
    marginHorizontal: 20,
    position: "relative",
    zIndex: 20,
  },
    unifiedSearchResults: {
      position: "absolute",
      top: 56,
      left: 0,
      right: 0,
      backgroundColor: "#FFFFFF",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: "#E5E7EB",
      height: 180,
      zIndex: 30,
      elevation: 30,
    },
  searchResultRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
     borderBottomColor: "#E5E7EB",
     gap: 12,
   },
   searchResultIcon: {
     width: 36,
     height: 36,
     borderRadius: 18,
     backgroundColor: "#F3F4F6",
     alignItems: "center",
     justifyContent: "center",
   },
  searchResultAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E5B",
  },
  searchResultSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  searchResultText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    paddingVertical: 12,
  },
  searchResultSubtext: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 4,
  },
  searchResultType: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9CA3AF",
    textTransform: "uppercase",
  },
  unifiedSearchFlatList: {
    flex: 1,
  },
  searchResultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  searchResultsBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  searchResultsHeaderText: {
    flex: 1,
  },
  searchResultsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C3E5B",
  },
  searchResultsQuery: {
    fontWeight: "800",
    color: "#2C3E5B",
  },
  searchResultsSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },

  /* Explore controls */
  exploreControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 12,
    gap: 10,
  },
  chipsRow: {
    gap: 8,
    flex: 1,
  },
  activeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  activeChipCheck: {
    color: "#10B981",
    fontWeight: "700",
  },
  activeChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: NAVY,
  },
  controlsRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  adsCount: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2C3E5B",
  },
  viewToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedBadgeTop: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
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

  /* Continue searching */
  continueCard: {
    backgroundColor: "#111111",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
  },
  continueContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  continueTextWrap: {
    flex: 1,
  },
  continueTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  continueDate: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9CA3AF",
    marginTop: 6,
  },
  continueImageWrap: {
    width: 88,
    height: 88,
    borderRadius: 16,
    overflow: "hidden",
  },
  continueImage: {
    width: "100%",
    height: "100%",
  },

  /* Sections */
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    flex: 1,
  },

  /* Grid */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  list: {
    flexDirection: "column",
    gap: 14,
  },
  listCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  listImageWrap: {
    width: 140,
    height: 140,
    flexShrink: 1,
  },
  listCardBody: {
    padding: 12,
    justifyContent: "center",
    flex: 1,
  },
  card: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
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
  saveBadge: {
    position: "absolute",
    top: 8,
    right: 44,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
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
    padding: 12,
    gap: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2C3E5B",
  },
  cardCategory: {
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
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
    color: NAVY,
  },
  originalPrice: {
    fontSize: 12,
    fontWeight: "500",
    color: "#9CA3AF",
    textDecorationLine: "line-through",
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },

  /* Mosaic message card */
  mosaicCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  mosaicGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    height: 80,
  },
  mosaicItem: {
    width: "50%",
    height: "50%",
    padding: 1,
  },
  mosaicImage: {
    width: "100%",
    height: "100%",
    borderRadius: 2,
  },
  mosaicOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  mosaicTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 2,
  },
  mosaicMessage: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    opacity: 0.95,
  },

  /* Generic card */
  cardStyle: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 8,
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },

  /* Category chips */
  categoryChipsRow: {
    paddingHorizontal: 20,
    gap: 10,
    marginTop: 12,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  categoryChipActive: {
    backgroundColor: NAVY,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2C3E5B",
  },
  categoryChipTextActive: {
    color: "#FFFFFF",
  },

  /* Sort */
  sortWrapper: {
    position: "relative",
  },
  sortDropdown: {
    position: "absolute",
    top: "100%",
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 6,
    zIndex: 50,
    elevation: 10,
    minWidth: 200,
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    marginTop: 4,
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  sortOptionActive: {
    backgroundColor: "#F3F4F6",
  },
  sortOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2C3E5B",
  },
  sortOptionTextActive: {
    fontWeight: "700",
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  verifiedBadgeInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: "#ECFDF5",
  },
  verifiedBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#10B981",
  },
});

export default HomeScreenContent;
