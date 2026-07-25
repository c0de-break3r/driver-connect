import { Image } from "expo-image";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Animated,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, {
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  impactAsync,
  notificationAsync,
  ImpactFeedbackStyle,
  NotificationFeedbackType,
} from "expo-haptics";
import * as Location from "expo-location";
import { router, useFocusEffect } from "expo-router";
import { useDriverMapStore } from "@/store/useDriverMapStore";
import { useDriverOnboardingStore } from "@/store/useDriverOnboardingStore";
import { MUTED_MAP_STYLE } from "@/lib/mapStyle";
import { useStaggeredEntrance } from "@/hooks/useStaggeredEntrance";
import GooglePlacesModule, {
  GooglePlaceData,
  GooglePlaceDetail,
} from "react-native-google-places-autocomplete";

const PlacesAutocomplete = GooglePlacesModule.GooglePlacesAutocomplete;

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
  const [sheetVisible, setSheetVisible] = useState(true);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const statusPillOpacity = useMemo(() => new Animated.Value(1), []);
  const sheetHeight = useMemo(() => new Animated.Value(SHEET_COLLAPSED_HEIGHT), []);

  useEffect(() => {
    Animated.timing(sheetHeight, {
      toValue: sheetVisible
        ? sheetExpanded
          ? SHEET_EXPANDED_HEIGHT
          : SHEET_COLLAPSED_HEIGHT
        : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [sheetVisible, sheetExpanded, sheetHeight]);

  useEffect(() => {
    Animated.timing(statusPillOpacity, {
      toValue: sheetVisible && !sheetExpanded ? 1 : 0,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [sheetVisible, sheetExpanded, statusPillOpacity]);

  const sheetPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return sheetVisible && gestureState.dy > 0;
        },
        onPanResponderMove: (_, gestureState) => {
          if (!sheetVisible) return;
          const currentBase = sheetExpanded
            ? SHEET_EXPANDED_HEIGHT
            : SHEET_COLLAPSED_HEIGHT;
          const newHeight = Math.max(0, currentBase - gestureState.dy);
          sheetHeight.setValue(newHeight);
        },
        onPanResponderRelease: (_, gestureState) => {
          if (!sheetVisible) return;
          const currentBase = sheetExpanded
            ? SHEET_EXPANDED_HEIGHT
            : SHEET_COLLAPSED_HEIGHT;
          const newHeight = currentBase - gestureState.dy;

          if (newHeight < 80) {
            setSheetVisible(false);
            Animated.timing(sheetHeight, {
              toValue: 0,
              duration: 200,
              useNativeDriver: false,
            }).start();
          } else if (sheetExpanded) {
            if (gestureState.dy > 60) {
              setSheetExpanded(false);
            }
            Animated.timing(sheetHeight, {
              toValue: gestureState.dy > 60
                ? SHEET_COLLAPSED_HEIGHT
                : SHEET_EXPANDED_HEIGHT,
              duration: 200,
              useNativeDriver: false,
            }).start();
          } else {
            Animated.timing(sheetHeight, {
              toValue: SHEET_COLLAPSED_HEIGHT,
              duration: 200,
              useNativeDriver: false,
            }).start();
          }
        },
      }),
    [sheetVisible, sheetExpanded, sheetHeight]
  );

  const {
    driverLocation,
    rideRequests,
    selectedDestination,
    setDriverLocation,
    acceptRideRequest,
    declineRideRequest,
    setSelectedDestination,
  } = useDriverMapStore();

  const { selfieUri } = useDriverOnboardingStore();

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

  useFocusEffect(
    useCallback(() => {
      setIsNavigating(false);
    }, [])
  );

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

        {/* Top row: profile + search bar */}
        <Animated.View
          style={[
            styles.topRow,
            {
              opacity: entrance.headerOpacity,
              transform: [{ translateY: entrance.headerTranslateY }],
            },
          ]}
        >
          <Pressable
            style={styles.profileButton}
            onPress={() => {
              if (isNavigating) return;
              setIsNavigating(true);
              router.push("/(driver)/account");
            }}
          >
            <View style={styles.profileImageWrap}>
              {selfieUri ? (
                <Image
                  source={{ uri: selfieUri }}
                  style={styles.profileImage}
                  contentFit="cover"
                />
              ) : (
                <Ionicons name="person" size={20} color={NAVY} />
              )}
            </View>
          </Pressable>
          <View style={styles.searchBarWrap}>
            <PlacesAutocomplete
              placeholder="Where to?"
              textInputProps={{
                placeholderTextColor: "#6E7E91",
              }}
              onPress={(data: GooglePlaceData, details: GooglePlaceDetail | null) => {
                if (!details?.geometry?.location) return;
                const { lat, lng } = details.geometry.location;
                const next = { latitude: lat, longitude: lng };
                setSelectedDestination(next);
                setRegion(next);
                setNearbyDrivers(generateNearbyDrivers(next));
                mapRef.current?.animateCamera(
                  { center: next, zoom: 14 },
                  { duration: 800 }
                );
              }}
              fetchDetails
              onFail={(error: any) => console.error("Places autocomplete error:", error)}
              query={{
                key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
                language: "en",
                components: "country:gh",
              }}
              styles={{
                container: styles.autocompleteContainer,
                textInputContainer: styles.autocompleteTextInputContainer,
                textInput: styles.autocompleteInput,
                listView: styles.autocompleteList,
                row: styles.autocompleteRow,
                description: styles.autocompleteDescription,
                separator: styles.autocompleteSeparator,
              }}
              enablePoweredByContainer={false}
              nearbyPlacesAPI="GooglePlacesSearch"
            />
          </View>
        </Animated.View>

        {/* Controls row below search bar */}
        <Animated.View
          style={[
            styles.controlsRow,
            {
              opacity: entrance.iconOpacity,
              transform: [{ scale: entrance.iconScale }],
            },
          ]}
        >
          <Pressable style={styles.mapControlButton} onPress={centerOnMe}>
            <Ionicons name="navigate" size={22} color={NAVY} />
          </Pressable>
          <Pressable style={styles.mapControlButton}>
            <MaterialCommunityIcons name="traffic-light" size={22} color={NAVY} />
          </Pressable>
        </Animated.View>

        {/* Status pill above bottom sheet */}
        <Animated.View
          style={[
            styles.statusPillWrap,
            {
              opacity: statusPillOpacity,
            },
          ]}
        >
          <Pressable
            style={styles.statusPill}
            onPress={() => {
              if (sheetVisible) {
                setSheetExpanded((prev) => !prev);
              } else {
                setSheetVisible(true);
                setSheetExpanded(false);
              }
            }}
          >
            <Ionicons name="car" size={18} color={WHITE} />
            <Text style={styles.statusPillText}>
              {rideRequests.length} More request
            </Text>
          </Pressable>
        </Animated.View>

        {/* Floating wifi button when sheet is hidden */}
        {!sheetVisible && (
          <Pressable
            style={styles.wifiFloatingButton}
            onPress={() => {
              setSheetVisible(true);
              setSheetExpanded(false);
            }}
          >
            <Ionicons name="wifi" size={24} color={NAVY} />
          </Pressable>
        )}

        {/* Bottom Sheet */}
        {sheetVisible && (
          <Animated.View
            style={[
              styles.sheetContainer,
              {
                height: sheetHeight,
              },
            ]}
            {...sheetPanResponder.panHandlers}
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
        )}
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
  topRow: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
  profileImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  searchBarWrap: {
    flex: 1,
    zIndex: 20,
  },
  autocompleteContainer: {
    flex: 1,
    zIndex: 20,
  },
  autocompleteTextInputContainer: {
    flex: 1,
    zIndex: 20,
  },
  autocompleteInput: {
    height: 44,
    fontSize: 15,
    fontWeight: "600",
    color: NAVY,
    backgroundColor: WHITE,
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EAE1D9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  autocompleteList: {
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
    zIndex: 20,
    maxHeight: 220,
  },
  autocompleteRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  autocompleteDescription: {
    fontSize: 14,
    color: NAVY,
  },
  autocompleteSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#EAE1D9",
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
  controlsRow: {
    position: "absolute",
    right: 16,
    top: 72,
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    zIndex: 30,
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
  wifiFloatingButton: {
    position: "absolute",
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 20,
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
  bottomSpacer: {
    height: 24,
  },
});
