import { useMemo, useRef, useEffect, useState, useCallback, forwardRef } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Animated,
  TextInput,
  Modal,
  PanResponder,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/contexts/AuthProvider";
import { useFavoritesStore, type VehicleFavorite } from "@/store/useFavoritesStore";
import { VEHICLES } from "@/app/HomeScreenContent";

const NAVY = "#2C3E5B";
const SCREEN_WIDTH = Dimensions.get("window").width;

export default function FavoritesScreen() {
  const { signedIn, email } = useAuth();
  const favorites = useFavoritesStore((state) => state.favorites);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const loadForUser = useFavoritesStore((state) => state.loadForUser);
  const collections = useFavoritesStore((state) => state.collections);
  const createCollection = useFavoritesStore((state) => state.createCollection);
  const addVehicleToCollection = useFavoritesStore((state) => state.addVehicleToCollection);
  const deleteCollection = useFavoritesStore((state) => state.deleteCollection);
  const heartAnims = useRef<Map<string, Animated.Value>>(new Map()).current;
  const collectionCardRefs = useRef<Record<string, View | null>>({});
  const draggedCardRefs = useRef<Record<string, any>>({});

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [showAddToCollectionModal, setShowAddToCollectionModal] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [showCollectionOptions, setShowCollectionOptions] = useState(false);
  const [openCollectionId, setOpenCollectionId] = useState<string | null>(null);
  const [dragOverCollectionId, setDragOverCollectionId] = useState<string | null>(null);

  useEffect(() => {
    loadForUser(email);
  }, [email, loadForUser]);

  const favoriteVehicles = useMemo<VehicleFavorite[]>(() => {
    return VEHICLES.filter((v) => v.id !== "14" && favorites[v.id] && "image" in v && v.image) as VehicleFavorite[];
  }, [favorites]);

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

  const openAddToCollection = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    setShowAddToCollectionModal(true);
  };

  const handleAddToCollection = (collectionId: string) => {
    if (!selectedVehicleId) return;
    addVehicleToCollection(collectionId, selectedVehicleId);
    setShowAddToCollectionModal(false);
    setSelectedVehicleId(null);
  };

  const handleCollectionLongPress = (collectionId: string) => {
    setSelectedCollectionId(collectionId);
    setShowCollectionOptions(true);
  };

  const handleOpenCollection = (collectionId: string) => {
    setOpenCollectionId(collectionId);
  };

  const handleDeleteCollection = () => {
    if (selectedCollectionId) {
      deleteCollection(selectedCollectionId);
    }
    setShowCollectionOptions(false);
    setSelectedCollectionId(null);
  };

  const handleDropOnCollection = useCallback((collectionId: string, vehicleId: string) => {
    addVehicleToCollection(collectionId, vehicleId);
    setDragOverCollectionId(null);
  }, [addVehicleToCollection]);

  const openCollection = collections.find((c) => c.id === openCollectionId);
  const openCollectionVehicles = useMemo<VehicleFavorite[]>(() => {
    if (!openCollection) return [];
    return openCollection.vehicleIds
      .map((id) => VEHICLES.find((v) => v.id === id))
      .filter((v): v is VehicleFavorite => !!v && typeof v.image === "string" && typeof v.category === "string");
  }, [openCollection]);

  if (!signedIn) {
    return (
      <View style={styles.loginContainer}>
        <Text style={styles.loginTitle}>Favorites</Text>
        <Text style={styles.loginSubtitle}>Log in to view your favorites. You can save, view, or edit favorites once you&apos;ve logged in.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Favorites</Text>
          <Text style={styles.headerSubtitle}>
            {favoriteVehicles.length} {favoriteVehicles.length === 1 ? "item" : "items"} saved
          </Text>
        </View>

        {/* Collections */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Collections</Text>
          <Pressable style={styles.addCollectionButton} onPress={() => setShowCreateModal(true)}>
            <Ionicons name="add" size={20} color={NAVY} />
          </Pressable>
        </View>

        {collections.length === 0 ? (
          <View style={styles.emptyCollections}>
            <Text style={styles.emptyCollectionsText}>No collections yet. Create one to organize your favorites.</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.collectionsRow}
          >
            {collections.map((collection) => {
              const stackedImages = collection.vehicleIds
                .slice(-3)
                .map((id) => VEHICLES.find((v) => v.id === id))
                .filter((v): v is VehicleFavorite => !!v && typeof v.image === "string" && typeof v.category === "string");
              const isDragOver = dragOverCollectionId === collection.id;
              return (
                <CollectionCard
                  key={collection.id}
                  ref={(ref) => { collectionCardRefs.current[collection.id] = ref as View; }}
                  collection={collection}
                  stackedImages={stackedImages}
                  isDragOver={isDragOver}
                  onPress={() => handleOpenCollection(collection.id)}
                  onLongPress={() => handleCollectionLongPress(collection.id)}
                  onDrop={(vehicleId) => handleDropOnCollection(collection.id, vehicleId)}
                  onDelete={() => {
                    setSelectedCollectionId(collection.id);
                    handleDeleteCollection();
                  }}
                />
              );
            })}
          </ScrollView>
        )}

        {/* Favorites grid */}
        {favoriteVehicles.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptySubtitle}>Tap the heart icon on any vehicle to save it here.</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {favoriteVehicles.map((vehicle) => (
              <DraggableCard
                key={vehicle.id}
                ref={(ref) => { draggedCardRefs.current[vehicle.id] = ref; }}
                vehicle={vehicle}
                onFavoritePress={() => handleFavoritePress(vehicle.id)}
                onAddToCollection={() => openAddToCollection(vehicle.id)}
                onDragEnd={(vehicleId, dx, dy) => {
                  const cardRef = draggedCardRefs.current[vehicleId];
                  if (!cardRef) return;
                  cardRef.measure((fx: number, fy: number, fw: number, fh: number, px: number, py: number) => {
                    const cardCenterX = px + fw / 2 + dx;
                    const cardCenterY = py + fh / 2 + dy;
                    let dropped = false;
                    collections.forEach((collection) => {
                      if (dropped) return;
                      const collectionRef = collectionCardRefs.current[collection.id];
                      if (!collectionRef) return;
                      collectionRef.measure((cfx: number, cfy: number, cfw: number, cfh: number, cpx: number, cpy: number) => {
                        if (
                          cardCenterX >= cpx &&
                          cardCenterX <= cpx + cfw &&
                          cardCenterY >= cpy &&
                          cardCenterY <= cpy + cfh
                        ) {
                          handleDropOnCollection(collection.id, vehicleId);
                          dropped = true;
                        }
                      });
                    });
                  });
                }}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Create Collection Modal */}
      <Modal visible={showCreateModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Collection</Text>
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
        </View>
      </Modal>

      {/* Add to Collection Modal */}
      <Modal visible={showAddToCollectionModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add to Collection</Text>
            {collections.length === 0 ? (
              <Text style={styles.modalEmptyText}>No collections yet. Create one first.</Text>
            ) : (
              collections.map((collection) => (
                <Pressable
                  key={collection.id}
                  style={styles.collectionOption}
                  onPress={() => handleAddToCollection(collection.id)}
                >
                  <Ionicons name="folder-outline" size={20} color={NAVY} />
                  <Text style={styles.collectionOptionText}>{collection.name}</Text>
                  <Text style={styles.collectionOptionCount}>{collection.vehicleIds.length} items</Text>
                </Pressable>
              ))
            )}
            <Pressable style={styles.modalCancelFull} onPress={() => setShowAddToCollectionModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Collection Options Modal */}
      <Modal visible={showCollectionOptions} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Collection Options</Text>
            <Pressable style={styles.collectionOption} onPress={handleDeleteCollection}>
              <Ionicons name="trash-outline" size={20} color="#E74C3C" />
              <Text style={[styles.collectionOptionText, { color: "#E74C3C" }]}>Delete Collection</Text>
            </Pressable>
            <Pressable style={styles.modalCancelFull} onPress={() => setShowCollectionOptions(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Collection Detail Modal */}
      <Modal visible={openCollectionId !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.collectionDetailHeader}>
              <Pressable onPress={() => setOpenCollectionId(null)} style={styles.collectionDetailBack}>
                <Ionicons name="arrow-back" size={20} color={NAVY} />
              </Pressable>
              <Text style={styles.modalTitle}>{openCollection?.name}</Text>
              <Pressable onPress={() => { deleteCollection(openCollectionId!); setOpenCollectionId(null); }} style={styles.collectionDetailDelete}>
                <Ionicons name="trash-outline" size={20} color="#E74C3C" />
              </Pressable>
            </View>
            {openCollectionVehicles.length === 0 ? (
              <Text style={styles.modalEmptyText}>This collection is empty.</Text>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.collectionDetailGrid}>
                  {openCollectionVehicles.map((vehicle) => (
                    <View key={vehicle.id} style={styles.collectionDetailCard}>
                      <Image source={{ uri: vehicle.image }} style={styles.collectionDetailImage} contentFit="cover" />
                      <View style={styles.collectionDetailBody}>
                        <Text style={styles.collectionDetailTitle} numberOfLines={1}>{vehicle.title}</Text>
                        <Text style={styles.collectionDetailCategory}>{vehicle.category}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const CollectionCard = forwardRef<View, {
  collection: { id: string; name: string; vehicleIds: string[] };
  stackedImages: VehicleFavorite[];
  isDragOver: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onDrop: (vehicleId: string) => void;
  onDelete: () => void;
}>(({ collection, stackedImages, isDragOver, onPress, onLongPress, onDrop, onDelete }, ref) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteScale = useRef(new Animated.Value(1)).current;
  const deleteOpacity = useRef(new Animated.Value(1)).current;
  const particles = useRef(
    Array.from({ length: 10 }).map(() => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  ).current;

  const handleDelete = () => {
    setIsDeleting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    particles.forEach((p, i) => {
      const angle = (i / particles.length) * Math.PI * 2 + Math.random() * 0.5;
      const distance = 40 + Math.random() * 60;
      Animated.sequence([
        Animated.delay(i * 15),
        Animated.parallel([
          Animated.timing(p.x, { toValue: Math.cos(angle) * distance, duration: 350, useNativeDriver: true }),
          Animated.timing(p.y, { toValue: Math.sin(angle) * distance, duration: 350, useNativeDriver: true }),
          Animated.timing(p.opacity, { toValue: 0, duration: 350, useNativeDriver: true }),
        ]),
      ]).start();
    });
    Animated.sequence([
      Animated.delay(80),
      Animated.parallel([
        Animated.spring(deleteScale, { toValue: 0, useNativeDriver: true, tension: 200, friction: 3 }),
        Animated.timing(deleteOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]),
    ]).start(() => {
      onDelete();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > 50) {
          onDrop(gesture.dx.toString());
        }
      },
    })
  ).current;

  const animatedStyle = {
    transform: [{ scale: deleteScale }],
    opacity: deleteOpacity,
  };

  return (
    <Pressable
      ref={ref}
      onPress={onPress}
      onLongPress={onLongPress}
      style={[styles.collectionCard, isDragOver && styles.collectionCardDragOver]}
      {...panResponder.panHandlers}
    >
      <Animated.View style={[styles.collectionCardInner, animatedStyle]}>
        <View style={styles.collectionImageWrap}>
          {stackedImages.length > 0 ? (
            <View style={styles.stackedImages}>
              {stackedImages.slice(-3).reverse().map((vehicle, index) => (
                <Image
                  key={vehicle.id}
                  source={{ uri: vehicle.image }}
                  style={[
                    styles.stackedImage,
                    { zIndex: stackedImages.length - index, transform: [{ translateX: index * 8 }, { translateY: -index * 6 }, { rotate: `${(index - 1) * 6}deg` }] }
                  ]}
                  contentFit="cover"
                />
              ))}
            </View>
          ) : (
            <View style={styles.collectionImagePlaceholder}>
              <Ionicons name="folder" size={32} color={NAVY} />
            </View>
          )}
        </View>
        <Text style={styles.collectionName} numberOfLines={1}>{collection.name}</Text>
        <Text style={styles.collectionCount}>{collection.vehicleIds.length} items</Text>
      </Animated.View>
      <Pressable style={styles.trashButton} onPress={handleDelete}>
        <Ionicons name="trash-outline" size={16} color="#E74C3C" />
      </Pressable>
      {isDeleting && (
        <View style={styles.particleContainer}>
          {particles.map((p, i) => (
            <Animated.View
              key={i}
              style={[
                styles.particle,
                {
                  transform: [{ translateX: p.x }, { translateY: p.y }],
                  opacity: p.opacity,
                },
              ]}
            />
          ))}
        </View>
      )}
    </Pressable>
  );
});

CollectionCard.displayName = "CollectionCard";

function DraggableCard({ vehicle, onFavoritePress, onAddToCollection, onDragEnd, ref: forwardedRef }: {
  vehicle: VehicleFavorite;
  onFavoritePress: () => void;
  onAddToCollection: () => void;
  onDragEnd: (vehicleId: string, dx: number, dy: number) => void;
  ref?: React.Ref<any>;
}) {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const [isDragging, setIsDragging] = useState(false);

  const animatedStyle = {
    transform: [
      { translateX },
      { translateY },
      { scale },
    ],
    opacity,
  };

  const handleStart = () => {
    setIsDragging(true);
    Animated.parallel([
      Animated.spring(scale, { toValue: 1.05, useNativeDriver: true }),
      Animated.spring(opacity, { toValue: 0.8, useNativeDriver: true }),
    ]).start();
  };

  const handleMove = (dx: number, dy: number) => {
    translateX.setValue(dx);
    translateY.setValue(dy);
  };

  const handleEnd = (dx: number, dy: number) => {
    const shouldRevert = Math.abs(dx) < 30 && Math.abs(dy) < 30;
    Animated.parallel([
      Animated.spring(translateX, { toValue: shouldRevert ? 0 : dx > 0 ? SCREEN_WIDTH : -SCREEN_WIDTH, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: shouldRevert ? 0 : dy, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      Animated.spring(opacity, { toValue: 1, useNativeDriver: true }),
    ]).start(() => {
      if (shouldRevert) {
        translateX.setValue(0);
        translateY.setValue(0);
      } else {
        onDragEnd(vehicle.id, dx, dy);
      }
      setIsDragging(false);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderGrant: handleStart,
      onPanResponderMove: (_, gesture) => handleMove(gesture.dx, gesture.dy),
      onPanResponderRelease: (_, gesture) => handleEnd(gesture.dx, gesture.dy),
      onPanResponderTerminate: () => {
        Animated.parallel([
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
          Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
          Animated.spring(opacity, { toValue: 1, useNativeDriver: true }),
        ]).start();
        setIsDragging(false);
      },
    })
  ).current;

  return (
    <Animated.View ref={forwardedRef} style={[styles.card, animatedStyle]} {...panResponder.panHandlers}>
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: vehicle.image }}
          style={styles.cardImage}
          contentFit="cover"
        />
        <Pressable
          style={styles.favoriteBadge}
          onPress={onFavoritePress}
        >
          <Ionicons name="heart" size={20} color="#E74C3C" />
        </Pressable>
        <Pressable
          style={styles.addToCollectionButton}
          onPress={onAddToCollection}
        >
          <Ionicons name="folder-outline" size={16} color="#FFFFFF" />
        </Pressable>
        {isDragging && (
          <View style={styles.dragHandle}>
            <Ionicons name="reorder-three" size={20} color="#FFFFFF" />
          </View>
        )}
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {vehicle.title}
        </Text>
        <Text style={styles.cardCategory}>{vehicle.category}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color="#FFB800" />
          <Text style={styles.ratingText}>{vehicle.rating}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{vehicle.price}</Text>
          <Text style={styles.originalPrice}>{vehicle.originalPrice}</Text>
        </View>
      </View>
    </Animated.View>
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
  loginContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  loginTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: NAVY,
    marginBottom: 12,
  },
  loginSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 22,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: NAVY,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: NAVY,
  },
  addCollectionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  collectionsRow: {
    gap: 12,
    marginBottom: 20,
  },
  collectionCard: {
    width: 120,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    gap: 6,
  },
  collectionCardInner: {
    alignItems: "center",
    gap: 6,
  },
  collectionCardDragOver: {
    borderColor: NAVY,
    borderWidth: 2,
    backgroundColor: "#F3F4F6",
  },
  trashButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  particleContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
  particle: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFB800",
  },
  collectionImageWrap: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  stackedImages: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  stackedImage: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 6,
    top: 15,
    left: 15,
  },
  collectionImage: {
    width: "100%",
    height: "100%",
  },
  collectionImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  collectionName: {
    fontSize: 13,
    fontWeight: "700",
    color: NAVY,
    textAlign: "center",
  },
  collectionCount: {
    fontSize: 11,
    fontWeight: "500",
    color: "#6B7280",
  },
  emptyCollections: {
    paddingVertical: 12,
  },
  emptyCollectionsText: {
    fontSize: 14,
    color: "#6B7280",
  },
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
  addToCollectionButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  dragHandle: {
    position: "absolute",
    bottom: 8,
    left: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.45)",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    maxHeight: "80%",
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: NAVY,
    textAlign: "center",
  },
  modalInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: NAVY,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  modalCreate: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: NAVY,
    alignItems: "center",
  },
  modalCancelFull: {
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6B7280",
  },
  modalCreateText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  modalEmptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    paddingVertical: 12,
  },
  collectionOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  collectionOptionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: NAVY,
  },
  collectionOptionCount: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  collectionDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  collectionDetailBack: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  collectionDetailDelete: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  collectionDetailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  collectionDetailCard: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  collectionDetailImage: {
    width: "100%",
    height: 100,
  },
  collectionDetailBody: {
    padding: 10,
    gap: 2,
  },
  collectionDetailTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: NAVY,
  },
  collectionDetailCategory: {
    fontSize: 11,
    fontWeight: "500",
    color: "#6B7280",
  },
});
