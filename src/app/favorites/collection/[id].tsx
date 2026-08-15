import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/lib/convexApi";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFavoritesStore, type VehicleFavorite } from "@/store/useFavoritesStore";

const NAVY = "#2C3E5B";
const GREEN = "#10B981";

export default function CollectionDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const collectionId = params.id;
  const collections = useFavoritesStore((state) => state.collections);

  const collection = collections.find((c) => c.id === collectionId);

  const allVehicles = useQuery(api.jobs.listVehicles, {});
  const vehicles = useMemo(() => {
    if (!collection || !allVehicles) return [];
    return collection.vehicleIds
      .map((id) => allVehicles.find((v: any) => v._id === id))
      .filter((v: any): v is VehicleFavorite => !!v && typeof v.images?.[0] === "string" && typeof v.category === "string")
      .map((v: any) => ({
        id: v._id,
        title: v.title,
        category: v.category,
        location: v.city,
        region: v.region,
        price: `GH₵ ${v.pricePerDay}`,
        originalPrice: v.pricePerWeek ? `GH₵ ${v.pricePerWeek}` : "",
        period: "per day",
        rating: v.rating,
        image: v.images?.[0] ?? "",
        ownerName: v.ownerId,
        ownerAvatar: "",
        isVerified: true,
        condition: "Listed",
        transmission: v.transmission ?? "Automatic",
        yearsOnPlatform: "New",
      }));
  }, [collection, allVehicles]);

  const handleShare = () => {
    if (!collection) return;
  };

  const handleSettings = () => {
    // settings action placeholder
  };

  const handleAddTripDates = () => {
    if (!collectionId) return;
    router.push(`/favorites/trip-dates?collectionId=${collectionId}`);
  };

  if (!collection) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Collection</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Collection not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={NAVY} />
        </Pressable>
        <Text style={styles.headerTitle}>{collection.name}</Text>
        <View style={styles.headerRight}>
          <Pressable style={styles.iconButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color={NAVY} />
          </Pressable>
          <Pressable style={styles.iconButton} onPress={handleSettings}>
            <Ionicons name="settings-outline" size={20} color={NAVY} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Add Trip Dates Button */}
        <Pressable style={styles.addTripDatesButton} onPress={handleAddTripDates}>
          <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
          <Text style={styles.addTripDatesText}>Add trip dates</Text>
        </Pressable>

        {vehicles.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>This collection is empty</Text>
            <Text style={styles.emptySubtitle}>Add vehicles to this list from the Favorites tab.</Text>
          </View>
        ) : (
          <View style={styles.vehiclesList}>
            {vehicles.map((vehicle) => (
              <Pressable
                key={vehicle.id}
                style={styles.vehicleCard}
                onPress={() => router.push(`/vehicle-details?id=${vehicle.id}`)}
              >
                <Image source={{ uri: vehicle.image }} style={styles.vehicleImage} contentFit="cover" />
                <View style={styles.vehicleOverlay}>
                  <Pressable style={styles.heartButton} pointerEvents="none">
                    <Ionicons name="heart" size={20} color="#EF4444" />
                  </Pressable>
                </View>
                <View style={styles.vehicleBody}>
                  <Text style={styles.vehicleTitle} numberOfLines={1}>
                    {vehicle.title}
                  </Text>
                  <View style={styles.vehicleMeta}>
                    <Text style={styles.vehicleYear}>2026</Text>
                    <View style={styles.vehicleRating}>
                      <Ionicons name="star" size={12} color={GREEN} />
                      <Text style={styles.vehicleRatingText}>5.0</Text>
                      <Text style={styles.vehicleRatingCount}>(2)</Text>
                    </View>
                  </View>
                  <View style={styles.vehicleLocation}>
                    <Ionicons name="location-outline" size={14} color="#6B7280" />
                    <Text style={styles.vehicleLocationText}>{vehicle.location}</Text>
                  </View>
                </View>
                <Pressable style={styles.viewDetailsButton}>
                  <Text style={styles.viewDetailsText}>View details</Text>
                </Pressable>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: NAVY,
    textAlign: "center",
    flex: 1,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: NAVY,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
  },
  addTripDatesButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: NAVY,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 24,
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  addTripDatesText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  vehiclesList: {
    gap: 16,
  },
  vehicleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  vehicleImage: {
    width: "100%",
    height: 220,
  },
  vehicleOverlay: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  heartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  vehicleBody: {
    padding: 16,
  },
  vehicleTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: NAVY,
    marginBottom: 8,
  },
  vehicleMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  vehicleYear: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  vehicleRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  vehicleRatingText: {
    fontSize: 14,
    fontWeight: "700",
    color: NAVY,
  },
  vehicleRatingCount: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  vehicleLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  vehicleLocationText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  viewDetailsButton: {
    marginTop: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  viewDetailsText: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
  },
});
