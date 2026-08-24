import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convexApi";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthProvider";
import { useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { images } from "@/constants/images";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import EmptyState from "@/components/EmptyState";
import Toast from "@/components/Toast";
import { useDoubleTap } from "@/hooks/useDoubleTap";
import { useToast } from "@/hooks/useToast";

const NAVY = "#2C3E5B";

export type OwnerListingsContentProps = {
  hideHeader?: boolean;
};

function getStatusColor(status: string) {
  switch (status) {
    case "active":
      return "#F97316";
    case "inactive":
      return "#6B7280";
    case "draft":
      return "#6B7280";
    default:
      return "#F59E0B";
  }
}

export default function OwnerListingsContent({ hideHeader = false }: OwnerListingsContentProps) {
  const router = useRouter();
  const { userId } = useAuth();

  const vehicles = useQuery(
    api.jobs.getOwnerVehicles,
    userId ? { ownerId: userId } : "skip"
  );

  const deleteVehicle = useMutation(api.jobs.deleteVehicle);
  const toggleStatus = useMutation(api.jobs.toggleVehicleStatus);
  const updateVehicle = useMutation(api.jobs.updateVehicle);

  const { toast, showToast, hideToast } = useToast();

  const handlePublishDraft = async (vehicleId: any) => {
    try {
      await updateVehicle({ vehicleId, status: "active" });
      showToast("Listing published successfully", "success");
    } catch {
      showToast("Failed to publish listing", "error");
    }
  };

  const handleDelete = useDoubleTap(async (vehicleId: any) => {
    await deleteVehicle({ vehicleId });
  });

  const handleToggleStatus = useDoubleTap(async (vehicleId: any, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    await toggleStatus({ vehicleId, status: newStatus });
  });

  const handleOpenSettings = useDoubleTap((vehicleId: any) => {
    router.push({ pathname: "/(owner)/listing-settings", params: { vehicleId } } as any);
  });

  const handleOpenCalendar = useDoubleTap((vehicleId: any) => {
    router.push({ pathname: "/(owner)/availability-calendar", params: { vehicleId } } as any);
  });

  const handleEditPress = useDoubleTap((vehicleId: any) => {
    router.push({ pathname: "/create-listing", params: { vehicleId } } as any);
  });

  const handleAddListing = useDoubleTap(() => {
    router.push("/create-listing" as any);
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchExpanded, setSearchExpanded] = useState(false);
  const searchWidthAnim = useRef(new Animated.Value(0)).current;
  const searchInputRef = useRef<TextInput>(null);

  const handleClearSearch = useDoubleTap(() => {
    setSearchQuery("");
    setSearchExpanded(false);
    Animated.timing(searchWidthAnim, {
      toValue: 0,
      duration: 240,
      useNativeDriver: false,
    }).start();
  });

  const handleToggleSearch = useDoubleTap(() => {
    if (searchExpanded) {
      setSearchExpanded(false);
      Animated.timing(searchWidthAnim, {
        toValue: 0,
        duration: 240,
        useNativeDriver: false,
      }).start();
    } else {
      setSearchExpanded(true);
      searchWidthAnim.setValue(0);
      Animated.timing(searchWidthAnim, {
        toValue: 1,
        duration: 240,
        useNativeDriver: false,
      }).start(() => {
        searchInputRef.current?.focus();
      });
    }
  });

  return (
    <View>
      {!hideHeader && (
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Animated.View
              style={{
                opacity: searchWidthAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0],
                }),
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                justifyContent: "center",
              }}
            >
              <TouchableOpacity onPress={handleToggleSearch} hitSlop={8}>
                <Ionicons name="search" size={22} color={NAVY} />
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              style={[
                styles.searchExpandWrap,
                {
                  width: searchWidthAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 200],
                  }),
                  opacity: searchWidthAnim,
                },
              ]}
            >
              <View style={styles.searchInputWrap}>
                <TouchableOpacity onPress={searchExpanded ? handleClearSearch : undefined} hitSlop={8}>
                  <Ionicons name={searchExpanded ? "close" : "search"} size={20} color={NAVY} />
                </TouchableOpacity>
                <TextInput
                  ref={searchInputRef}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search listings"
                  placeholderTextColor="#9CA3AF"
                  style={styles.searchInput}
                />
              </View>
            </Animated.View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity hitSlop={8} style={styles.iconButton}>
              <Ionicons name="pencil-outline" size={22} color="#374151" />
            </TouchableOpacity>
            <Button size="icon" className="bg-navy" onPress={handleAddListing}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </Button>
          </View>
        </View>
      )}

      {!vehicles || vehicles.length === 0 ? (
        <View style={styles.emptyStateNoScroll}>
          <EmptyState
            image={images.benz}
            title="No listings yet"
            subtitle="Create your first vehicle listing to start receiving bookings."
            ctaText="Add a vehicle"
            onCtaPress={handleAddListing}
            compact
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listingsList}
          showsVerticalScrollIndicator={false}
        >
          {vehicles.map((vehicle) => (
            <Card key={vehicle._id} className="mb-3 overflow-hidden">
              <View style={styles.listingImagePlaceholder}>
                {vehicle.images && vehicle.images.length > 0 ? (
                  <Image source={{ uri: vehicle.images[0] }} style={styles.listingImage} contentFit="cover" />
                ) : (
                  <Ionicons name="car-outline" size={48} color="#9CA3AF" />
                )}
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(vehicle.status) + "20" },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(vehicle.status) },
                    ]}
                  >
                    {vehicle.status}
                  </Text>
                </View>
                {vehicle.instantBook && (
                  <View style={styles.instantBookBadge}>
                    <Ionicons name="flash" size={12} color="#FFFFFF" />
                    <Text style={styles.instantBookText}>Instant Book</Text>
                  </View>
                )}
              </View>

              <View style={styles.listingInfo}>
                <Text style={styles.listingTitle} numberOfLines={1}>
                  {vehicle.title}
                </Text>
                <Text style={styles.listingSubtitle} numberOfLines={1}>
                  {vehicle.make} {vehicle.model} · {vehicle.year}
                </Text>
                <Text style={styles.listingPrice}>
                  GHS {vehicle.pricePerDay}/day
                  {vehicle.pricePerWeek ? ` · GHS ${vehicle.pricePerWeek}/wk` : ""}
                </Text>
                <Text style={styles.listingLocation} numberOfLines={1}>
                  {vehicle.city}, {vehicle.region}
                </Text>

                <View style={styles.listingActions}>
                  {vehicle.status === "draft" && (
                    <Button size="sm" className="bg-navy" onPress={() => handlePublishDraft(vehicle._id)}>
                      <Ionicons name="rocket-outline" size={16} color="#FFFFFF" />
                      <Text style={styles.publishActionButtonText}>Publish</Text>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onPress={() => handleEditPress(vehicle._id)}>
                    <Ionicons name="pencil-outline" size={16} color={NAVY} />
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </Button>
                  <Button variant="outline" size="sm" onPress={() => handleOpenSettings(vehicle._id)}>
                    <Ionicons name="settings-outline" size={16} color={NAVY} />
                    <Text style={styles.actionButtonText}>Settings</Text>
                  </Button>
                  <Button variant="outline" size="sm" onPress={() => handleOpenCalendar(vehicle._id)}>
                    <Ionicons name="calendar-outline" size={16} color={NAVY} />
                    <Text style={styles.actionButtonText}>Calendar</Text>
                  </Button>
                  <Button variant="outline" size="sm" onPress={() => handleToggleStatus(vehicle._id, vehicle.status)}>
                    <Ionicons
                      name={vehicle.status === "active" ? "pause-outline" : "play-outline"}
                      size={16}
                      color={NAVY}
                    />
                    <Text style={styles.actionButtonText}>
                      {vehicle.status === "active" ? "Pause" : "Activate"}
                    </Text>
                  </Button>
                  <Button variant="outline" size="sm" onPress={() => handleDelete(vehicle._id)}>
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    <Text style={[styles.actionButtonText, { color: "#EF4444" }]}>
                      Delete
                    </Text>
                  </Button>
                </View>
              </View>
            </Card>
          ))}
        </ScrollView>
      )}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 0,
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexShrink: 1,
  },
  searchExpandWrap: {
    overflow: "hidden",
    height: 44,
    justifyContent: "center",
    flex: 1,
    marginRight: 12,
  },
  searchInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    height: 44,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: NAVY,
    paddingVertical: 0,
    textAlign: "left",
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  illustrationWrap: {
    marginBottom: 24,
  },
  emptyImage: {
    width: 180,
    height: 180,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: NAVY,
    marginBottom: 12,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  ctaButton: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  ctaButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
  },
  listingsList: {
    gap: 16,
  },
  emptyStateNoScroll: {
    flex: 1,
  },
  listingImagePlaceholder: {
    width: "100%",
    height: 140,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  listingImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholderText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 16,
  },
  listingInfo: {
    padding: 16,
    gap: 6,
  },
  listingTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  listingSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  listingPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
    marginTop: 4,
  },
  listingLocation: {
    fontSize: 13,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  instantBookBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: NAVY,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  instantBookText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  listingActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    flexWrap: "wrap",
  },
  actionButton: {
    fontSize: 13,
    fontWeight: "600",
    color: NAVY,
  },
  publishActionButtonText: {
    color: "#FFFFFF",
  },
});
