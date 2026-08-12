import { useState, useRef, useEffect } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable, TextInput, Animated, RefreshControl, FlatList, Easing } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthProvider";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import { useQuery } from "convex/react";
import { api } from "@/lib/convexApi";
import { VehicleCard } from "@/components/VehicleCard";

const NAVY = "#2C3E5B";
const GREEN = "#10B981";
const ICON_SIZE_BASE = 20;
const ICON_SIZE_ACTIVE = 24;




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

    sectionAnims.forEach((anim) => anim.setValue(0));

    Animated.stagger(20, sectionAnims.map((anim) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 200,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      })
    )).start();
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
          <Text style={styles.adsCount}>Found 46 ads</Text>
          <View style={styles.controlsRight}>
            <Pressable style={styles.sortButton} onPress={() => setShowSortDropdown(!showSortDropdown)}>
              <Text style={styles.sortButtonText}>Sort</Text>
              <Ionicons name={showSortDropdown ? "chevron-up" : "chevron-down"} size={14} color={NAVY} />
            </Pressable>
            <Pressable
              style={styles.viewToggle}
              onPress={handleViewModeToggle}
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
              {vehicles.filter((v) => {
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
                  list={viewMode === "list"}
                  style={viewMode === "list" ? styles.listCard : undefined}
                />
                );
              })}
            </Animated.View>
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
              {verifiedVehicles.slice(0, 4).map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle as any}
                  isFavorite={!!favorites[vehicle.id]}
                  onPress={() => handleVehiclePress(vehicle.id)}
                  onFavoritePress={() => handleFavoritePress(vehicle.id)}
                  list={viewMode === "list"}
                  style={viewMode === "list" ? styles.listCard : undefined}
                />
              ))}
            </Animated.View>

            {/* Top Rated Drivers */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Rated Drivers</Text>
              <Pressable>
                <Ionicons name="arrow-forward" size={18} color={NAVY} />
              </Pressable>
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
              {DRIVERS.map((driver) => (
                <Pressable key={driver.id} style={[styles.card, viewMode === "list" ? styles.listCard : undefined]} onPress={() => {}}>
                  <View style={[styles.imageWrap, viewMode === "list" && styles.listImageWrap]}>
                    <Image source={{ uri: driver.image }} style={styles.cardImage} contentFit="cover" />
                    {driver.isVerified && (
                      <View style={styles.verifiedBadgeTop}>
                        <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                      </View>
                    )}
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
                    <Text style={styles.rateText}>{driver.hourlyRate}/hr</Text>
                    <View style={styles.metaRow}>
                      <Text style={styles.yearsText}>{driver.yearsOnPlatform}</Text>
                      <Text style={styles.vehicleTypeText}>{driver.vehicleType}</Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </Animated.View>

            {/* Top Rated Vehicles */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Rated Vehicles</Text>
              <Pressable>
                <Ionicons name="arrow-forward" size={18} color={NAVY} />
              </Pressable>
            </View>
            <Animated.View
              style={[
                viewMode === "list" ? styles.list : styles.grid,
                {
                  opacity: sectionAnims[3],
                  transform: [
                    {
                      scale: sectionAnims[3].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.96, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              {topRatedVehicles.slice(0, 4).map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle as any}
                  isFavorite={!!favorites[vehicle.id]}
                  onPress={() => handleVehiclePress(vehicle.id)}
                  onFavoritePress={() => handleFavoritePress(vehicle.id)}
                  list={viewMode === "list"}
                  style={viewMode === "list" ? styles.listCard : undefined}
                />
              ))}
            </Animated.View>

            {/* Top Vehicle Owners Near You */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Vehicle Owners Near You</Text>
              <Pressable>
                <Ionicons name="arrow-forward" size={18} color={NAVY} />
              </Pressable>
            </View>
            <Animated.View
              style={[
                viewMode === "list" ? styles.list : styles.grid,
                {
                  opacity: sectionAnims[4],
                  transform: [
                    {
                      scale: sectionAnims[4].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.96, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              {topOwnersNearby.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle as any}
                  isFavorite={!!favorites[vehicle.id]}
                  onPress={() => handleVehiclePress(vehicle.id)}
                  onFavoritePress={() => handleFavoritePress(vehicle.id)}
                  list={viewMode === "list"}
                  style={viewMode === "list" ? styles.listCard : undefined}
                />
              ))}
            </Animated.View>

            {/* Stay near section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Stay near Kumasi Zoological Garden</Text>
              <Pressable>
                <Ionicons name="arrow-forward" size={18} color={NAVY} />
              </Pressable>
            </View>

            <Animated.View
              style={[
                viewMode === "list" ? styles.list : styles.grid,
                {
                  opacity: sectionAnims[5],
                  transform: [
                    {
                      scale: sectionAnims[5].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.96, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              {POPULAR.map((item) => (
                <Pressable key={item.id} style={[styles.card, viewMode === "list" ? styles.listCard : undefined]}>
                  <View style={[styles.imageWrap, viewMode === "list" && styles.listImageWrap]}>
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
                  <View style={[styles.cardBody, viewMode === "list" && styles.listCardBody]}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                  </View>
                </Pressable>
              ))}
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
    color: NAVY,
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
    color: GREEN,
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
    shadowColor: NAVY,
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
});

export default HomeScreenContent;
