import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, {
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import {
  impactAsync,
  notificationAsync,
  ImpactFeedbackStyle,
  NotificationFeedbackType,
} from "expo-haptics";
import * as Location from "expo-location";
import { useDriverMapStore } from "@/store/useDriverMapStore";
import { MUTED_MAP_STYLE } from "@/lib/mapStyle";
import { useStaggeredEntrance } from "@/hooks/useStaggeredEntrance";

const ACCRA_LAT = 5.6037;
const ACCRA_LNG = -0.187;

type LatLng = {
  latitude: number;
  longitude: number;
};

const INITIAL_REGION: LatLng = {
  latitude: ACCRA_LAT,
  longitude: ACCRA_LNG,
};

const NAVY = "#2C3E5B";
const ORANGE = "#FF7B54";
const PEACH = "#FFF8F3";
const WHITE = "#FFFFFF";

type NearbyDriver = LatLng & { id: string };

function generateNearbyDrivers(center: LatLng, count = 6): NearbyDriver[] {
  const drivers: NearbyDriver[] = [];
  for (let i = 0; i < count; i++) {
    drivers.push({
      id: `nearby-${i}`,
      latitude: center.latitude + (Math.random() - 0.5) * 0.02,
      longitude: center.longitude + (Math.random() - 0.5) * 0.02,
    });
  }
  return drivers;
}

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const entrance = useStaggeredEntrance();
  const [region, setRegion] = useState<LatLng>(INITIAL_REGION);
  const [nearbyDrivers, setNearbyDrivers] = useState<NearbyDriver[]>([]);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const sheetHeight = useMemo(() => new Animated.Value(200), []);

  useEffect(() => {
    Animated.timing(sheetHeight, {
      toValue: sheetExpanded ? SHEET_EXPANDED_HEIGHT : SHEET_COLLAPSED_HEIGHT,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [sheetExpanded, sheetHeight]);

  const {
    driverLocation,
    isOnline,
    rideRequests,
    selectedDestination,
    setDriverLocation,
    toggleOnline,
    acceptRideRequest,
    declineRideRequest,
    setSelectedDestination,
  } = useDriverMapStore();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const next: LatLng = { latitude, longitude };
      setDriverLocation(next);
      setRegion(next);
      setNearbyDrivers(generateNearbyDrivers(next));

      mapRef.current?.animateCamera(
        {
          center: { latitude, longitude },
          zoom: 14,
        },
        { duration: 800 }
      );
    })();
  }, [setDriverLocation]);

  const centerOnMe = async () => {
    await impactAsync(ImpactFeedbackStyle.Light);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;
    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;
    const next: LatLng = { latitude, longitude };
    setRegion(next);
    setDriverLocation(next);
    setNearbyDrivers(generateNearbyDrivers(next));

    mapRef.current?.animateCamera(
      {
        center: { latitude, longitude },
        zoom: 14,
      },
      { duration: 800 }
    );
  };

  const handleToggleOnline = async () => {
    await impactAsync(ImpactFeedbackStyle.Medium);
    toggleOnline();
  };

  const handleAccept = async (id: string) => {
    await notificationAsync(NotificationFeedbackType.Success);
    acceptRideRequest(id);
  };

  const handleDecline = async (id: string) => {
    await notificationAsync(NotificationFeedbackType.Error);
    declineRideRequest(id);
  };

  const routeCoordinates =
    driverLocation && selectedDestination
      ? [driverLocation, selectedDestination]
      : [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PEACH }} edges={["top"]}>
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          customMapStyle={MUTED_MAP_STYLE as any}
          initialRegion={{
            ...region,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={false}
          showsScale={false}
          toolbarEnabled={false}
        >
          {driverLocation && (
            <Marker
              identifier="driver"
              // @ts-ignore - react-native-maps coordinate prop type mismatch
              coordinate={{
                latitude: driverLocation.latitude,
                longitude: driverLocation.longitude,
              }}
            >
              <View style={styles.driverMarker}>
                <View style={styles.driverMarkerPulse} />
                <View style={styles.driverMarkerInner}>
                  <Ionicons name="car" size={18} color={WHITE} />
                </View>
              </View>
            </Marker>
          )}

          {nearbyDrivers.map((driver) => (
            <Marker
              key={driver.id}
              identifier={driver.id}
              // @ts-ignore - react-native-maps coordinate prop type mismatch
              coordinate={{
                latitude: driver.latitude,
                longitude: driver.longitude,
              }}
            >
              <View style={styles.nearbyDriverMarker}>
                <View style={styles.nearbyDriverInner}>
                  <Ionicons name="car-sport" size={14} color={WHITE} />
                </View>
              </View>
            </Marker>
          ))}

          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor={ORANGE}
              strokeWidth={4}
              lineCap="round"
              lineJoin="round"
            />
          )}
        </MapView>

        {/* Top-left profile avatar */}
        <Animated.View
          style={[
            styles.topLeftControls,
            {
              opacity: entrance.headerOpacity,
              transform: [{ translateY: entrance.headerTranslateY }],
            },
          ]}
        >
          <Pressable style={styles.profileButton}>
            <View style={styles.profileImageWrap}>
              <Ionicons name="person" size={20} color={NAVY} />
            </View>
          </Pressable>
        </Animated.View>

        {/* Search bar */}
        <Animated.View
          style={[
            styles.searchBarWrap,
            {
              opacity: entrance.formOpacity,
              transform: [
                {
                  translateY: entrance.formTranslateY.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.searchBarContainer}>
            <Ionicons name="search" size={20} color={NAVY} style={styles.searchIcon} />
            <TextInput
              style={styles.searchBarInput}
              placeholder="Where to?"
              placeholderTextColor="#6E7E91"
              returnKeyType="search"
              onSubmitEditing={(e) => {
                const text = e.nativeEvent.text.trim();
                if (!text) return;
                setSelectedDestination({
                  latitude: driverLocation?.latitude ?? ACCRA_LAT + (Math.random() - 0.5) * 0.1,
                  longitude: driverLocation?.longitude ?? ACCRA_LNG + (Math.random() - 0.5) * 0.1,
                });
                mapRef.current?.animateCamera(
                  {
                    center: {
                      latitude: driverLocation?.latitude ?? ACCRA_LAT,
                      longitude: driverLocation?.longitude ?? ACCRA_LNG,
                    },
                    zoom: 14,
                  },
                  { duration: 800 }
                );
              }}
            />
          </View>
        </Animated.View>

        {/* Floating map controls */}
        <Animated.View
          style={[
            styles.mapControls,
            {
              opacity: entrance.iconOpacity,
              transform: [{ scale: entrance.iconScale }],
            },
          ]}
        >
          <Pressable style={styles.mapControlButton} onPress={centerOnMe}>
            <Ionicons name="navigate" size={22} color={NAVY} />
          </Pressable>
          <Pressable
            style={[styles.mapControlButton, styles.mapControlButtonMargin]}
          >
            <Ionicons name="map-outline" size={22} color={NAVY} />
          </Pressable>
        </Animated.View>

        {/* Status pill above bottom sheet */}
        <Animated.View
          style={[
            styles.statusPillWrap,
            {
              opacity: entrance.formOpacity,
              transform: [
                {
                  translateY: entrance.formTranslateY.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Pressable
            style={styles.statusPill}
            onPress={() => setSheetExpanded((prev) => !prev)}
          >
            <Ionicons name="car" size={18} color={WHITE} />
            <Text style={styles.statusPillText}>
              {rideRequests.length} More request
            </Text>
          </Pressable>
        </Animated.View>

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            styles.sheetContainer,
            {
              height: sheetHeight,
            },
          ]}
        >
          <ScrollView
            contentContainerStyle={styles.sheetScrollContent}
          >
            <View style={styles.sheetHeader}>
              <View style={styles.wifiIconWrap}>
                <Ionicons name="wifi" size={32} color={NAVY} />
              </View>
              <Text style={styles.sheetTitle}>Stay Online</Text>
              <Text style={styles.sheetSubtitle}>
                Customer Are Surrounding You!
              </Text>
            </View>

            <View style={styles.sheetActionsRow}>
              <Pressable style={styles.sheetActionItem}>
                <View style={styles.sheetActionIconWrap}>
                  <Ionicons name="refresh" size={22} color="#2E7DE0" />
                </View>
                <Text style={styles.sheetActionLabel}>Refresh</Text>
              </Pressable>
              <Pressable style={styles.sheetActionItem}>
                <View style={styles.sheetActionIconWrap}>
                  <Ionicons name="time" size={22} color={NAVY} />
                </View>
                <Text style={styles.sheetActionLabel}>Leader Board</Text>
              </Pressable>
              <Pressable style={styles.sheetActionItem}>
                <View style={styles.sheetActionIconWrap}>
                  <Ionicons name="car-sport" size={22} color={ORANGE} />
                </View>
                <Text style={styles.sheetActionLabel}>Trip Request</Text>
              </Pressable>
            </View>

            {rideRequests.length > 0 && (
              <View style={styles.rideRequestsList}>
                <Text style={styles.rideRequestsTitle}>Ride Requests</Text>
                {rideRequests.map((request) => (
                  <View key={request.id} style={styles.rideRequestCard}>
                    <View style={styles.routeRow}>
                      <View style={styles.routeDotStart} />
                      <View style={styles.routeLine} />
                      <View style={styles.routeDotEnd} />
                      <View style={styles.routeTexts}>
                        <Text style={styles.routeLabel}>Pickup</Text>
                        <Text style={styles.routeValue} numberOfLines={1}>
                          {request.pickup}
                        </Text>
                        <Text style={[styles.routeLabel, styles.routeLabelTop]}>
                          Drop-off
                        </Text>
                        <Text style={styles.routeValue} numberOfLines={1}>
                          {request.dropoff}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.sheetDivider} />

                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <Ionicons
                          name="cash-outline"
                          size={16}
                          color={NAVY}
                        />
                        <Text style={styles.metaText}>{request.price}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons
                          name="time-outline"
                          size={16}
                          color={NAVY}
                        />
                        <Text style={styles.metaText}>{request.duration}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons
                          name="people-outline"
                          size={16}
                          color={NAVY}
                        />
                        <Text style={styles.metaText}>{request.passengers}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons
                          name="cube-outline"
                          size={16}
                          color={NAVY}
                        />
                        <Text style={styles.metaText}>{request.distance}</Text>
                      </View>
                    </View>

                    <View style={styles.requestActions}>
                      <Pressable
                        style={styles.declineButton}
                        onPress={() => handleDecline(request.id)}
                      >
                        <Text style={styles.declineButtonText}>Decline</Text>
                      </Pressable>
                      <Pressable
                        style={styles.acceptButton}
                        onPress={() => handleAccept(request.id)}
                      >
                        <Text style={styles.acceptButtonText}>Accept</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </Animated.View>

        {/* Go Online / Offline Button */}
        <Animated.View
          style={[
            styles.onlineButtonWrap,
            {
              opacity: entrance.formOpacity,
              transform: [
                {
                  translateY: entrance.formTranslateY.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Pressable
            style={[styles.onlineButton, isOnline && styles.onlineButtonActive]}
            onPress={handleToggleOnline}
          >
            <Ionicons
              name={isOnline ? "arrow-up" : "power"}
              size={22}
              color={WHITE}
            />
            <Text style={styles.onlineButtonText}>
              {isOnline ? "GOING ONLINE" : "GO ONLINE"}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const SHEET_COLLAPSED_HEIGHT = 200;
const SHEET_EXPANDED_HEIGHT = 400;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PEACH,
    position: "relative",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  driverMarker: {
    alignItems: "center",
    justifyContent: "center",
  },
  driverMarkerPulse: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(46, 125, 224, 0.15)",
  },
  driverMarkerInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2E7DE0",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: WHITE,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  nearbyDriverMarker: {
    alignItems: "center",
    justifyContent: "center",
  },
  nearbyDriverInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: NAVY,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: WHITE,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  topLeftControls: {
    position: "absolute",
    top: 16,
    left: 20,
    zIndex: 10,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: WHITE,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EAE1D9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  profileImageWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PEACH,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  searchBarWrap: {
    position: "absolute",
    top: 16,
    left: 76,
    right: 16,
    zIndex: 10,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: WHITE,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 44,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EAE1D9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchBarInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
    fontWeight: "600",
    color: NAVY,
  },
  searchBarList: {
    backgroundColor: WHITE,
    borderRadius: 14,
    marginTop: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EAE1D9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  searchBarRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#EAE1D9",
  },
  mapControls: {
    position: "absolute",
    right: 16,
    top: 16,
    zIndex: 10,
    gap: 12,
  },
  mapControlButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: WHITE,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EAE1D9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  mapControlButtonMargin: {
    marginTop: 12,
  },
  statusPillWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 220,
    alignItems: "center",
    zIndex: 20,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: NAVY,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  statusPillText: {
    fontSize: 14,
    fontWeight: "700",
    color: WHITE,
    letterSpacing: 0.4,
  },
  sheetBackground: {
    backgroundColor: PEACH,
  },
  sheetIndicator: {
    backgroundColor: "#D6CFC7",
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  sheetContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: PEACH,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 10,
    overflow: "hidden",
  },
  sheetScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 20,
  },
  sheetHeader: {
    alignItems: "center",
    gap: 8,
  },
  wifiIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: WHITE,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EAE1D9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: NAVY,
    textAlign: "center",
  },
  sheetSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 20,
  },
  sheetActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    gap: 12,
  },
  sheetActionItem: {
    alignItems: "center",
    gap: 8,
  },
  sheetActionIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: WHITE,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EAE1D9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sheetActionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: NAVY,
    textAlign: "center",
  },
  rideRequestsList: {
    gap: 12,
  },
  rideRequestsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: NAVY,
    marginBottom: 4,
  },
  rideRequestCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 16,
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EAE1D9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  routeDotStart: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#10B981",
    marginTop: 4,
  },
  routeLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#D6CFC7",
    marginTop: 6,
  },
  routeDotEnd: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: ORANGE,
    marginTop: 4,
  },
  routeTexts: {
    flex: 1,
    gap: 2,
  },
  routeLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6E7E91",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  routeLabelTop: {
    marginTop: 8,
  },
  routeValue: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
  },
  sheetDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#EAE1D9",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  metaItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F5ECE5",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EAE1D9",
  },
  metaText: {
    fontSize: 13,
    fontWeight: "700",
    color: NAVY,
  },
  requestActions: {
    flexDirection: "row",
    gap: 12,
  },
  declineButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EAE1D9",
  },
  declineButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ORANGE,
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  acceptButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: WHITE,
    letterSpacing: 0.2,
  },
  onlineButtonWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 32,
    alignItems: "center",
    zIndex: 10,
  },
  onlineButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#2E7DE0",
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 999,
    shadowColor: "#2E7DE0",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  onlineButtonActive: {
    backgroundColor: ORANGE,
    shadowColor: ORANGE,
  },
  onlineButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: WHITE,
    letterSpacing: 0.6,
  },
  bottomSpacer: {
    height: 24,
  },
});
