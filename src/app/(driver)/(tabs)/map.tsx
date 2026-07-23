import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import {
  impactAsync,
  notificationAsync,
  ImpactFeedbackStyle,
  NotificationFeedbackType,
} from "expo-haptics";
import {
  Camera,
  type CameraRef,
  Map,
  Marker,
  GeoJSONSource,
  Layer,
} from "@maplibre/maplibre-react-native";
import { MapLibreMap, Marker as WebMarker, GeoJSONSource as WebGeoJSONSource } from "maplibre-gl";

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

const MAP_STYLE = {
  version: 8 as 8,
  sources: {
    osm: {
      type: "raster" as const,
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [
    {
      id: "osm",
      type: "raster" as const,
      source: "osm",
    },
  ],
};

const NAVY = "#2C3E5B";
const ORANGE = "#FF7B54";
const PEACH = "#FFF8F3";

const isWeb = Platform.OS === "web";

function createDriverMarkerElement() {
  const el = document.createElement("div");
  el.style.cssText =
    "width:40px;height:40px;background:#2E7DE0;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.2);position:relative;";
  el.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>`;

  const pulse = document.createElement("div");
  pulse.style.cssText =
    "position:absolute;width:56px;height:56px;border-radius:50%;background:rgba(46,125,224,0.15);top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;";

  const wrapper = document.createElement("div");
  wrapper.style.cssText =
    "position:relative;display:inline-flex;align-items:center;justify-content:center;";
  wrapper.appendChild(pulse);
  wrapper.appendChild(el);

  return wrapper;
}

type WebMapProps = {
  driverLocation: LatLng;
  showRideRequest: boolean;
};

function WebMap({ driverLocation, showRideRequest }: WebMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<WebMarker | null>(null);
  const sourceId = "route-source";
  const layerId = "route-layer";

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = new MapLibreMap({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [driverLocation.longitude, driverLocation.latitude],
      zoom: 14,
    });
    mapRef.current = map;

    map.on("load", () => {
      map.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [
              [driverLocation.longitude, driverLocation.latitude],
              [driverLocation.longitude + 0.015, driverLocation.latitude + 0.012],
            ],
          },
        },
      });

      map.addLayer({
        id: layerId,
        type: "line",
        source: sourceId,
        paint: {
          "line-color": ORANGE,
          "line-width": 4,
          "line-opacity": 0.9,
        },
      });

      map.setLayoutProperty(layerId, "visibility", showRideRequest ? "visible" : "none");

      const markerElement = createDriverMarkerElement();
      const marker = new WebMarker({
        element: markerElement,
        anchor: "center",
      })
        .setLngLat([driverLocation.longitude, driverLocation.latitude])
        .addTo(map);
      markerRef.current = marker;
    });

    return () => {
      markerRef.current?.remove();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // Run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setCenter([driverLocation.longitude, driverLocation.latitude]);
    markerRef.current?.setLngLat([driverLocation.longitude, driverLocation.latitude]);

    const source = map.getSource(sourceId) as
      | WebGeoJSONSource
      | undefined;
    if (source) {
      source.setData({
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [
            [driverLocation.longitude, driverLocation.latitude],
            [driverLocation.longitude + 0.015, driverLocation.latitude + 0.012],
          ],
        },
      });
    }
  }, [driverLocation]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setLayoutProperty(layerId, "visibility", showRideRequest ? "visible" : "none");
  }, [showRideRequest]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
    />
  );
}

export default function MapScreen() {
  const cameraRef = useRef<CameraRef>(null);
  const entrance = useStaggeredEntrance();
  const [isOnline, setIsOnline] = useState(false);
  const [region, setRegion] = useState<LatLng>(INITIAL_REGION);
  const [driverLocation, setDriverLocation] = useState<LatLng | null>(null);
  const [showRideRequest, setShowRideRequest] = useState(false);
  const [sheetHeight] = useState(new Animated.Value(0));

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const next: LatLng = { latitude, longitude };
      setDriverLocation(next);
      setRegion(next);

      if (!isWeb) {
        cameraRef.current?.setStop({
          center: [longitude, latitude],
          zoom: 14,
          duration: 800,
        });
      }
    })();
  }, []);

  const toggleOnline = async () => {
    await impactAsync(ImpactFeedbackStyle.Medium);
    const next = !isOnline;
    setIsOnline(next);
    if (next) {
      setTimeout(() => setShowRideRequest(true), 1200);
      setTimeout(
        () =>
          Animated.spring(sheetHeight, {
            toValue: 280,
            useNativeDriver: false,
          }).start(),
        300
      );
    } else {
      setShowRideRequest(false);
      Animated.timing(sheetHeight, {
        toValue: 0,
        duration: 220,
        useNativeDriver: false,
      }).start();
    }
  };

  const centerOnMe = async () => {
    await impactAsync(ImpactFeedbackStyle.Light);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;
    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;
    const next: LatLng = { latitude, longitude };
    setRegion(next);
    setDriverLocation(next);

    if (!isWeb) {
      cameraRef.current?.setStop({
        center: [longitude, latitude],
        zoom: 14,
        duration: 800,
      });
    }
  };

  const handleAccept = async () => {
    await notificationAsync(NotificationFeedbackType.Success);
    setShowRideRequest(false);
    Animated.timing(sheetHeight, {
      toValue: 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  };

  const handleDecline = async () => {
    await notificationAsync(NotificationFeedbackType.Error);
    setShowRideRequest(false);
    Animated.timing(sheetHeight, {
      toValue: 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PEACH }} edges={["top"]}>
      <View style={styles.container}>
        {isWeb ? (
          <WebMap
            driverLocation={driverLocation ?? INITIAL_REGION}
            showRideRequest={showRideRequest}
          />
        ) : (
          <Map mapStyle={MAP_STYLE} style={styles.map}>
            <Camera
              ref={cameraRef as any}
              center={[region.longitude, region.latitude]}
              zoom={14}
            />

            {driverLocation && (
              <Marker
                id="driver-marker"
                lngLat={[driverLocation.longitude, driverLocation.latitude]}
                anchor="center"
              >
                <View style={styles.driverMarker}>
                  <View style={styles.driverMarkerPulse} />
                  <View style={styles.driverMarkerInner}>
                    <Ionicons name="car" size={18} color="#fff" />
                  </View>
                </View>
              </Marker>
            )}

            {driverLocation && showRideRequest && (
              <GeoJSONSource
                id="route-source"
                data={{
                  type: "Feature",
                  properties: {},
                  geometry: {
                    type: "LineString",
                    coordinates: [
                      [driverLocation.longitude, driverLocation.latitude],
                      [
                        driverLocation.longitude + 0.015,
                        driverLocation.latitude + 0.012,
                      ],
                    ],
                  },
                }}
              >
                <Layer
                  id="route-line"
                  type="line"
                  style={{
                    lineColor: ORANGE,
                    lineWidth: 4,
                    lineOpacity: 0.9,
                  }}
                />
              </GeoJSONSource>
            )}
          </Map>
        )}

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
            <Ionicons name="layers-outline" size={22} color={NAVY} />
          </Pressable>
          <Pressable style={styles.mapControlButton}>
            <Ionicons name="battery-full-outline" size={22} color={NAVY} />
          </Pressable>
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
            onPress={toggleOnline}
          >
            <Ionicons
              name={isOnline ? "arrow-up" : "power"}
              size={22}
              color="#FFFFFF"
            />
            <Text style={styles.onlineButtonText}>
              {isOnline ? "GOING ONLINE" : "GO ONLINE"}
            </Text>
          </Pressable>
        </Animated.View>

        {/* Ride Request Bottom Sheet */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Animated.View
            style={[
              styles.sheet,
              { height: sheetHeight },
              showRideRequest && styles.sheetVisible,
            ]}
          >
            <View style={styles.sheetHandle} />
            <View style={styles.sheetContent}>
              <View style={styles.sheetRouteRow}>
                <View style={styles.routeDot} />
                <View style={styles.routeLine} />
                <View style={styles.routeDotEnd} />

                <View style={styles.routeTextWrap}>
                  <Text style={styles.routeLabel}>Pickup</Text>
                  <Text style={styles.routeValue} numberOfLines={1}>
                    East Legon, Accra
                  </Text>
                </View>

                <View style={styles.routeTextWrap}>
                  <Text style={styles.routeLabel}>Drop-off</Text>
                  <Text style={styles.routeValue} numberOfLines={1}>
                    Kotoka Airport, Accra
                  </Text>
                </View>
              </View>

              <View style={styles.sheetDivider} />

              <View style={styles.sheetMetaRow}>
                <View style={styles.sheetMetaItem}>
                  <Ionicons name="cash-outline" size={18} color={NAVY} />
                  <Text style={styles.sheetMetaText}>GHS 85.00</Text>
                </View>
                <View style={styles.sheetMetaItem}>
                  <Ionicons name="time-outline" size={18} color={NAVY} />
                  <Text style={styles.sheetMetaText}>22 min</Text>
                </View>
                <View style={styles.sheetMetaItem}>
                  <Ionicons name="people-outline" size={18} color={NAVY} />
                  <Text style={styles.sheetMetaText}>2 pax</Text>
                </View>
                <View style={styles.sheetMetaItem}>
                  <Ionicons name="cube-outline" size={18} color={NAVY} />
                  <Text style={styles.sheetMetaText}>1 bag</Text>
                </View>
              </View>

              <View style={styles.sheetActions}>
                <Pressable style={styles.declineButton} onPress={handleDecline}>
                  <Text style={styles.declineButtonText}>Decline</Text>
                </Pressable>
                <Pressable style={styles.acceptButton} onPress={handleAccept}>
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>
        </TouchableWithoutFeedback>
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
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
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
    backgroundColor: "#FFFFFF",
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
    color: "#FFFFFF",
    letterSpacing: 0.6,
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 30,
    backgroundColor: PEACH,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    overflow: "hidden",
  },
  sheetVisible: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#EAE1D9",
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D6CFC7",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 16,
  },
  sheetRouteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#10B981",
    marginLeft: 8,
  },
  routeLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#D6CFC7",
    marginHorizontal: 8,
  },
  routeDotEnd: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: ORANGE,
  },
  routeTextWrap: {
    position: "absolute",
    left: 28,
    right: 16,
    gap: 2,
  },
  routeLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6E7E91",
    textTransform: "uppercase",
    letterSpacing: 0.6,
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
  sheetMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  sheetMetaItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EAE1D9",
  },
  sheetMetaText: {
    fontSize: 13,
    fontWeight: "700",
    color: NAVY,
  },
  sheetActions: {
    flexDirection: "row",
    gap: 12,
  },
  declineButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
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
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
});
