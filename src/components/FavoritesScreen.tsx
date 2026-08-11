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
import { useAuth } from "@/contexts/AuthProvider";
import { router } from "expo-router";
import { useFavoritesStore, type VehicleFavorite } from "@/store/useFavoritesStore";
import { VEHICLES } from "@/app/HomeScreenContent";
import { images } from "@/constants/images";
import EmptyState from "@/components/EmptyState";

const NAVY = "#2C3E5B";
const GREEN = "#10B981";
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function FavoritesScreen() {
  const { signedIn, email } = useAuth();
  const favorites = useFavoritesStore((state) => state.favorites);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const loadForUser = useFavoritesStore((state) => state.loadForUser);
  const collections = useFavoritesStore((state) => state.collections);
  const createCollection = useFavoritesStore((state) => state.createCollection);
  const addVehicleToCollection = useFavoritesStore((state) => state.addVehicleToCollection);
  const deleteCollection = useFavoritesStore((state) => state.deleteCollection);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);
  const heartAnims = useRef<Map<string, Animated.Value>>(new Map()).current;
  const collectionCardRefs = useRef<{ [key: string]: View | null }>({});
  const collectionBoundsMap = useRef<{ [key: string]: { x: number; y: number; width: number; height: number } | null }>({});

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [showAddToCollectionModal, setShowAddToCollectionModal] = useState(false);
  const [dragOverCollectionId, setDragOverCollectionId] = useState<string | null>(null);
  const [receivingCollectionId, setReceivingCollectionId] = useState<string | null>(null);
  const [draggedVehicleId, setDraggedVehicleId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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

  const handleOpenCollection = (collectionId: string) => {
    router.push(`/favorites/collection/${collectionId}`);
  };

  const handleDeleteCollection = (collectionId: string) => {
    deleteCollection(collectionId);
  };

  const handleDropOnCollection = useCallback((collectionId: string, vehicleId: string) => {
    addVehicleToCollection(collectionId, vehicleId);
    removeFavorite(vehicleId);
    setDragOverCollectionId(null);
    setReceivingCollectionId(collectionId);
    setTimeout(() => setReceivingCollectionId(null), 600);
  }, [addVehicleToCollection, removeFavorite]);

  const measureCollection = useCallback((id: string): Promise<{ x: number; y: number; width: number; height: number } | null> => {
    const ref = collectionCardRefs.current[id];
    if (!ref) return Promise.resolve(null);
    return new Promise((resolve) => {
      ref.measure((fx, fy, fw, fh, px, py) => {
        resolve({ x: px, y: py, width: fw, height: fh });
      });
    });
  }, []);

  const refreshAllCollectionBounds = useCallback(async () => {
    const updated: { [key: string]: { x: number; y: number; width: number; height: number } } = {};
    for (const collection of collections) {
      const bounds = await measureCollection(collection.id);
      if (bounds) {
        updated[collection.id] = bounds;
      }
    }
    Object.assign(collectionBoundsMap.current, updated);
  }, [collections, measureCollection]);

  const checkFolderHover = useCallback((moveX: number, moveY: number): string | null => {
    for (const collection of collections) {
      const bounds = collectionBoundsMap.current[collection.id];
      if (!bounds) continue;
      if (
        moveX >= bounds.x &&
        moveX <= bounds.x + bounds.width &&
        moveY >= bounds.y &&
        moveY <= bounds.y + bounds.height
      ) {
        return collection.id;
      }
    }
    return null;
  }, [collections]);

  const handleDragMove = useCallback((gesture: any) => {
    const hoveredId = checkFolderHover(gesture.moveX, gesture.moveY);
    setDragOverCollectionId(hoveredId);
  }, [checkFolderHover]);

  const handleDragEnd = useCallback((gesture: any, vehicleId: string) => {
    const hoveredId = checkFolderHover(gesture.moveX, gesture.moveY);
    if (hoveredId) {
      handleDropOnCollection(hoveredId, vehicleId);
    } else {
      setDragOverCollectionId(null);
    }
    setDraggedVehicleId(null);
    setIsDragging(false);
  }, [checkFolderHover, handleDropOnCollection]);

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
          <View style={styles.collectionsGrid}>
            {collections.map((collection) => {
              const stackedImages = collection.vehicleIds
                .slice(-3)
                .map((id) => VEHICLES.find((v) => v.id === id))
                .filter((v): v is VehicleFavorite => !!v && typeof v.image === "string" && typeof v.category === "string");
              const isDragOver = dragOverCollectionId === collection.id;
              const isReceiving = receivingCollectionId === collection.id;
              return (
                <CollectionCard
                  key={collection.id}
                  ref={(ref) => { collectionCardRefs.current[collection.id] = ref as View; }}
                  collection={collection}
                  stackedImages={stackedImages}
                  isDragOver={isDragOver}
                  isReceiving={isReceiving}
                  onPress={() => handleOpenCollection(collection.id)}
                  onDrop={(vehicleId) => handleDropOnCollection(collection.id, vehicleId)}
                  onDelete={() => handleDeleteCollection(collection.id)}
                  onLayout={(id, x, y, width, height) => {
                    collectionBoundsMap.current[id] = { x, y, width, height };
                  }}
                />
              );
            })}
          </View>
        )}

        {favoriteVehicles.length === 0 ? (
          <EmptyState
            image={images.favoritesHeart}
            title="No favorites yet"
            subtitle="Tap the heart icon on any vehicle to save it here."
          />
        ) : (
          <View style={styles.grid}>
            {favoriteVehicles.map((vehicle) => (
              <DraggableCard
                key={vehicle.id}
                vehicle={vehicle}
                onFavoritePress={() => handleFavoritePress(vehicle.id)}
                onAddToCollection={() => openAddToCollection(vehicle.id)}
                isDragOver={draggedVehicleId === vehicle.id && dragOverCollectionId !== null}
                isDragging={isDragging}
                onDragStart={async () => {
                  setDragOverCollectionId(null);
                  setDraggedVehicleId(vehicle.id);
                  setIsDragging(true);
                  await refreshAllCollectionBounds();
                }}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <BottomSheet visible={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <View style={styles.bottomSheetHeader}>
          <Text style={styles.bottomSheetTitle}>New Collection</Text>
          <Pressable onPress={() => setShowCreateModal(false)} hitSlop={8}>
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
      </BottomSheet>

      <BottomSheet visible={showAddToCollectionModal} onClose={() => setShowAddToCollectionModal(false)}>
        <View style={styles.bottomSheetHeader}>
          <Text style={styles.bottomSheetTitle}>Add to Collection</Text>
          <Pressable onPress={() => setShowAddToCollectionModal(false)} hitSlop={8}>
            <Ionicons name="close" size={22} color={NAVY} />
          </Pressable>
        </View>
        {collections.length === 0 ? (
          <Text style={styles.modalEmptyText}>No collections yet. Create one first.</Text>
        ) : (
          <View style={styles.collectionOptionsList}>
            {collections.map((collection) => (
              <Pressable
                key={collection.id}
                style={styles.collectionOption}
                onPress={() => handleAddToCollection(collection.id)}
              >
                <View style={styles.collectionOptionIcon}>
                  <Ionicons name="folder-outline" size={20} color={NAVY} />
                </View>
                <View style={styles.collectionOptionBody}>
                  <Text style={styles.collectionOptionText}>{collection.name}</Text>
                  <Text style={styles.collectionOptionCount}>{collection.vehicleIds.length} items</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </Pressable>
            ))}
          </View>
        )}
        <Pressable style={styles.modalCancelFull} onPress={() => setShowAddToCollectionModal(false)}>
          <Text style={styles.modalCancelText}>Cancel</Text>
        </Pressable>
      </BottomSheet>
    </View>
  );
}

const BottomSheet = ({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: React.ReactNode }) => {
  const sheetAnim = useRef(new Animated.Value(0)).current;

  const openSheet = useCallback(() => {
    sheetAnim.setValue(0);
    Animated.timing(sheetAnim, {
      toValue: 1,
      duration: 420,
      useNativeDriver: true,
    }).start();
  }, [sheetAnim]);

  const closeSheet = useCallback(() => {
    Animated.timing(sheetAnim, {
      toValue: 0,
      duration: 320,
      useNativeDriver: true,
    }).start(() => onClose());
  }, [sheetAnim, onClose]);

  useEffect(() => {
    if (visible) {
      openSheet();
    }
  }, [visible, openSheet]);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={closeSheet}>
      <Pressable style={styles.bottomSheetOverlay} onPress={closeSheet}>
        <Animated.View
          style={[
            styles.bottomSheetContent,
            {
              transform: [
                {
                  translateY: sheetAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [600, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.bottomSheetHandle} />
          <ScrollView
            contentContainerStyle={styles.bottomSheetScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const CollectionCard = forwardRef<View, {
  collection: { id: string; name: string; vehicleIds: string[] };
  stackedImages: VehicleFavorite[];
  isDragOver: boolean;
  isReceiving: boolean;
  onPress: () => void;
  onDrop: (vehicleId: string) => void;
  onDelete: () => void;
  onLayout?: (id: string, x: number, y: number, width: number, height: number) => void;
}>(({ collection, stackedImages, isDragOver, isReceiving, onPress, onDrop, onDelete, onLayout }, ref) => {
  const cardScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isReceiving) {
      cardScale.setValue(1);
      Animated.sequence([
        Animated.timing(cardScale, { toValue: 1.12, duration: 150, useNativeDriver: true }),
        Animated.spring(cardScale, { toValue: isDragOver ? 0.85 : 1, useNativeDriver: true, tension: 200, friction: 3 }),
      ]).start();
    } else {
      Animated.timing(cardScale, {
        toValue: isDragOver ? 0.85 : 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
    }
  }, [isReceiving, isDragOver, cardScale]);

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
    transform: [{ scale: cardScale }],
  };

  return (
    <Pressable
      ref={ref}
      onPress={onPress}
      style={[styles.collectionCard, isDragOver && styles.collectionCardDragOver]}
      onLayout={(event) => {
        const { x, y, width, height } = event.nativeEvent.layout;
        onLayout?.(collection.id, x, y, width, height);
      }}
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
      <Pressable style={styles.trashButton} onPress={onDelete}>
        <Ionicons name="trash-outline" size={16} color="#E74C3C" />
      </Pressable>
    </Pressable>
  );
});

CollectionCard.displayName = "CollectionCard";

function DraggableCard({ vehicle, onFavoritePress, onAddToCollection, onDragStart, onDragMove, onDragEnd, isDragOver, isDragging }: {
  vehicle: VehicleFavorite;
  onFavoritePress: () => void;
  onAddToCollection: () => void;
  onDragStart?: () => void;
  onDragMove?: (gesture: any) => void;
  onDragEnd?: (gesture: any, vehicleId: string) => void;
  isDragOver?: boolean;
  isDragging?: boolean;
}) {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const shadow = useRef(new Animated.Value(0)).current;
  const bodyHeight = useRef(new Animated.Value(0)).current;
  const cardWidth = useRef(new Animated.Value(1)).current;
  const [expanded, setExpanded] = useState(false);

  const animatedStyle = {
    transform: [
      { translateX },
      { translateY },
      { scale },
    ],
    opacity,
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: isDragging ? 12 : 2 },
    shadowOpacity: isDragging ? 0.25 : 0.08,
    shadowRadius: isDragging ? 16 : 8,
    elevation: isDragging ? 8 : 2,
    zIndex: isDragging ? 999 : 1,
  };

  const toggleExpand = () => {
    const next = !expanded;
    setExpanded(next);
    Animated.timing(bodyHeight, {
      toValue: next ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
    Animated.timing(cardWidth, {
      toValue: next ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  };

  const bodyInterpolate = bodyHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 120],
  });

  const widthInterpolate = cardWidth.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 24],
  });

  const handleStart = () => {
    onDragStart?.();
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.92, useNativeDriver: true, tension: 200, friction: 4 }),
      Animated.spring(shadow, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  const handleMove = (_dx: number, _dy: number, gesture: any) => {
    translateX.setValue(_dx);
    translateY.setValue(_dy);
    onDragMove?.(gesture);
  };

  const handleEnd = (gesture: any) => {
    Animated.parallel([
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 4 }),
      Animated.spring(shadow, { toValue: 0, useNativeDriver: true }),
    ]).start(() => {
      translateX.setValue(0);
      translateY.setValue(0);
      scale.setValue(1);
      shadow.setValue(0);
      onDragEnd?.(gesture, vehicle.id);
    });
  };

  const handleTap = () => {
    toggleExpand();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderGrant: handleStart,
      onPanResponderMove: (_, gesture) => handleMove(gesture.dx, gesture.dy, gesture),
      onPanResponderRelease: (_, gesture) => {
        const totalMovement = Math.sqrt(gesture.dx * gesture.dx + gesture.dy * gesture.dy);
        if (totalMovement < 5) {
          handleTap();
        } else {
          handleEnd(gesture);
        }
      },
      onPanResponderTerminate: () => {
        Animated.parallel([
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
          Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 4 }),
          Animated.spring(shadow, { toValue: 0, useNativeDriver: true }),
        ]).start(() => {
          translateX.setValue(0);
          translateY.setValue(0);
          scale.setValue(1);
          shadow.setValue(0);
        });
      },
    })
  ).current;

  return (
    <Animated.View style={[styles.card, animatedStyle]} {...panResponder.panHandlers}>
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
        <View style={styles.dragHandle} pointerEvents="none">
          <Ionicons name="reorder-three" size={20} color="#FFFFFF" />
        </View>
      </View>
      <View style={[styles.cardBody, { maxHeight: bodyInterpolate, overflow: "hidden", paddingRight: widthInterpolate }]}>
        <Text style={styles.price}>{vehicle.price}</Text>
        <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
          {vehicle.title}
        </Text>
        <Text style={styles.cardSubtitle}>{vehicle.location} • {vehicle.condition}</Text>
        <Text style={styles.cardTransmission}>{vehicle.transmission}</Text>
        <View style={styles.metaRow}>
          {vehicle.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={12} color="#10B981" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
          <Text style={styles.yearsText}>{vehicle.yearsOnPlatform}</Text>
        </View>
        <View style={styles.ownerRow}>
          <Image source={{ uri: vehicle.ownerAvatar }} style={styles.ownerAvatar} contentFit="cover" />
          <Text style={styles.ownerName} numberOfLines={1} ellipsizeMode="tail">
            {vehicle.ownerName}
          </Text>
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
  collectionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  collectionCard: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 8,
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
    borderWidth: 2.5,
    backgroundColor: "#F3F4F6",
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
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
    paddingLeft: 12,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 4,
    overflow: "hidden",
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
    color: GREEN,
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
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  bottomSheetContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
    gap: 8,
    width: "100%",
    height: SCREEN_HEIGHT * 0.70,
  },
  bottomSheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
    marginBottom: 12,
  },
  bottomSheetScrollContent: {
    gap: 8,
  },
  bottomSheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: NAVY,
  },
  modalInput: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: NAVY,
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
    backgroundColor: "#FFFFFF",
  },
  modalCreate: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: NAVY,
    alignItems: "center",
  },
  modalCancelFull: {
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginTop: 8,
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
  collectionOptionsList: {
    gap: 8,
    marginTop: 4,
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
  collectionOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  collectionOptionBody: {
    flex: 1,
  },
  collectionOptionText: {
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
  cardSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  cardTransmission: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: "600",
    color: GREEN,
  },
  yearsText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  ownerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  ownerAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  ownerName: {
    fontSize: 11,
    fontWeight: "600",
    color: NAVY,
    flexShrink: 1,
  },
});
