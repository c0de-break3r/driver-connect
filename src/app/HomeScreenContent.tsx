import { useState, useRef } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable, TextInput, Animated, RefreshControl } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthProvider";

const NAVY = "#2C3E5B";
const ICON_SIZE_BASE = 20;
const ICON_SIZE_ACTIVE = 24;

const FILTERS = ["All", "Vehicles", "Drivers", "Chauffeur"];

const VEHICLES = [
  {
    id: "1",
    title: "SUV in Kumasi",
    location: "Kumasi, Ghana",
    price: "GH₵1,466",
    period: "for 2 nights",
    rating: 4.98,
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
  },
  {
    id: "2",
    title: "Van in Accra",
    location: "Accra, Ghana",
    price: "GH₵911",
    period: "for 2 nights",
    rating: 4.88,
    image: "https://images.unsplash.com/photo-1551522435-a13afa82f300?w=800&q=80",
  },
  {
    id: "3",
    title: "Luxury Sedan",
    location: "Kumasi, Ghana",
    price: "GH₵720",
    period: "for 2 nights",
    rating: 4.95,
    image: "https://images.unsplash.com/photo-1563720223185-1103d5164cdb?w=800&q=80",
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

type HomeScreenContentProps = {
  onLoginPress?: () => void;
};

export function HomeScreenContent({ onLoginPress }: HomeScreenContentProps = {}) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const { signedIn } = useAuth();
  const iconAnim = useRef(new Animated.Value(ICON_SIZE_BASE)).current;

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

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

  const handleVehiclePress = (id: string) => {
    router.push(`/home/${id}` as any);
  };

  const handleFavoritePress = (id: string) => {
    if (!signedIn) {
      onLoginPress?.();
      return;
    }
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const iconScale = iconAnim.interpolate({
    inputRange: [ICON_SIZE_BASE, ICON_SIZE_ACTIVE],
    outputRange: [1, 1.25],
  });

  return (
    <View style={styles.container}>
      {/* Fixed header */}
      <View style={styles.header}>
        {/* Search bar */}
        <View style={styles.searchBar}>
          <Animated.View style={{ transform: [{ scale: iconScale }] }}>
            <Ionicons name="search-outline" size={ICON_SIZE_BASE} color={NAVY} />
          </Animated.View>
          <TextInput
            style={styles.searchInput}
            placeholder="Start your search"
            placeholderTextColor={NAVY}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
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
      </View>

      {/* Scrollable content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#F97316" colors={["#F97316"]} />
        }
      >
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
              />
            </View>
          </View>
        </Card>

        {/* Based on your search */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Based on your Kumasi search</Text>
          <Pressable>
            <Ionicons name="arrow-forward" size={18} color={NAVY} />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {VEHICLES.map((vehicle) => (
            <Pressable
              key={vehicle.id}
              style={styles.vehicleCard}
              onPress={() => handleVehiclePress(vehicle.id)}
            >
              <Image
                source={{ uri: vehicle.image }}
                style={styles.vehicleImage}
                contentFit="cover"
              />
              <Pressable
                style={styles.favoriteBadge}
                onPress={() => handleFavoritePress(vehicle.id)}
              >
                <Ionicons
                  name={favorites[vehicle.id] ? "heart" : "heart-outline"}
                  size={14}
                  color={favorites[vehicle.id] ? "#E74C3C" : "#FFFFFF"}
                />
              </Pressable>
              <Text style={styles.vehicleTitle}>{vehicle.title}</Text>
              <Text style={styles.vehicleLocation}>{vehicle.location}</Text>
              <View style={styles.vehicleFooter}>
                <Text style={styles.vehiclePrice}>
                  {vehicle.price}{" "}
                  <Text style={styles.vehiclePeriod}>{vehicle.period}</Text>
                </Text>
                <View style={styles.ratingWrap}>
                  <Ionicons name="star" size={12} color="#FFB800" />
                  <Text style={styles.ratingText}>{vehicle.rating}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* Stay near section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Stay near Kumasi Zoological Garden</Text>
          <Pressable>
            <Ionicons name="arrow-forward" size={18} color={NAVY} />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {POPULAR.map((item) => (
            <Pressable key={item.id} style={styles.popularCard}>
              <Image
                source={{ uri: item.image }}
                style={styles.popularImage}
                contentFit="cover"
              />
              <Text style={styles.popularTitle}>{item.title}</Text>
              <Text style={styles.popularSubtitle}>{item.subtitle}</Text>
            </Pressable>
          ))}
        </ScrollView>
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
    <View style={[styles.card, style]}>
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

  /* Horizontal lists */
  horizontalList: {
    gap: 14,
    paddingHorizontal: 20,
  },

  /* Vehicle cards */
  vehicleCard: {
    width: 200,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
    gap: 8,
    paddingBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  vehicleImage: {
    width: "100%",
    height: 120,
  },
  favoriteBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  vehicleTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: NAVY,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  vehicleLocation: {
    fontSize: 12,
    color: "#6B7280",
    paddingHorizontal: 12,
  },
  vehicleFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    marginTop: 4,
  },
  vehiclePrice: {
    fontSize: 14,
    fontWeight: "700",
    color: NAVY,
  },
  vehiclePeriod: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  ratingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "700",
    color: NAVY,
  },

  /* Popular cards */
  popularCard: {
    width: 160,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
    gap: 8,
    paddingBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  popularImage: {
    width: "100%",
    height: 100,
  },
  popularTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: NAVY,
    paddingHorizontal: 12,
  },
  popularSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    paddingHorizontal: 12,
  },

  /* Generic card */
  card: {
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
