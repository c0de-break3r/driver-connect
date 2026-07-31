import { useState } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const NAVY = "#2C3E5B";

const FILTERS = ["All", "Vehicles", "Drivers", "Chauffeur"];

const VEHICLES = [
  {
    id: "1",
    title: "SUV in Kumasi",
    location: "Kumasi, Ghana",
    price: "GH₵1,466",
    period: "for 2 nights",
    rating: 4.98,
    favorite: true,
    color: "#E8F4FD",
  },
  {
    id: "2",
    title: "Van in Accra",
    location: "Accra, Ghana",
    price: "GH₵911",
    period: "for 2 nights",
    rating: 4.88,
    favorite: true,
    color: "#F3E8FD",
  },
  {
    id: "3",
    title: "Luxury Sedan",
    location: "Kumasi, Ghana",
    price: "GH₵720",
    period: "for 2 nights",
    rating: 4.95,
    favorite: false,
    color: "#E8FDF3",
  },
];

const POPULAR = [
  {
    id: "1",
    title: "Kumasi Zoological Garden",
    subtitle: "12 vehicles nearby",
    color: "#FDECEA",
  },
  {
    id: "2",
    title: "Lake Bosumtwi",
    subtitle: "8 vehicles nearby",
    color: "#FFF8DB",
  },
  {
    id: "3",
    title: "Manhyia Palace",
    subtitle: "15 vehicles nearby",
    color: "#ECEAFD",
  },
];

export function HomeScreenContent() {
  const [activeFilter, setActiveFilter] = useState("All");

  const handleVehiclePress = (id: string) => {
    router.push(`/home/${id}` as any);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Search bar */}
      <Pressable style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color="#9CA3AF" />
        <Text style={styles.searchPlaceholder}>Start your search</Text>
        <View style={styles.searchIconBadge}>
          <Ionicons name="options-outline" size={16} color={NAVY} />
        </View>
      </Pressable>

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

      {/* Continue searching card */}
      <Card style={styles.continueCard}>
        <View style={styles.continueContent}>
          <View>
            <Text style={styles.continueTitle}>
              Continue searching for vehicles in Kumasi
            </Text>
            <Text style={styles.continueDate}>Jul 31 – Aug 2 ›</Text>
          </View>
          <View style={styles.continueImageWrap}>
            <View style={styles.continueImagePlaceholder}>
              <Ionicons name="car-sport-outline" size={32} color={NAVY} />
            </View>
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
            <View style={[styles.vehicleImagePlaceholder, { backgroundColor: vehicle.color }]}>
              <Ionicons name="car-sport-outline" size={28} color={NAVY} />
            </View>
            <View style={styles.favoriteBadge}>
              <Ionicons
                name={vehicle.favorite ? "heart" : "heart-outline"}
                size={14}
                color={vehicle.favorite ? "#E74C3C" : "#FFFFFF"}
              />
            </View>
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
            <View style={[styles.popularImagePlaceholder, { backgroundColor: item.color }]}>
              <Ionicons name="location-outline" size={24} color={NAVY} />
            </View>
            <Text style={styles.popularTitle}>{item.title}</Text>
            <Text style={styles.popularSubtitle}>{item.subtitle}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </ScrollView>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 96,
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
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: "#9CA3AF",
  },
  searchIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Filters */
  filterRow: {
    gap: 10,
    paddingHorizontal: 4,
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
  },
  continueContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  continueTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
    flex: 1,
  },
  continueDate: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 6,
  },
  continueImageWrap: {
    width: 80,
    height: 80,
    borderRadius: 16,
    overflow: "hidden",
  },
  continueImagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F4FD",
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
    paddingRight: 20,
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
  },
  vehicleImagePlaceholder: {
    height: 120,
    alignItems: "center",
    justifyContent: "center",
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
  },
  popularImagePlaceholder: {
    height: 100,
    alignItems: "center",
    justifyContent: "center",
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
  },
});
