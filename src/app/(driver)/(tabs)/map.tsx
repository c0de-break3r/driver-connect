<<<<<<< HEAD
import { Image } from "expo-image";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Animated,
  PanResponder,
=======
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  Platform,
>>>>>>> 33eb3cd (updates)
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
<<<<<<< HEAD
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  impactAsync,
  notificationAsync,
  ImpactFeedbackStyle,
  NotificationFeedbackType,
} from "expo-haptics";
=======
>>>>>>> 33eb3cd (updates)
import * as Location from "expo-location";
import { router, useFocusEffect } from "expo-router";
import { useDriverMapStore } from "@/store/useDriverMapStore";
import { useDriverOnboardingStore } from "@/store/useDriverOnboardingStore";
import { MUTED_MAP_STYLE } from "@/lib/mapStyle";
<<<<<<< HEAD
import { useStaggeredEntrance } from "@/hooks/useStaggeredEntrance";
import GooglePlacesModule, {
  GooglePlaceData,
  GooglePlaceDetail,
} from "react-native-google-places-autocomplete";

const PlacesAutocomplete = GooglePlacesModule.GooglePlacesAutocomplete;
=======
>>>>>>> 33eb3cd (updates)

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
const PEACH = "#FFF8F3";
const WHITE = "#FFFFFF";

type NearbyDriver = LatLng & { id: string };

function generateNearbyDrivers(center: LatLng, count = 6): NearbyDriver[] {
  const drivers: NearbyDriver[] = [];
  for (let i = 0; i < count; i++) {
    drivers.push({
      id: `nearby-${i}`,
      latitude: center.latitude + (i * 0.001) - 0.003,
      longitude: center.longitude + (i * 0.001) - 0.003,
    });
  }
  return drivers;
}

function deterministicOffset(seed: string, index: number) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash = hash & hash;
  }
  const t = ((hash + index) * 0.618033988749895) % 1;
  return t * 0.08 - 0.04;
}

const PLACE_COLORS = ["#EC4899", "#F97316", "#8B5CF6", "#10B981", "#EF4444", "#3B82F6"];

const COLLAPSED_HEIGHT = 100;
const SHEET_BOTTOM = Platform.select({ ios: 82, android: 68 }) as number;
const FULLSCREEN_HEIGHT = Dimensions.get("window").height - SHEET_BOTTOM;

const SNAP_POINTS = [COLLAPSED_HEIGHT, FULLSCREEN_HEIGHT] as const;

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const { driverLocation, setDriverLocation } = useDriverMapStore();
  const [nearbyDrivers, setNearbyDrivers] = useState<NearbyDriver[]>([]);
<<<<<<< HEAD
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
=======
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupSuggestions, setPickupSuggestions] = useState<{ place_id: string; description: string }[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<{ place_id: string; description: string }[]>([]);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
  const sheetHeight = useMemo(() => new Animated.Value(COLLAPSED_HEIGHT), []);
  const currentSnapIndex = useRef(0);
  const currentHeightRef = useRef(COLLAPSED_HEIGHT);
  const isDragging = useRef(false);
  const [panHandler, setPanHandler] = useState<ReturnType<typeof PanResponder.create> | null>(null);
  const routeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    sheetHeight.setValue(COLLAPSED_HEIGHT);
    currentHeightRef.current = COLLAPSED_HEIGHT;
  }, [sheetHeight]);

  const snapToIndex = useCallback((index: number, animated = true) => {
    const clampedIndex = Math.max(0, Math.min(SNAP_POINTS.length - 1, index));
    currentSnapIndex.current = clampedIndex;
    if (animated) {
      Animated.spring(sheetHeight, {
        toValue: SNAP_POINTS[clampedIndex],
        useNativeDriver: false,
        tension: 100,
        friction: 9,
      }).start();
    } else {
      sheetHeight.setValue(SNAP_POINTS[clampedIndex]);
    }
    currentHeightRef.current = SNAP_POINTS[clampedIndex];
  }, [sheetHeight]);

  const fetchRoute = async (origin: string, destination: string) => {
    try {
      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === "OK" && data.routes?.length > 0) {
        const leg = data.routes[0].legs[0];
        setRouteInfo({
          distance: leg.distance?.text ?? "",
          duration: leg.duration?.text ?? "",
        });
      } else {
        setRouteInfo(null);
      }
    } catch {
      setRouteInfo(null);
    }
  };

  const searchPlaces = async (query: string, signal: AbortSignal, onResults: (items: { place_id: string; description: string }[]) => void) => {
    if (!query.trim()) {
      onResults([]);
      return;
    }
    try {
      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${apiKey}&components=country:gh`;
      const response = await fetch(url, { signal });
      const data = await response.json();
      if (data.status === "OK" && data.predictions) {
        onResults(
          data.predictions.map((item: { place_id: string; description: string }) => ({
            place_id: item.place_id,
            description: item.description,
          }))
        );
      } else {
        onResults([]);
      }
    } catch {
      onResults([]);
    }
  };

  const [isRouteSheetOpen, setIsRouteSheetOpen] = useState(false);

  const openRouteSearch = useCallback(() => {
    snapToIndex(1, true);
    setIsRouteSheetOpen(true);
  }, [snapToIndex]);

  const closeRouteSearch = useCallback(() => {
    snapToIndex(0, true);
    setIsRouteSheetOpen(false);
  }, [snapToIndex]);

  useEffect(() => {
    if (!pickup || !dropoff) return;
    if (routeTimer.current) {
      clearTimeout(routeTimer.current);
    }
    routeTimer.current = setTimeout(() => {
      fetchRoute(pickup, dropoff);
    }, 600);
    return () => {
      if (routeTimer.current) {
        clearTimeout(routeTimer.current);
      }
    };
  }, [pickup, dropoff]);

  useEffect(() => {
    if (!isRouteSheetOpen) return;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.status === "OK" && data.results?.length > 0) {
          setPickup(data.results[0].formatted_address);
        }
        setTimeout(() => {
          // focus is handled by GooglePlacesAutocomplete
        }, 350);
      } catch {
        // keep pickup empty if geocoding fails
      }
    })();
  }, [isRouteSheetOpen]);

  useEffect(() => {
    const handler = PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderGrant: () => {
        isDragging.current = true;
        sheetHeight.stopAnimation();
      },
      onPanResponderMove: (_, gesture) => {
        const currentHeight = currentHeightRef.current;
        const newHeight = currentHeight - gesture.dy;
        const clampedHeight = Math.max(SNAP_POINTS[0], Math.min(SNAP_POINTS[SNAP_POINTS.length - 1], newHeight));
        sheetHeight.setValue(clampedHeight);
        currentHeightRef.current = clampedHeight;
      },
      onPanResponderRelease: (_, gesture) => {
        isDragging.current = false;
        const currentHeight = currentHeightRef.current;
        const velocity = gesture.vy;
        
        let targetIndex = currentSnapIndex.current;
        
        if (Math.abs(velocity) > 0.5) {
          if (velocity < 0) {
            targetIndex = Math.min(SNAP_POINTS.length - 1, currentSnapIndex.current + 1);
          } else {
            targetIndex = Math.max(0, currentSnapIndex.current - 1);
          }
        } else {
          const distances = SNAP_POINTS.map(point => Math.abs(currentHeight - point));
          targetIndex = distances.indexOf(Math.min(...distances));
        }
        
        snapToIndex(targetIndex);
      },
    });
    setPanHandler(handler);
  }, [sheetHeight, snapToIndex]);
>>>>>>> 33eb3cd (updates)

  const { selfieUri } = useDriverOnboardingStore();

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        const next: LatLng = { latitude, longitude };
        setDriverLocation(next);
        setNearbyDrivers(generateNearbyDrivers(next));

        try {
          const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
          const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
          const response = await fetch(url);
          const data = await response.json();
          if (data.status === "OK" && data.results?.length > 0) {
            setPickup(data.results[0].formatted_address);
          }
        } catch {
          // keep pickup empty if geocoding fails
        }

        mapRef.current?.animateCamera(
          {
            center: { latitude, longitude },
            zoom: 14,
          },
          { duration: 800 }
        );
      } catch {
        // location access failed; keep defaults
      }
    })();
  }, [setDriverLocation]);

  const centerOnMe = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const next: LatLng = { latitude, longitude };
      setDriverLocation(next);
      setNearbyDrivers(generateNearbyDrivers(next));

      mapRef.current?.animateCamera(
        {
          center: { latitude, longitude },
          zoom: 14,
        },
        { duration: 800 }
      );
<<<<<<< HEAD
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
=======
    } catch {
      // location action failed
    }
  };

  const places = useMemo(() => {
    const items = [];
    for (let i = 0; i < 8; i++) {
      items.push({
        id: `place-${i}`,
        latitude: ACCRA_LAT + deterministicOffset(`place-${i}`, 0),
        longitude: ACCRA_LNG + deterministicOffset(`place-${i}`, 1),
        color: PLACE_COLORS[i % PLACE_COLORS.length],
      });
    }
    return items;
  }, []);

  const recentRoutes = [
    { id: "r1", label: "Agbogba Ashongman Road", distance: "", time: "Ga", icon: "time-outline" },
    { id: "r2", label: "Barbers Eazy Connect", distance: "<1 km", time: "Mabey Street, Haatso, Ghana", icon: "time-outline" },
    { id: "r3", label: "Madina Zongo Junction", distance: "3.2 km", time: "Ga", icon: "train-outline" },
    { id: "r4", label: "Accra Mall", distance: "7.2 km", time: "Spintex Road, Accra", icon: "bag-outline" },
    { id: "r5", label: "Ashaley Botwe School", distance: "8.6 km", time: "Tema", icon: "business-outline" },
    { id: "r6", label: "Labadi Beach", distance: "14.6 km", time: "Accra", icon: "bus-outline" },
    { id: "r7", label: "Terminal 3 Accra Kotoka Airport", distance: "9.3 km", time: "Accra", icon: "airplane-outline" },
    { id: "r8", label: "Kasoa Station", distance: "14.5 km", time: "Accra", icon: "train-outline" },
  ];
>>>>>>> 33eb3cd (updates)

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PEACH }} edges={["top"]}>
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          customMapStyle={MUTED_MAP_STYLE as any}
          initialRegion={{
            ...INITIAL_REGION,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={false}
          showsScale={false}
          toolbarEnabled={false}
        >
          {places.map((place, index) => (
            <Marker
              key={place.id}
              identifier={place.id}
              coordinate={{
                latitude: place.latitude,
                longitude: place.longitude,
              }}
            >
              <View style={[styles.placeMarker, { backgroundColor: place.color }]}>
                <Ionicons
                  name={index % 3 === 0 ? "car" : index % 3 === 1 ? "people" : "location"}
                  size={16}
                  color="#FFFFFF"
                />
              </View>
            </Marker>
          ))}

          {driverLocation && (
            <Marker
              identifier="driver"
              coordinate={{
                latitude: driverLocation.latitude,
                longitude: driverLocation.longitude,
              }}
            >
              <View style={styles.driverMarker}>
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
        </MapView>

<<<<<<< HEAD
        {/* Top row: profile + search bar */}
=======
>>>>>>> 33eb3cd (updates)
        <Animated.View
          {...(panHandler?.panHandlers || {})}
          style={[
<<<<<<< HEAD
            styles.topRow,
=======
            styles.bottomSheet,
>>>>>>> 33eb3cd (updates)
            {
              height: sheetHeight.interpolate({
                inputRange: [COLLAPSED_HEIGHT, FULLSCREEN_HEIGHT],
                outputRange: [COLLAPSED_HEIGHT, FULLSCREEN_HEIGHT],
                extrapolate: "clamp",
              }),
              paddingTop: sheetHeight.interpolate({
                inputRange: [COLLAPSED_HEIGHT, FULLSCREEN_HEIGHT],
                outputRange: [0, 0],
                extrapolate: "clamp",
              }),
            },
          ]}
        >
<<<<<<< HEAD
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
=======
          <Animated.View
            style={[
              styles.handleRow,
              {
                opacity: sheetHeight.interpolate({
                  inputRange: [COLLAPSED_HEIGHT, FULLSCREEN_HEIGHT],
                  outputRange: [1, 0],
                  extrapolate: "clamp",
                }),
              },
            ]}
          >
            <View style={styles.handle} />
          </Animated.View>

          <Animated.View
            style={[
              styles.collapsedContent,
              {
                opacity: sheetHeight.interpolate({
                  inputRange: [COLLAPSED_HEIGHT, FULLSCREEN_HEIGHT],
                  outputRange: [1, 0],
                  extrapolate: "clamp",
                }),
              },
            ]}
          >
            <View style={styles.searchRow}>
              <Pressable style={styles.combinedSearchButton}>
                <Pressable style={styles.searchTrigger} onPress={openRouteSearch} hitSlop={8}>
                  <Ionicons name="search" size={20} color={NAVY} style={styles.searchIcon} />
                  <Text style={styles.searchPlaceholder}>Where to?</Text>
                </Pressable>
                <View style={styles.verticalDivider} />
                <Pressable style={styles.laterButtonInner} hitSlop={8}>
                  <Ionicons name="calendar-outline" size={18} color={NAVY} />
                  <Text style={styles.laterText}>Later</Text>
                </Pressable>
              </Pressable>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.routeSearchContainer,
              {
                opacity: sheetHeight.interpolate({
                  inputRange: [COLLAPSED_HEIGHT, FULLSCREEN_HEIGHT],
                  outputRange: [0, 1],
                  extrapolate: "clamp",
                }),
              },
            ]}
          >
            <View style={styles.routeHeader}>
              <Pressable style={styles.closeCircleButton} onPress={closeRouteSearch} hitSlop={8}>
                <Ionicons name="close" size={22} color={NAVY} />
              </Pressable>
              <Text style={styles.routeTitle}>Route</Text>
              <View style={styles.routeHeaderRight} />
            </View>

            <View style={[styles.routeInputRow, styles.routeInputRowActive]}>
              <Ionicons name="location" size={18} color={NAVY} style={styles.routeSearchIcon} />
              <View style={styles.autocompleteWrap}>
                <TextInput
                  style={styles.routeInput}
                  placeholder="Pickup location"
                  placeholderTextColor="#6E7E91"
                  value={pickup}
                  onChangeText={(text) => {
                    setPickup(text);
                    searchPlaces(text, new AbortController().signal, setPickupSuggestions);
                  }}
                />
                {pickupSuggestions.length > 0 && (
                  <ScrollView style={styles.placeList} nestedScrollEnabled keyboardShouldPersistTaps="always">
                    {pickupSuggestions.map((item) => (
                      <Pressable
                        key={item.place_id}
                        style={styles.placeRow}
                        onPress={() => {
                          setPickup(item.description);
                          setPickupSuggestions([]);
                        }}
                      >
                        <Text style={styles.placeRowText}>{item.description}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                )}
>>>>>>> 33eb3cd (updates)
              </View>
            </View>

            <View style={[styles.routeInputRow, styles.routeInputRowActive]}>
              <Ionicons name="search" size={18} color={NAVY} style={styles.routeSearchIcon} />
              <View style={styles.autocompleteWrap}>
                <TextInput
                  style={styles.routeInput}
                  placeholder="Dropoff location"
                  placeholderTextColor="#6E7E91"
                  value={dropoff}
                  onChangeText={(text) => {
                    setDropoff(text);
                    searchPlaces(text, new AbortController().signal, setDropoffSuggestions);
                  }}
                />
                {dropoffSuggestions.length > 0 && (
                  <ScrollView style={styles.placeList} nestedScrollEnabled keyboardShouldPersistTaps="always">
                    {dropoffSuggestions.map((item) => (
                      <Pressable
                        key={item.place_id}
                        style={styles.placeRow}
                        onPress={() => {
                          setDropoff(item.description);
                          setDropoffSuggestions([]);
                        }}
                      >
                        <Text style={styles.placeRowText}>{item.description}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                )}
              </View>
              <Pressable style={styles.locationIconButton}>
                <Ionicons name="navigate" size={18} color={NAVY} />
              </Pressable>
              <Pressable style={styles.routeSwapButton}>
                <Ionicons name="arrow-up" size={18} color={NAVY} />
              </Pressable>
            </View>

            {routeInfo && (
              <View style={styles.routeInfoRow}>
                <View style={styles.routeInfoItem}>
                  <Ionicons name="navigate" size={18} color={NAVY} />
                  <Text style={styles.routeInfoText}>{routeInfo.distance}</Text>
                </View>
                <View style={styles.routeInfoItem}>
                  <Ionicons name="time" size={18} color={NAVY} />
                  <Text style={styles.routeInfoText}>{routeInfo.duration}</Text>
                </View>
              </View>
            )}

            <ScrollView
              style={styles.routeList}
              showsVerticalScrollIndicator={false}
            >
              {recentRoutes.map((route) => (
                <Pressable
                  key={route.id}
                  style={styles.routeItem}
                  onPress={() => {}}
                >
                  <View style={styles.routeIconWrap}>
                    <Ionicons name={route.icon as any} size={18} color={NAVY} />
                  </View>
                  <View style={styles.routeTextWrap}>
                    <Text style={styles.routeName} numberOfLines={1}>{route.label}</Text>
                    <Text style={styles.routeSub} numberOfLines={1}>{route.time}</Text>
                  </View>
                  {route.distance && <Text style={styles.routeDistance}>{route.distance}</Text>}
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>
        </Animated.View>
<<<<<<< HEAD
        )}
=======

        <Animated.View
          style={[
            styles.locationButton,
            {
              opacity: sheetHeight.interpolate({
                inputRange: [COLLAPSED_HEIGHT, FULLSCREEN_HEIGHT],
                outputRange: [1, 0],
                extrapolate: "clamp",
              }),
            },
          ]}
        >
          <Pressable style={styles.locationButtonInner} onPress={centerOnMe}>
            <Ionicons name="navigate" size={22} color={NAVY} />
          </Pressable>
        </Animated.View>
>>>>>>> 33eb3cd (updates)
      </View>
    </SafeAreaView>
  );
}

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
  placeMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: WHITE,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  driverMarker: {
    alignItems: "center",
    justifyContent: "center",
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
<<<<<<< HEAD
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
=======
  bottomSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: Platform.select({ ios: 82, android: 68 }),
>>>>>>> 33eb3cd (updates)
    backgroundColor: PEACH,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 16,
    gap: 0,
    zIndex: 1000,
  },
  handleRow: {
    alignItems: "center",
    paddingVertical: 0,
    minHeight: 0,
    marginBottom: 2,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D6CFC7",
  },
  collapsedContent: {
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 10,
  },
  searchRow: {
    alignItems: "center",
    justifyContent: "center",
  },
<<<<<<< HEAD
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
=======
  combinedSearchButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
>>>>>>> 33eb3cd (updates)
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EAE1D9",
    alignSelf: "center",
    gap: 10,
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
  searchTrigger: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: NAVY,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  verticalDivider: {
    width: StyleSheet.hairlineWidth,
    height: 24,
    backgroundColor: "#EAE1D9",
  },
  laterButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingLeft: 10,
    paddingRight: 4,
    paddingVertical: 4,
  },
  laterText: {
    fontSize: 14,
    fontWeight: "700",
    color: NAVY,
  },
  routeSearchContainer: {
    flex: 1,
    gap: 16,
  },
  routeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  routeTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: NAVY,
    textAlign: "center",
  },
  routeHeaderRight: {
    width: 24,
  },
  routeInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  routeInputRowActive: {
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#3B82F6",
  },
  routeSearchIcon: {
    marginRight: 10,
  },
  routeInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: NAVY,
  },
  placeList: {
    backgroundColor: WHITE,
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 200,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EAE1D9",
  },
  placeRow: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#EAE1D9",
  },
  placeRowText: {
    fontSize: 15,
    color: NAVY,
  },
  autocompleteWrap: {
    flex: 1,
    position: "relative",
  },
  locationIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EAE1D9",
  },
  routeSwapButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: WHITE,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EAE1D9",
  },
  routeInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#EAE1D9",
  },
  routeInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  routeInfoText: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
  },
  routeList: {
    maxHeight: 240,
    marginTop: 16,
  },
  routeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#EAE1D9",
  },
<<<<<<< HEAD
  controlsRow: {
    position: "absolute",
    right: 16,
    top: 72,
    flexDirection: "column",
    alignItems: "center",
=======
  routeIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EAE1D9",
  },
  routeTextWrap: {
    flex: 1,
    gap: 2,
  },
  routeName: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
  },
  routeSub: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6E7E91",
  },
  routeDistance: {
    fontSize: 13,
    fontWeight: "700",
    color: NAVY,
  },
  adventureContainer: {
    flex: 1,
>>>>>>> 33eb3cd (updates)
    gap: 12,
    zIndex: 30,
  },
  locationButton: {
    position: "absolute",
    right: 16,
    bottom: 240,
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
    zIndex: 1000,
  },
<<<<<<< HEAD
  statusPillWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 220,
=======
  locationButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: WHITE,
>>>>>>> 33eb3cd (updates)
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EAE1D9",
  },
<<<<<<< HEAD
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
=======
  closeCircleButton: {
>>>>>>> 33eb3cd (updates)
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: WHITE,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
<<<<<<< HEAD
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
=======
    borderColor: "rgba(0,0,0,0.5)",
>>>>>>> 33eb3cd (updates)
  },
});
