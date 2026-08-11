import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convexApi";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthProvider";
import { useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
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
import EmptyState from "@/components/EmptyState";

const NAVY = "#2C3E5B";

export type OwnerListingsContentProps = {
  hideHeader?: boolean;
};

function getStatusColor(status: string) {
  switch (status) {
    case "active":
      return "#10B981";
    case "inactive":
      return "#6B7280";
    default:
      return "#F59E0B";
  }
}

export default function OwnerListingsContent({ hideHeader = false }: OwnerListingsContentProps) {
  const router = useRouter();
  const { userId } = useAuth();

  const convexUser = useQuery(
    api.users.getByUserId,
    userId ? { userId } : "skip"
  );

  const vehicles = useQuery(
    api.jobs.getOwnerVehicles,
    convexUser?._id ? { ownerId: convexUser._id } : "skip"
  );

  const deleteVehicle = useMutation(api.jobs.deleteVehicle);
  const toggleStatus = useMutation(api.jobs.toggleVehicleStatus);

  const handleDelete = async (vehicleId: any) => {
    await deleteVehicle({ vehicleId });
  };

  const handleToggleStatus = async (vehicleId: any, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    await toggleStatus({ vehicleId, status: newStatus });
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [searchExpanded, setSearchExpanded] = useState(false);
  const searchWidthAnim = useRef(new Animated.Value(0)).current;
  const searchInputRef = useRef<TextInput>(null);

  const toggleSearch = () => {
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
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchExpanded(false);
    Animated.timing(searchWidthAnim, {
      toValue: 0,
      duration: 240,
      useNativeDriver: false,
    }).start();
  };

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
              }}
            >
              <TouchableOpacity onPress={toggleSearch} hitSlop={8}>
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
            <TouchableOpacity hitSlop={8} style={styles.addButton} onPress={() => router.push("/create-listing" as any)}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!vehicles || vehicles.length === 0 ? (
        <EmptyState
          image={images.teslaCybertruck}
          title="No listings yet"
          subtitle="Create your first vehicle listing to start receiving booking requests."
          ctaText="Create a listing"
          onCtaPress={() => router.push("/create-listing" as any)}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.listingsList}
          showsVerticalScrollIndicator={false}
        >
          {vehicles.map((vehicle) => (
            <View key={vehicle._id} style={styles.listingCard}>
              <View style={styles.listingImagePlaceholder}>
                {vehicle.images && vehicle.images.length > 0 ? (
                  <Text style={styles.imagePlaceholderText}>
                    {vehicle.images.length} photo{vehicle.images.length !== 1 ? "s" : ""}
                  </Text>
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
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() =>
                      router.push({
                        pathname: "/create-listing",
                        params: { vehicleId: vehicle._id },
                      } as any)
                    }
                  >
                    <Ionicons name="pencil-outline" size={16} color={NAVY} />
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleToggleStatus(vehicle._id, vehicle.status)}
                  >
                    <Ionicons
                      name={vehicle.status === "active" ? "pause-outline" : "play-outline"}
                      size={16}
                      color={NAVY}
                    />
                    <Text style={styles.actionButtonText}>
                      {vehicle.status === "active" ? "Pause" : "Activate"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDelete(vehicle._id)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    <Text style={[styles.actionButtonText, { color: "#EF4444" }]}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
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
  },
  searchExpandWrap: {
    overflow: "hidden",
    height: 40,
    justifyContent: "center",
  },
  searchInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F8F8F8",
    borderRadius: 20,
    paddingLeft: 8,
    paddingRight: 14,
    paddingVertical: 10,
    height: 40,
    borderWidth: 2,
    borderColor: NAVY,
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
  addButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: NAVY,
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
  listingCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  listingImagePlaceholder: {
    width: "100%",
    height: 180,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
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
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: NAVY,
  },
});
