import { useState } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import { useHomeStore } from "@/store/useHomeStore";
import { Image } from "expo-image";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

const NAVY = "#2C3E5B";
const GREEN = "#10B981";

export const options = { animation: "slide_from_left" };

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

  const handleSelectCollection = (collectionId: string) => { setSelectedCollectionId(collectionId); };

  const handleSave = () => {
    if (!vehicle || !selectedCollectionId) return;
    addVehicleToCollection(selectedCollectionId, vehicle);
    clearPendingVehicle();
    setActiveTab("favorites");
    router.replace(`/favorites/collection/${selectedCollectionId}`);
  };

  const handleClose = () => { clearPendingVehicle(); router.back(); };

  if (!vehicle) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Button variant="ghost" size="icon" onPress={handleClose} className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200">
            <Ionicons name="arrow-back" size={22} color={NAVY} />
          </Button>
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
        <Button variant="ghost" size="icon" onPress={handleClose} className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200">
          <Ionicons name="arrow-back" size={22} color={NAVY} />
        </Button>
        <Text className="text-lg font-extrabold text-center flex-1" style={{ color: NAVY, letterSpacing: -0.3 }}>Save to favorites</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card className="bg-gray-50 border-gray-200 flex-row items-center gap-3.5 mb-5">
          <View style={styles.vehicleThumbWrap}>
            <Image source={{ uri: vehicle.image }} style={styles.vehicleThumb} contentFit="cover" />
          </View>
          <View className="flex-1 gap-1">
            <Text className="text-sm font-bold" style={{ color: NAVY }} numberOfLines={1}>{vehicle.title}</Text>
            <Text className="text-sm font-bold text-emerald-600">{vehicle.price}</Text>
          </View>
        </Card>

        <Pressable style={styles.createListButton} onPress={handleCreateNewList}>
          <View style={styles.createListIcon}>
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </View>
          <View className="flex-1 gap-1">
            <Text className="text-sm font-bold" style={{ color: NAVY }}>Create new list</Text>
            <Text className="text-xs font-medium text-gray-500">Organize your saved vehicles and drivers</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </Pressable>

        {collections.length > 0 && (
          <View style={styles.section}>
            <Text className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Your lists</Text>
            <View className="gap-2.5">
              {collections.map((collection) => (
                <Pressable
                  key={collection.id}
                  style={[styles.collectionCard, selectedCollectionId === collection.id && styles.collectionCardSelected]}
                  onPress={() => handleSelectCollection(collection.id)}
                >
                  <View className="flex-row items-center gap-3">
                    <View style={styles.collectionIcon}>
                      <Ionicons name="bookmark" size={18} color={NAVY} />
                    </View>
                    <View className="flex-1 gap-0.5">
                      <Text className="text-sm font-bold" style={{ color: NAVY }} numberOfLines={1}>{collection.name}</Text>
                      <Text className="text-xs font-medium text-gray-500">{collection.items.length} {collection.items.length === 1 ? "vehicle" : "vehicles"}</Text>
                    </View>
                    <Checkbox checked={selectedCollectionId === collection.id} />
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button onPress={handleSave} disabled={!selectedCollectionId} className={`rounded-xl py-4 ${!selectedCollectionId ? "bg-gray-200" : ""}`}>
          <Text className={`text-base font-bold ${selectedCollectionId ? "text-white" : "text-gray-400"}`}>
            {selectedCollectionId ? "Save to list" : "Select a list"}
          </Text>
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 48, paddingBottom: 16 },
  headerRight: { width: 40 },
  content: { flex: 1, paddingHorizontal: 20 },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 16, color: "#6B7280" },
  vehicleThumbWrap: { width: 96, height: 96, borderRadius: 14, overflow: "hidden", backgroundColor: "#E5E7EB", borderWidth: 1, borderColor: "#F3F4F6" },
  vehicleThumb: { width: "100%", height: "100%" },
  createListButton: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#F9FAFB", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 20 },
  createListIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: NAVY, alignItems: "center", justifyContent: "center" },
  section: { marginBottom: 20 },
  collectionCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#E5E7EB" },
  collectionCardSelected: { borderColor: GREEN, backgroundColor: "#F0FDF4" },
  collectionIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#FEF3C7", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#FDE68A" },
  bottomSpacer: { height: 40 },
  bottomBar: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: "#E5E7EB" },
});
