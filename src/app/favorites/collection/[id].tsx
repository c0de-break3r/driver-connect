import { useMemo } from "react";
import {
  Platform,
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
import { VEHICLES } from "@/app/HomeScreenContent";
import EmptyState from "@/components/EmptyState";

const NAVY = "#2C3E5B";

export default function CollectionDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const collectionId = params.id;
  const collections = useFavoritesStore((state) => state.collections);
  const deleteCollection = useFavoritesStore((state) => state.deleteCollection);

  const collection = collections.find((c) => c.id === collectionId);

  const vehicles = useMemo<VehicleFavorite[]>(() => {
    if (!collection) return [];
    return collection.vehicleIds
      .map((id) => VEHICLES.find((v) => v.id === id))
      .filter((v): v is VehicleFavorite => !!v && typeof v.image === "string" && typeof v.category === "string");
  }, [collection]);

  const handleDelete = () => {
    if (!collectionId) return;
    deleteCollection(collectionId);
    router.back();
  };

  if (!collection) {
    return (
      <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color={NAVY} />
        </Pressable>
        <Text style={styles.headerTitle}>Collection</Text>
        <View style={styles.headerRight} />
      </View>
      <EmptyState title="Collection not found" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color={NAVY} />
        </Pressable>
        <Text style={styles.headerTitle}>{collection.name}</Text>
        <Pressable onPress={handleDelete} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={20} color="#E74C3C" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {vehicles.length === 0 ? (
          <EmptyState
            title="This collection is empty"
            subtitle="Drag and drop favorites here from the Favorites tab."
          />
        ) : (
          <View style={styles.grid}>
            {vehicles.map((vehicle) => (
              <View key={vehicle.id} style={styles.vehicleCard}>
                <Image source={{ uri: vehicle.image }} style={styles.vehicleImage} contentFit="cover" />
                <View style={styles.vehicleBody}>
                  <Text style={styles.vehicleTitle} numberOfLines={1}>
                    {vehicle.title}
                  </Text>
                  <Text style={styles.vehicleCategory}>{vehicle.category}</Text>
                </View>
              </View>
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
    paddingHorizontal: 16,
    paddingTop: Platform.select({ ios: 60, android: 40 }),
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: NAVY,
    flex: 1,
    textAlign: "center",
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  headerRight: {
    width: 32,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  vehicleCard: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  vehicleImage: {
    width: "100%",
    height: 100,
  },
  vehicleBody: {
    padding: 10,
    gap: 2,
  },
  vehicleTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: NAVY,
  },
  vehicleCategory: {
    fontSize: 11,
    fontWeight: "500",
    color: "#6B7280",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: NAVY,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 32,
  },
});
