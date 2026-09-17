import { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import { useHomeStore } from "@/store/useHomeStore";
import { Share } from "react-native";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useToast";

const NAVY = "#2C3E5B";
const GREEN = "#10B981";

export const options = { animation: "slide_from_left" };

export default function CollectionDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const collectionId = params.id;
  const collections = useFavoritesStore((state) => state.collections);
  const renameCollection = useFavoritesStore((state) => state.renameCollection);
  const deleteCollection = useFavoritesStore((state) => state.deleteCollection);
  const setActiveTab = useHomeStore((state) => state.setActiveTab);

  const collection = collections.find((c) => c.id === collectionId);

  const vehicles = useMemo(() => {
    if (!collection) return [];
    return collection.items.map((item) => ({
      id: item.id,
      title: item.title,
      category: "Vehicle",
      location: item.location,
      region: "",
      price: item.price,
      originalPrice: "",
      period: "per day",
      rating: item.rating,
      image: item.image || "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
      ownerName: "",
      ownerAvatar: "",
      isVerified: true,
      condition: "Listed",
      transmission: "Automatic",
      yearsOnPlatform: "New",
    }));
  }, [collection]);

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [renameVisible, setRenameVisible] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [deleteItemVisible, setDeleteItemVisible] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const handleShare = async () => {
    if (!collection) return;
    try {
      await Share.share({
        message: `Check out my "${collection.name}" collection on Africana Driver Connect.`,
      });
    } catch {
      // share cancelled
    }
  };

  const openRename = () => {
    if (!collection) return;
    setRenameValue(collection.name);
    setSettingsVisible(false);
    setRenameVisible(true);
  };

  const confirmRename = () => {
    if (!collection || !renameValue.trim()) return;
    renameCollection(collection.id, renameValue.trim());
    setRenameVisible(false);
    showToast("Collection renamed", "success");
  };

  const confirmDeleteCollection = () => {
    if (!collection) return;
    deleteCollection(collection.id);
    setSettingsVisible(false);
    setActiveTab("favorites");
    router.replace("/home");
  };

  const confirmDeleteItem = (itemId: string) => {
    if (!collection) return;
    const removeVehicleFromCollection = useFavoritesStore.getState().removeVehicleFromCollection;
    removeVehicleFromCollection(collection.id, itemId);
    setDeleteItemVisible(false);
    showToast("Item removed from collection", "error");
  };

  const handleAddTripDates = (vehicleId: string) => {
    if (!collectionId) return;
    router.push(`/favorites/trip-dates?collectionId=${collectionId}&vehicleId=${encodeURIComponent(vehicleId)}`);
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
          <Pressable style={styles.iconButton} onPress={() => setSettingsVisible(true)}>
            <Ionicons name="settings-outline" size={20} color={NAVY} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
                onPress={() => router.push({ pathname: '/vehicle-details', params: { id: vehicle.id, vehicle: JSON.stringify(vehicle) } })}
              >
                <Image source={{ uri: vehicle.image }} style={styles.vehicleImage} contentFit="cover" />
                <View style={styles.cardActions}>
                  <Pressable style={styles.viewDetailsButton} onPress={() => router.push({ pathname: '/vehicle-details', params: { id: vehicle.id, vehicle: JSON.stringify(vehicle) } })}>
                    <Text style={styles.viewDetailsText}>View details</Text>
                  </Pressable>
                  <Pressable style={styles.addTripsButton} onPress={() => handleAddTripDates(vehicle.id)}>
                    <Ionicons name="calendar-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.addTripsText}>Add trips</Text>
                  </Pressable>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />

      <Modal visible={settingsVisible} animationType="none" transparent onRequestClose={() => setSettingsVisible(false)}>
        <Pressable style={styles.sheetOverlay} onPress={() => setSettingsVisible(false)}>
          <View style={styles.sheetContent}>
            <Pressable style={styles.sheetItem} onPress={openRename}>
              <Ionicons name="pencil-outline" size={20} color={NAVY} />
              <Text style={styles.sheetItemText}>Rename</Text>
            </Pressable>
            <View style={styles.sheetDivider} />
            <Pressable style={styles.sheetItem} onPress={() => { setSettingsVisible(false); setDeleteItemVisible(true); }}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
              <Text style={[styles.sheetItemText, styles.sheetItemDanger]}>Delete</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={deleteItemVisible} animationType="none" transparent onRequestClose={() => setDeleteItemVisible(false)}>
        <Pressable style={styles.sheetOverlay} onPress={() => setDeleteItemVisible(false)}>
          <View style={styles.sheetContent}>
            <Text style={styles.sheetTitle}>Delete item</Text>
            <View style={styles.sheetDivider} />
            {vehicles.map((vehicle) => (
              <Pressable
                key={vehicle.id}
                style={styles.sheetItem}
                onPress={() => confirmDeleteItem(vehicle.id)}
              >
                <Image source={{ uri: vehicle.image }} style={styles.sheetItemImage} contentFit="cover" />
                <View style={styles.sheetItemBody}>
                  <Text style={styles.sheetItemText} numberOfLines={1}>{vehicle.title}</Text>
                  <Text style={styles.sheetItemSub} numberOfLines={1}>{vehicle.location}</Text>
                </View>
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      <Modal visible={renameVisible} animationType="none" transparent onRequestClose={() => setRenameVisible(false)}>
        <Pressable style={styles.sheetOverlay} onPress={() => setRenameVisible(false)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ width: "100%" }}
          >
            <View style={styles.renameContent}>
              <Text style={styles.renameTitle}>Rename collection</Text>
              <TextInput
                style={styles.renameInput}
                value={renameValue}
                onChangeText={setRenameValue}
                autoFocus
              />
              <View style={styles.renameActions}>
                <Pressable style={styles.renameCancel} onPress={() => setRenameVisible(false)}>
                  <Text style={styles.renameCancelText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.renameSave} onPress={confirmRename}>
                  <Text style={styles.renameSaveText}>Save</Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    position: "relative",
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
    height: 160,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  viewDetailsButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
  viewDetailsText: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
  },
  addTripsButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    backgroundColor: NAVY,
  },
  addTripsText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheetContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  sheetItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  sheetItemText: {
    fontSize: 16,
    fontWeight: "700",
    color: NAVY,
  },
  sheetItemDanger: {
    color: "#EF4444",
  },
  sheetItemImage: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  sheetItemBody: {
    flex: 1,
  },
  sheetItemSub: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: NAVY,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  sheetDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 24,
  },
  renameContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  renameTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: NAVY,
    marginBottom: 12,
  },
  renameInput: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: NAVY,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  renameActions: {
    flexDirection: "row",
    gap: 10,
  },
  renameCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  renameCancelText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6B7280",
  },
  renameSave: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: NAVY,
    alignItems: "center",
  },
  renameSaveText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  toast: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
});
