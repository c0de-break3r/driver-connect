import { useMemo, useRef, useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/lib/convexApi";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Animated,
  TextInput,
  Modal,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthProvider";
import { useUser } from "@clerk/expo";
import { router } from "expo-router";
import { useFavoritesStore } from "@/store/useFavoritesStore";

const NAVY = "#2C3E5B";
const GREEN = "#10B981";

export default function FavoritesScreen() {
  const { signedIn } = useAuth();
  const { user } = useUser();
  const favorites = useFavoritesStore((state) => state.favorites);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const loadForUser = useFavoritesStore((state) => state.loadForUser);
  const collections = useFavoritesStore((state) => state.collections);
  const createCollection = useFavoritesStore((state) => state.createCollection);
  const heartAnims = useRef<Map<string, Animated.Value>>(new Map()).current;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    loadForUser(user?.primaryEmailAddress?.emailAddress ?? "");
  }, [user?.primaryEmailAddress?.emailAddress, loadForUser]);

  const allVehicles = useQuery(api.jobs.listVehicles, {});
  const favoriteVehicles = useMemo<any[]>(() => {
    return (allVehicles ?? []).filter((v: any) => favorites[v._id] && v.images?.[0]);
  }, [favorites, allVehicles]);

  const getHeartAnim = (id: string) => {
    if (!heartAnims.has(id)) {
      heartAnims.set(id, new Animated.Value(1));
    }
    return heartAnims.get(id)!;
  };

  const handleFavoritePress = (id: string) => {
    const anim = getHeartAnim(id);
    anim.setValue(1);
    Animated.sequence([
      Animated.spring(anim, { toValue: 1.4, useNativeDriver: true, tension: 200, friction: 3 }),
      Animated.spring(anim, { toValue: 1, useNativeDriver: true, tension: 200, friction: 5 }),
    ]).start();
    toggleFavorite(id);
  };

  const handleCreateCollection = () => {
    const trimmed = newCollectionName.trim();
    if (!trimmed) return;
    createCollection(trimmed);
    setNewCollectionName("");
    setShowCreateModal(false);
  };

  const handleOpenCollection = (collectionId: string) => {
    router.push(`/favorites/collection/${collectionId}`);
  };

  const handleVehiclePress = (vehicleId: string) => {
    router.push(`/vehicle-details?id=${vehicleId}`);
  };

  if (!signedIn) {
    return (
      <View style={styles.container}>
        <View style={styles.loginEmpty}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="heart-outline" size={36} color={NAVY} />
          </View>
          <Text style={styles.emptyTitle}>Sign in to view favorites</Text>
          <Text style={styles.emptySubtitle}>Your saved vehicles and collections will appear here once you log in.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Controls */}
        <View style={styles.controls}>
          <Text style={styles.controlsCount}>
            {collections.length === 0
              ? "No collections"
              : `${collections.length} collection${collections.length === 1 ? "" : "s"}`}
          </Text>
          <View style={styles.controlsRight}>
            <Pressable
              style={styles.viewToggle}
              onPress={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            >
              <Ionicons
                name={viewMode === "grid" ? "grid-outline" : "list-outline"}
                size={18}
                color={NAVY}
              />
            </Pressable>
          </View>
        </View>

        {/* Collections */}
        {collections.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="heart-outline" size={36} color={NAVY} />
            </View>
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptySubtitle}>Tap the heart icon on any vehicle or driver to save it here.</Text>
          </View>
        ) : (
          <View style={viewMode === "grid" ? styles.collectionsGrid : styles.collectionsList}>
            {collections.map((collection) => {
              const collectionVehicles = (allVehicles ?? [])
                .filter((v: any) => collection.vehicleIds.includes(v._id))
                .slice(0, 1);

              if (viewMode === "grid") {
                return (
                  <Pressable
                    key={collection.id}
                    style={styles.collectionCard}
                    onPress={() => handleOpenCollection(collection.id)}
                  >
                    <View style={styles.collectionImageWrap}>
                      {collectionVehicles.length > 0 ? (
                        <Image
                          source={{ uri: collectionVehicles[0].images?.[0] }}
                          style={styles.collectionImage}
                          contentFit="cover"
                        />
                      ) : (
                        <View style={styles.collectionPlaceholder}>
                          <Ionicons name="car-outline" size={36} color="#9CA3AF" />
                        </View>
                      )}
                      <View style={styles.collectionBadge}>
                        <Text style={styles.collectionBadgeText}>{collection.vehicleIds.length}</Text>
                      </View>
                    </View>
                    <View style={styles.collectionInfo}>
                      <Text style={styles.collectionName} numberOfLines={1}>
                        {collection.name}
                      </Text>
                      <Text style={styles.collectionCount}>
                        {collection.vehicleIds.length === 1 ? "1 vehicle" : `${collection.vehicleIds.length} vehicles`}
                      </Text>
                    </View>
                  </Pressable>
                );
              }

              return (
                <Pressable
                  key={collection.id}
                  style={styles.collectionListItem}
                  onPress={() => handleOpenCollection(collection.id)}
                >
                  <View style={styles.collectionListImageWrap}>
                    {collectionVehicles.length > 0 ? (
                      <Image
                        source={{ uri: collectionVehicles[0].images?.[0] }}
                        style={styles.collectionListImage}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={styles.collectionListPlaceholder}>
                        <Ionicons name="car-outline" size={20} color="#9CA3AF" />
                      </View>
                    )}
                  </View>
                  <View style={styles.collectionListInfo}>
                    <Text style={styles.collectionName} numberOfLines={1}>
                      {collection.name}
                    </Text>
                    <Text style={styles.collectionCount}>
                      {collection.vehicleIds.length === 1 ? "1 vehicle" : `${collection.vehicleIds.length} vehicles`}
                    </Text>
                  </View>
                  <View style={styles.collectionListBadge}>
                    <Text style={styles.collectionBadgeText}>{collection.vehicleIds.length}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Saved Vehicles */}
        {favoriteVehicles.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Saved vehicles</Text>
            {viewMode === "grid" ? (
              <View style={styles.grid}>
                {favoriteVehicles.map((vehicle) => {
                  const heartScale = getHeartAnim(vehicle._id);
                  return (
                    <Pressable
                      key={vehicle._id}
                      style={styles.card}
                      onPress={() => handleVehiclePress(vehicle._id)}
                    >
                      <View style={styles.imageWrap}>
                        <Image
                          source={{ uri: vehicle.images?.[0] }}
                          style={styles.cardImage}
                          contentFit="cover"
                        />
                        <Pressable
                          style={styles.favoriteBadge}
                          onPress={() => handleFavoritePress(vehicle._id)}
                        >
                          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                            <Ionicons name="heart" size={18} color="#FFFFFF" />
                          </Animated.View>
                        </Pressable>
                      </View>
                      <View style={styles.cardBody}>
                        <Text style={styles.cardTitle} numberOfLines={1}>
                          {vehicle.title}
                        </Text>
                        <Text style={styles.cardSubtitle} numberOfLines={1}>
                          {vehicle.city} • {vehicle.region}
                        </Text>
                        <View style={styles.cardFooter}>
                          <Text style={styles.cardPrice}>
                            {vehicle.pricePerDay ? `GH₵ ${vehicle.pricePerDay}` : ""}
                          </Text>
                          <View style={styles.ratingBadge}>
                            <Ionicons name="star" size={12} color={GREEN} />
                            <Text style={styles.ratingText}>{vehicle.rating ?? 5.0}</Text>
                          </View>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <View style={styles.list}>
                {favoriteVehicles.map((vehicle) => {
                  const heartScale = getHeartAnim(vehicle._id);
                  return (
                    <Pressable
                      key={vehicle._id}
                      style={styles.listItem}
                      onPress={() => handleVehiclePress(vehicle._id)}
                    >
                      <View style={styles.listImageWrap}>
                        <Image
                          source={{ uri: vehicle.images?.[0] }}
                          style={styles.listImage}
                          contentFit="cover"
                        />
                      </View>
                      <View style={styles.listInfo}>
                        <Text style={styles.cardTitle} numberOfLines={1}>
                          {vehicle.title}
                        </Text>
                        <Text style={styles.cardSubtitle} numberOfLines={1}>
                          {vehicle.city} • {vehicle.region}
                        </Text>
                        <View style={styles.cardFooter}>
                          <Text style={styles.cardPrice}>
                            {vehicle.pricePerDay ? `GH₵ ${vehicle.pricePerDay}` : ""}
                          </Text>
                          <View style={styles.ratingBadge}>
                            <Ionicons name="star" size={12} color={GREEN} />
                            <Text style={styles.ratingText}>{vehicle.rating ?? 5.0}</Text>
                          </View>
                        </View>
                      </View>
                      <Pressable
                        style={styles.listHeartButton}
                        onPress={() => handleFavoritePress(vehicle._id)}
                      >
                        <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                          <Ionicons name="heart" size={18} color="#FFFFFF" />
                        </Animated.View>
                      </Pressable>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Create Collection Modal */}
      <Modal visible={showCreateModal} animationType="none" transparent onRequestClose={() => setShowCreateModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowCreateModal(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Collection</Text>
              <Pressable onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={22} color={NAVY} />
              </Pressable>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder="Collection name"
              placeholderTextColor="#9CA3AF"
              value={newCollectionName}
              onChangeText={setNewCollectionName}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancel} onPress={() => setShowCreateModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalCreate} onPress={handleCreateCollection}>
                <Text style={styles.modalCreateText}>Create</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: NAVY,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 4,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 16,
    gap: 10,
  },
  controlsCount: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  controlsRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
  collectionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    alignItems: "flex-start",
  },
  collectionsList: {
    flexDirection: "column",
    gap: 14,
  },
  collectionCard: {
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
  collectionImageWrap: {
    width: "100%",
    height: 140,
  },
  collectionImage: {
    width: "100%",
    height: "100%",
  },
  collectionPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  collectionBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  collectionBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  collectionInfo: {
    padding: 12,
  },
  collectionName: {
    fontSize: 16,
    fontWeight: "700",
    color: NAVY,
    marginBottom: 4,
  },
  collectionCount: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  collectionListItem: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  collectionListImageWrap: {
    width: 140,
    height: 140,
    flexShrink: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },
  collectionListImage: {
    width: "100%",
    height: "100%",
  },
  collectionListPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  collectionListInfo: {
    flex: 1,
  },
  collectionListBadge: {
    backgroundColor: NAVY,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 80,
    flexDirection: "column",
    gap: 14,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FDE68A",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: NAVY,
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  loginEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    flexDirection: "column",
    gap: 14,
    paddingHorizontal: 40,
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: NAVY,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    alignItems: "flex-start",
  },
  list: {
    flexDirection: "column",
    gap: 14,
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
  listItem: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  listImageWrap: {
    width: 140,
    height: 140,
    flexShrink: 1,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },
  listImage: {
    width: "100%",
    height: "100%",
  },
  listInfo: {
    flex: 1,
    gap: 4,
    justifyContent: "center",
  },
  listHeartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: NAVY,
    alignItems: "center",
    justifyContent: "center",
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
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
  cardSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: GREEN,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "700",
    color: NAVY,
  },
  bottomSpacer: {
    height: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
    flexDirection: "column",
    gap: 14,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: NAVY,
    letterSpacing: -0.3,
  },
  modalInput: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: NAVY,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6B7280",
  },
  modalCreate: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: NAVY,
    alignItems: "center",
  },
  modalCreateText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
