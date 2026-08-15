import { useState } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import { useHomeStore } from "@/store/useHomeStore";
import { Image } from "expo-image";

const NAVY = "#2C3E5B";
const GREEN = "#10B981";

export default function SaveToFavoritesScreen() {
  const params = useLocalSearchParams();
  const vehicleParam = params.vehicle as string | undefined;

  const pendingVehicle = useFavoritesStore((state) => state.pendingVehicle);
  const setPendingVehicle = useFavoritesStore((state) => state.setPendingVehicle);
  const collections = useFavoritesStore((state) => state.collections);
  const addVehicleToCollection = useFavoritesStore((state) => state.addVehicleToCollection);
  const clearPendingVehicle = useFavoritesStore((state) => state.clearPendingVehicle);
  const setActiveTab = useHomeStore((state) => state.setActiveTab);

  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

  const vehicle = pendingVehicle || (vehicleParam ? JSON.parse(vehicleParam) : null);

  const handleCreateNewList = () => {
    if (!vehicle) return;
    setPendingVehicle(vehicle);
    router.push(`/favorites/name-list?vehicle=${encodeURIComponent(JSON.stringify(vehicle))}`);
  };

  const handleSelectCollection = (collectionId: string) => {
    setSelectedCollectionId(collectionId);
  };

  const handleSave = () => {
    if (!vehicle || !selectedCollectionId) return;
    addVehicleToCollection(selectedCollectionId, vehicle.id);
    clearPendingVehicle();
    setActiveTab("favorites");
    router.replace(`/favorites/collection/${selectedCollectionId}`);
  };

  const handleClose = () => {
    clearPendingVehicle();
    router.back();
  };

  if (!vehicle) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="arrow-back" size={22} color={NAVY} />
          </Pressable>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No vehicle selected</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="arrow-back" size={22} color={NAVY} />
        </Pressable>
        <Text style={styles.headerTitle}>Save to favorites</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Compact Vehicle Preview */}
        {vehicle && (
          <View style={styles.vehicleRow}>
            <View style={styles.vehicleThumbWrap}>
              <Image source={{ uri: vehicle.image }} style={styles.vehicleThumb} contentFit="cover" />
            </View>
            <View style={styles.vehicleMeta}>
              <Text style={styles.vehicleTitle} numberOfLines={1}>
                {vehicle.title}
              </Text>
              <Text style={styles.vehiclePrice}>{vehicle.price}</Text>
            </View>
          </View>
        )}

        {/* Create New List */}
        <Pressable style={styles.createListButton} onPress={handleCreateNewList}>
          <View style={styles.createListIcon}>
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.createListContent}>
            <Text style={styles.createListText}>Create new list</Text>
            <Text style={styles.createListHint}>Organize your saved vehicles and drivers</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </Pressable>

        {/* Existing Collections */}
        {collections.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your lists</Text>
            <View style={styles.collectionsList}>
              {collections.map((collection) => (
                <Pressable
                  key={collection.id}
                  style={[styles.collectionCard, selectedCollectionId === collection.id && styles.collectionCardSelected]}
                  onPress={() => handleSelectCollection(collection.id)}
                >
                  <View style={styles.collectionHeader}>
                    <View style={styles.collectionIcon}>
                      <Ionicons name="bookmark" size={18} color={NAVY} />
                    </View>
                    <View style={styles.collectionBody}>
                      <Text style={styles.collectionName} numberOfLines={1}>
                        {collection.name}
                      </Text>
                      <Text style={styles.collectionCount}>
                        {collection.vehicleIds.length} {collection.vehicleIds.length === 1 ? "vehicle" : "vehicles"}
                      </Text>
                    </View>
                    <View style={[styles.checkbox, selectedCollectionId === collection.id && styles.checkboxSelected]}>
                      {selectedCollectionId === collection.id && (
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      )}
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.bottomBar}>
        <Pressable
          style={[styles.saveButton, !selectedCollectionId && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!selectedCollectionId}
        >
          <Text style={[styles.saveButtonText, !selectedCollectionId && styles.saveButtonTextDisabled]}>
            {selectedCollectionId ? "Save to list" : "Select a list"}
          </Text>
        </Pressable>
      </View>
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
  closeButton: {
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
    letterSpacing: -0.3,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
  },
  vehicleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    marginBottom: 20,
  },
  vehicleThumbWrap: {
    width: 96,
    height: 96,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  vehicleThumb: {
    width: "100%",
    height: "100%",
  },
  vehicleMeta: {
    flex: 1,
    gap: 4,
  },
  vehicleTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
  },
  vehiclePrice: {
    fontSize: 14,
    fontWeight: "700",
    color: GREEN,
  },
  createListButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 20,
  },
  createListIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: NAVY,
    alignItems: "center",
    justifyContent: "center",
  },
  createListContent: {
    flex: 1,
    gap: 2,
  },
  createListText: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
  },
  createListHint: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  collectionsList: {
    gap: 10,
  },
  collectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 0,
  },
  collectionCardSelected: {
    borderColor: GREEN,
    backgroundColor: "#F0FDF4",
  },
  collectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  collectionIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginLeft: "auto",
  },
  checkboxSelected: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  collectionBody: {
    flex: 1,
    gap: 2,
    marginLeft: 12,
  },
  collectionName: {
    fontSize: 14,
    fontWeight: "700",
    color: NAVY,
  },
  collectionCount: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  saveButton: {
    backgroundColor: NAVY,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#F3F4F6",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  saveButtonTextDisabled: {
    color: "#9CA3AF",
  },
  bottomSpacer: {
    height: 40,
  },
});
