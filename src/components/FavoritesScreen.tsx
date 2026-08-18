import { useRef, useEffect, useState } from "react";
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
import * as Haptics from "expo-haptics";
import { useAuth } from "@/contexts/AuthProvider";
import { useUser } from "@clerk/expo";
import { router } from "expo-router";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import Toast from "@/components/Toast";
import EmptyState from "@/components/EmptyState";
import { useToast } from "@/hooks/useToast";

const NAVY = "#2C3E5B";

export default function FavoritesScreen() {
  const { signedIn } = useAuth();
  const { user } = useUser();
  const loadForUser = useFavoritesStore((state) => state.loadForUser);
  const collections = useFavoritesStore((state) => state.collections);
  const createCollection = useFavoritesStore((state) => state.createCollection);
  const deleteCollection = useFavoritesStore((state) => state.deleteCollection);
  const viewMode = useFavoritesStore((state) => state.favoritesViewMode);
  const setViewMode = useFavoritesStore((state) => state.setFavoritesViewMode);
  const heartAnims = useRef<Map<string, Animated.Value>>(new Map()).current;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [pressedCollectionId, setPressedCollectionId] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    loadForUser(user?.primaryEmailAddress?.emailAddress ?? "");
  }, [user?.primaryEmailAddress?.emailAddress, loadForUser]);

  const handleCreateCollection = () => {
    const trimmed = newCollectionName.trim();
    if (!trimmed) return;
    createCollection(trimmed);
    setNewCollectionName("");
    setShowCreateModal(false);
    showToast("Collection created", "success");
  };

  const handleOpenCollection = (collectionId: string) => {
    if (pressedCollectionId === collectionId) {
      setPressedCollectionId(null);
      return;
    }
    if (isNavigating) return;
    setIsNavigating(true);
    setTimeout(() => setIsNavigating(false), 600);
    router.push(`/favorites/collection/${collectionId}`);
  };

  const handleRemoveCollection = (collectionId: string) => {
    deleteCollection(collectionId);
    setPressedCollectionId(null);
    showToast("Collection deleted", "error");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleCollectionLongPress = (collectionId: string) => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    setPressedCollectionId(collectionId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const clearPressed = () => {
    if (pressedCollectionId) {
      setPressedCollectionId(null);
    }
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
      {/* Controls */}
      <View style={styles.controls}>
        <Text style={styles.controlsCount}>
          {collections.length === 0
            ? "No collections"
            : `${collections.length} collection${collections.length === 1 ? "" : "s"}`}
        </Text>
        <Pressable onPress={() => setViewMode(viewMode === "grid" ? "list" : "grid")} hitSlop={8}>
          <Ionicons
            name={viewMode === "grid" ? "grid-outline" : "list-outline"}
            size={22}
            color={NAVY}
          />
        </Pressable>
      </View>

      {/* Backdrop to dismiss long-press mode */}
      {pressedCollectionId !== null && (
        <Pressable style={styles.backdrop} onPress={clearPressed} />
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Collections */}
        {collections.length === 0 ? (
          <EmptyState
            title="No favorites yet"
            subtitle="Tap the heart icon on any vehicle or driver to save it here."
            ctaText="New Collection"
            onCtaPress={() => setShowCreateModal(true)}
          />
        ) : (
          <View style={viewMode === "grid" ? styles.collectionsGrid : styles.collectionsList}>
            {collections.map((collection) => {
              const latestItem = collection.items[collection.items.length - 1];
              const isPressed = pressedCollectionId === collection.id;

              return (
                <Pressable
                  key={collection.id}
                  style={[
                    viewMode === "grid" ? styles.collectionCard : styles.collectionListItem,
                    isPressed && styles.collectionCardPressed,
                  ]}
                  onPress={() => handleOpenCollection(collection.id)}
                  onLongPress={() => handleCollectionLongPress(collection.id)}
                >
                  <View style={viewMode === "grid" ? styles.collectionImageWrap : styles.collectionListImageWrap}>
                    {latestItem ? (
                      <Image
                        source={{ uri: latestItem.image }}
                        style={styles.collectionImage}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={styles.collectionPlaceholder}>
                        <Ionicons name="car-outline" size={36} color="#9CA3AF" />
                      </View>
                    )}
                    <View style={styles.collectionBadge}>
                      <Text style={styles.collectionBadgeText}>{collection.items.length}</Text>
                    </View>
                    {isPressed && (
                      <Pressable
                        style={({ pressed }) => [
                          styles.deleteCornerButton,
                          pressed && { opacity: 0.7 },
                        ]}
                        onPress={() => handleRemoveCollection(collection.id)}
                        onStartShouldSetResponder={() => true}
                      >
                        <Ionicons name="trash" size={18} color="#FFFFFF" />
                      </Pressable>
                    )}
                  </View>
                  <View style={styles.collectionInfo}>
                    <Text style={styles.collectionName} numberOfLines={1}>
                      {collection.name}
                    </Text>
                    <Text style={styles.collectionCount}>
                      {collection.items.length === 1 ? "1 vehicle" : `${collection.items.length} vehicles`}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />

      {/* Create Collection Modal */}
      <Modal visible={showCreateModal} animationType="none" transparent onRequestClose={() => setShowCreateModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowCreateModal(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Collection</Text>
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
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
  },
  controlsCount: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  iconButton: {
    padding: 8,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100,
  },
  collectionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    alignItems: "flex-start",
  },
  collectionsList: {
    flexDirection: "column",
    gap: 12,
  },
  collectionListItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
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
  collectionCardPressed: {
    opacity: 0.9,
  },
  deleteCornerButton: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(239, 68, 68, 0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  collectionImageWrap: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
  collectionListImageWrap: {
    width: 140,
    height: 140,
    flexShrink: 1,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
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
