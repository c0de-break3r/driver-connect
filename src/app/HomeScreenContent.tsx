import { useState, useRef, useEffect } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable, TextInput, Animated, RefreshControl, FlatList } from "react-native";
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

const FILTERS = ["All", "Vehicles", "Drivers", "Chauffeur"];

export const VEHICLES = [
  {
    id: "1",
    title: "Hyundai Santa Fe 2020 Gray",
    category: "SUV",
    location: "Madina",
    region: "Greater Accra",
    price: "GH₵250,000",
    originalPrice: "GH₵280,000",
    period: "for 2 days",
    rating: 4.98,
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
    ownerName: "Luke Eshun",
    ownerAvatar: "https://ui-avatars.com/api/?name=Luke+Eshun&background=2C3E5B&color=fff",
    isVerified: true,
    condition: "Foreign Used",
    transmission: "Automatic",
    yearsOnPlatform: "5+ years on Africana",
  },
  {
    id: "2",
    title: "Hyundai Santa Fe 2015 Silver",
    category: "SUV",
    location: "Madina",
    region: "Greater Accra",
    price: "GH₵225,000",
    originalPrice: "GH₵260,000",
    period: "for 2 days",
    rating: 4.88,
    image: "https://images.unsplash.com/photo-1551522435-a13afa82f300?w=800&q=80",
    ownerName: "Nana Agyemang Motors",
    ownerAvatar: "https://ui-avatars.com/api/?name=Nana+Agyemang&background=2C3E5B&color=fff",
    isVerified: true,
    condition: "Foreign Used",
    transmission: "Automatic",
    yearsOnPlatform: "5+ years on Africana",
  },
  {
    id: "3",
    title: "Hyundai Elantra 2015 Gray",
    category: "Sedan",
    location: "Madina",
    region: "Greater Accra",
    price: "GH₵78,000",
    originalPrice: "GH₵95,000",
    period: "for 2 days",
    rating: 4.85,
    image: "https://images.unsplash.com/photo-1563720223185-1103d5164cdb?w=800&q=80",
    ownerName: "Nana Danquah",
    ownerAvatar: "https://ui-avatars.com/api/?name=Nana+Danquah&background=2C3E5B&color=fff",
    isVerified: true,
    condition: "Local Used",
    transmission: "Automatic",
    yearsOnPlatform: "3+ years on Africana",
  },
  {
    id: "4",
    title: "Toyota Corolla 2018 White",
    category: "Sedan",
    location: "Kumasi",
    region: "Ashanti",
    price: "GH₵120,000",
    originalPrice: "GH₵145,000",
    period: "for 2 days",
    rating: 4.92,
    image: "https://images.unsplash.com/photo-1621007947382-bb3c3968e3bb?w=800&q=80",
    ownerName: "Kwame Asare",
    ownerAvatar: "https://ui-avatars.com/api/?name=Kwame+Asare&background=2C3E5B&color=fff",
    isVerified: true,
    condition: "Foreign Used",
    transmission: "Automatic",
    yearsOnPlatform: "4+ years on Africana",
  },
  {
    id: "5",
    title: "Nissan Patrol 2019 Black",
    category: "SUV",
    location: "Accra",
    region: "Greater Accra",
    price: "GH₵320,000",
    originalPrice: "GH₵380,000",
    period: "for 3 days",
    rating: 4.95,
    image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80",
    ownerName: "Ama Serwaa",
    ownerAvatar: "https://ui-avatars.com/api/?name=Ama+Serwaa&background=2C3E5B&color=fff",
    isVerified: true,
    condition: "Foreign Used",
    transmission: "Automatic",
    yearsOnPlatform: "6+ years on Africana",
  },
  {
    id: "6",
    title: "Mitsubishi Pajero 2017 Red",
    category: "SUV",
    location: "Tema",
    region: "Greater Accra",
    price: "GH₵180,000",
    originalPrice: "GH₵210,000",
    period: "for 2 days",
    rating: 4.78,
    image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80",
    ownerName: "Kofi Mensah",
    ownerAvatar: "https://ui-avatars.com/api/?name=Kofi+Mensah&background=2C3E5B&color=fff",
    isVerified: false,
    condition: "Local Used",
    transmission: "Manual",
    yearsOnPlatform: "2+ years on Africana",
  },
  {
    id: "8",
    title: "Honda CR-V 2020 Blue",
    category: "SUV",
    location: "Cape Coast",
    region: "Central",
    price: "GH₵280,000",
    originalPrice: "GH₵320,000",
    period: "for 2 days",
    rating: 4.90,
    image: "https://images.unsplash.com/photo-1568608889924-24dbd84c702c?w=800&q=80",
    ownerName: "Yaw Boateng",
    ownerAvatar: "https://ui-avatars.com/api/?name=Yaw+Boateng&background=2C3E5B&color=fff",
    isVerified: true,
    condition: "Foreign Used",
    transmission: "Automatic",
    yearsOnPlatform: "5+ years on Africana",
  },
  {
    id: "9",
    title: "Ford Ranger 2019 White",
    category: "Truck",
    location: "Kumasi",
    region: "Ashanti",
    price: "GH₵190,000",
    originalPrice: "GH₵230,000",
    period: "for 2 days",
    rating: 4.85,
    image: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&q=80",
    ownerName: "Abena Osei",
    ownerAvatar: "https://ui-avatars.com/api/?name=Abena+Osei&background=2C3E5B&color=fff",
    isVerified: true,
    condition: "Foreign Used",
    transmission: "Automatic",
    yearsOnPlatform: "3+ years on Africana",
  },
  {
    id: "10",
    title: "Suzuki Swift 2016 Silver",
    category: "Sedan",
    location: "Accra",
    region: "Greater Accra",
    price: "GH₵65,000",
    originalPrice: "GH₵80,000",
    period: "for 1 day",
    rating: 4.72,
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80",
    ownerName: "Kojo Bannerman",
    ownerAvatar: "https://ui-avatars.com/api/?name=Kojo+Bannerman&background=2C3E5B&color=fff",
    isVerified: false,
    condition: "Local Used",
    transmission: "Manual",
    yearsOnPlatform: "1+ year on Africana",
  },
  {
    id: "11",
    title: "Toyota Hiace 2018 Gray",
    category: "Van",
    location: "Tamale",
    region: "Northern",
    price: "GH₵95,000",
    originalPrice: "GH₵110,000",
    period: "for 2 days",
    rating: 4.88,
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&q=80",
    ownerName: "Alhaji Mohammed",
    ownerAvatar: "https://ui-avatars.com/api/?name=Alhaji+Mohammed&background=2C3E5B&color=fff",
    isVerified: true,
    condition: "Foreign Used",
    transmission: "Manual",
    yearsOnPlatform: "7+ years on Africana",
  },
  {
    id: "12",
    title: "Mercedes C300 2019 Black",
    category: "Sedan",
    location: "Accra",
    region: "Greater Accra",
    price: "GH₵350,000",
    originalPrice: "GH₵420,000",
    period: "for 3 days",
    rating: 4.96,
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
    ownerName: "Efua Mensah",
    ownerAvatar: "https://ui-avatars.com/api/?name=Efua+Mensah&background=2C3E5B&color=fff",
    isVerified: true,
    condition: "Foreign Used",
    transmission: "Automatic",
    yearsOnPlatform: "8+ years on Africana",
  },
  {
    id: "13",
    title: "Kawasaki Ninja 2021 Red",
    category: "Motorcycle",
    location: "Kumasi",
    region: "Ashanti",
    price: "GH₵45,000",
    originalPrice: "GH₵55,000",
    period: "for 1 day",
    rating: 4.70,
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&q=80",
    ownerName: "Kwaku Darko",
    ownerAvatar: "https://ui-avatars.com/api/?name=Kwaku+Darko&background=2C3E5B&color=fff",
    isVerified: false,
    condition: "Local Used",
    transmission: "Manual",
    yearsOnPlatform: "2+ years on Africana",
  },
  {
    id: "14",
    title: "Find your perfect ride",
    message: "Explore vehicles near you",
    images: [
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&q=80",
      "https://images.unsplash.com/photo-1532581140115-ca39d166e46a?w=400&q=80",
      "https://images.unsplash.com/photo-1503376763036-066120622c74?w=400&q=80",
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&q=80",
    ],
  },
];

const POPULAR = [
  {
    id: "1",
    title: "Kumasi Zoological Garden",
    subtitle: "12 vehicles nearby",
    image: "https://images.unsplash.com/photo-1504173010664-32509aeebb62?w=800&q=80",
  },
  {
    id: "2",
    title: "Lake Bosumtwi",
    subtitle: "8 vehicles nearby",
    image: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&q=80",
  },
  {
    id: "3",
    title: "Manhyia Palace",
    subtitle: "15 vehicles nearby",
    image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e27?w=800&q=80",
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
    hourlyRate: "GH₵35",
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
    hourlyRate: "GH₵45",
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
    hourlyRate: "GH₵30",
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
    hourlyRate: "GH₵40",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
    isVerified: true,
    yearsOnPlatform: "5+ years",
    vehicleType: "Sedan, Truck",
  },
];

const TOP_RATED_VEHICLES = VEHICLES.filter((v) => (v.rating ?? 0) >= 4.9 && v.id !== "14");

const VERIFIED_VEHICLES = VEHICLES.filter((v) => v.isVerified && v.id !== "14");

const TOP_OWNERS_NEARBY = VEHICLES.filter((v) => v.isVerified && v.id !== "14").slice(0, 4);

type HomeScreenContentProps = {
  onLoginPress?: () => void;
};

export function HomeScreenContent({ onLoginPress }: HomeScreenContentProps = {}) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResult, setSelectedResult] = useState<any | null>(null);
  const [focused, setFocused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [placesResults, setPlacesResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeChips, setActiveChips] = useState<string[]>([]);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
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
    router.push(`/home/${id}` as any);
  };

  const handleFavoritePress = (id: string) => {
    if (!signedIn) {
      onLoginPress?.();
      return;
    }
    const anim = getHeartAnim(id);
    anim.setValue(1);
    Animated.sequence([
      Animated.spring(anim, { toValue: 1.4, useNativeDriver: true, tension: 200, friction: 3 }),
      Animated.spring(anim, { toValue: 1, useNativeDriver: true, tension: 200, friction: 5 }),
    ]).start();
    toggleFavorite(id);
  };

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  const removeChip = (chip: string) => {
    setActiveChips((prev) => prev.filter((c) => c !== chip));
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
          subtitle: user.role === "owner" || user.role === "corporate" ? "Owner" : user.role,
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
              placeholder="Search places or people in Ghana"
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
                        <Ionicons
                          name={item.type === "place" ? "location-outline" : "person-outline"}
                          size={ICON_SIZE_BASE}
                          color={NAVY}
                        />
                      </View>
                      <View style={styles.searchResultInfo}>
                        <Text style={styles.searchResultTitle}>{item.title}</Text>
                        {item.subtitle ? (
                          <Text style={styles.searchResultSubtitle}>{item.subtitle}</Text>
                        ) : null}
                      </View>
                      <Text style={styles.searchResultType}>
                        {item.type === "place" ? "Place" : "Person"}
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

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((filter) => (
            <Pressable
              key={filter}
              style={[
                styles.filterChip,
                activeFilter === filter && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter && styles.filterTextActive,
                ]}
              >
                {filter}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Active chips + count + sort + view toggle */}
        <View style={styles.exploreControls}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {activeChips.map((chip) => (
              <Pressable key={chip} style={styles.activeChip} onPress={() => removeChip(chip)}>
                <Text style={styles.activeChipText}>
                  <Text style={styles.activeChipCheck}>✓ </Text>
                  {chip}
                </Text>
                <Ionicons name="close" size={14} color={NAVY} />
              </Pressable>
            ))}
          </ScrollView>
          <View style={styles.controlsRight}>
            <Text style={styles.adsCount}>Found 46 ads</Text>
            <Pressable style={styles.sortButton} onPress={() => setShowSortDropdown(!showSortDropdown)}>
              <Text style={styles.sortButtonText}>Sort</Text>
              <Ionicons name={showSortDropdown ? "chevron-up" : "chevron-down"} size={14} color={NAVY} />
            </Pressable>
            <Pressable
              style={styles.viewToggle}
              onPress={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            >
              <Ionicons name={viewMode === "grid" ? "grid-outline" : "list-outline"} size={18} color={NAVY} />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Scrollable content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#F97316" colors={["#F97316"]} />
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

            <View style={styles.grid}>
              {VEHICLES.filter((v) => {
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
                    onFavoritePress={() => handleFavoritePress(vehicle.id)}
                  />
                );
              })}
            </View>
          </>
        ) : (
          <>
            {/* Continue searching card */}
            <Card style={styles.continueCard}>
              <View style={styles.continueContent}>
                <View style={styles.continueTextWrap}>
                  <Text style={styles.continueTitle}>
                    Continue searching for vehicles in Kumasi
                  </Text>
                  <Text style={styles.continueDate}>Jul 31 – Aug 2 ›</Text>
                </View>
                <View style={styles.continueImageWrap}>
                  <Image
                    source={{ uri: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80" }}
                    style={styles.continueImage}
                    contentFit="cover"
                    onError={() => handleImageError("continue")}
                  />
                  {imageErrors["continue"] && (
                    <View style={styles.imageFallback}>
                      <Ionicons name="image-outline" size={24} color="#9CA3AF" />
                    </View>
                  )}
                </View>
              </View>
            </Card>

            {/* Verified Vehicles */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Verified Vehicles</Text>
              <Pressable>
                <Ionicons name="arrow-forward" size={18} color={NAVY} />
              </Pressable>
            </View>
            <View style={styles.grid}>
              {VERIFIED_VEHICLES.slice(0, 4).map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle as any}
                  isFavorite={!!favorites[vehicle.id]}
                  onPress={() => handleVehiclePress(vehicle.id)}
                  onFavoritePress={() => handleFavoritePress(vehicle.id)}
                />
              ))}
            </View>

            {/* Top Rated Drivers */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Rated Drivers</Text>
              <Pressable>
                <Ionicons name="arrow-forward" size={18} color={NAVY} />
              </Pressable>
            </View>
            <View style={styles.grid}>
              {DRIVERS.map((driver) => (
                <Pressable key={driver.id} style={styles.card} onPress={() => {}}>
                  <View style={styles.imageWrap}>
                    <Image source={{ uri: driver.image }} style={styles.cardImage} contentFit="cover" />
                    {driver.isVerified && (
                      <View style={styles.verifiedBadgeTop}>
                        <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                      </View>
                    )}
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {driver.name}
                    </Text>
                    <Text style={styles.cardSubtitle}>{driver.location}</Text>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={12} color="#FFB800" />
                      <Text style={styles.ratingText}>{driver.rating}</Text>
                      <Text style={styles.tripsText}>({driver.trips} trips)</Text>
                    </View>
                    <Text style={styles.rateText}>{driver.hourlyRate}/hr</Text>
                    <View style={styles.metaRow}>
                      <Text style={styles.yearsText}>{driver.yearsOnPlatform}</Text>
                      <Text style={styles.vehicleTypeText}>{driver.vehicleType}</Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>

            {/* Top Rated Vehicles */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Rated Vehicles</Text>
              <Pressable>
                <Ionicons name="arrow-forward" size={18} color={NAVY} />
              </Pressable>
            </View>
            <View style={styles.grid}>
              {TOP_RATED_VEHICLES.slice(0, 4).map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle as any}
                  isFavorite={!!favorites[vehicle.id]}
                  onPress={() => handleVehiclePress(vehicle.id)}
                  onFavoritePress={() => handleFavoritePress(vehicle.id)}
                />
              ))}
            </View>

            {/* Top Vehicle Owners Near You */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Vehicle Owners Near You</Text>
              <Pressable>
                <Ionicons name="arrow-forward" size={18} color={NAVY} />
              </Pressable>
            </View>
            <View style={styles.grid}>
              {TOP_OWNERS_NEARBY.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle as any}
                  isFavorite={!!favorites[vehicle.id]}
                  onPress={() => handleVehiclePress(vehicle.id)}
                  onFavoritePress={() => handleFavoritePress(vehicle.id)}
                />
              ))}
            </View>

            {/* Stay near section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Stay near Kumasi Zoological Garden</Text>
              <Pressable>
                <Ionicons name="arrow-forward" size={18} color={NAVY} />
              </Pressable>
            </View>

            <View style={styles.grid}>
              {POPULAR.map((item) => (
                <Pressable key={item.id} style={styles.card}>
                  <View style={styles.imageWrap}>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.cardImage}
                      contentFit="cover"
                      onError={() => handleImageError(item.id)}
                    />
                    {imageErrors[item.id] && (
                      <View style={styles.imageFallback}>
                        <Ionicons name="image-outline" size={24} color="#9CA3AF" />
                      </View>
                    )}
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
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
    borderRadius: 32,
    paddingHorizontal: 16,
    height: 52,
    gap: 12,
    borderWidth: 1,
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
    color: NAVY,
  },
  searchResultsSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },

  /* Filters */
  filterRow: {
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterChipActive: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  filterTextActive: {
    color: "#FFFFFF",
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
    color: "#6B7280",
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
    color: NAVY,
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
    color: NAVY,
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
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
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
    color: NAVY,
  },
  continueDate: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
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
    color: NAVY,
    flex: 1,
  },

  /* Grid */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  card: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
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
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
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
    color: NAVY,
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
    shadowColor: "#000",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
});

export default HomeScreenContent;
