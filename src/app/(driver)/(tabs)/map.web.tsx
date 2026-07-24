import { StyleSheet, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  impactAsync,
  notificationAsync,
  ImpactFeedbackStyle,
  NotificationFeedbackType,
} from "expo-haptics";
import { useDriverMapStore } from "@/store/useDriverMapStore";

const NAVY = "#2C3E5B";
const ORANGE = "#FF7B54";
const PEACH = "#FFF8F3";
const WHITE = "#FFFFFF";

export default function MapScreen() {
  const {
    isOnline,
    rideRequests,
    toggleOnline,
    acceptRideRequest,
    declineRideRequest,
  } = useDriverMapStore();

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PEACH }} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map-outline" size={64} color="#D6CFC7" />
          <Text style={styles.placeholderTitle}>Map Preview</Text>
          <Text style={styles.placeholderSubtitle}>
            Open the app on a mobile device to see the interactive map, nearby
            drivers, and ride requests.
          </Text>
        </View>

        {/* Go Online / Offline Button */}
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

        {/* Stay Online panel */}
        <View style={styles.stayOnlinePanel}>
          <Text style={styles.stayOnlineTitle}>Stay Online</Text>
          <Text style={styles.stayOnlineSubtitle}>
            Customer Are Surrounding You!
          </Text>
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
                      <Ionicons name="cash-outline" size={16} color={NAVY} />
                      <Text style={styles.metaText}>{request.price}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={16} color={NAVY} />
                      <Text style={styles.metaText}>{request.duration}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="people-outline" size={16} color={NAVY} />
                      <Text style={styles.metaText}>{request.passengers}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="cube-outline" size={16} color={NAVY} />
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
        </View>
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
  mapPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: NAVY,
    textAlign: "center",
  },
  placeholderSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 20,
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
  stayOnlinePanel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: PEACH,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
    gap: 20,
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 10,
  },
  stayOnlineTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: NAVY,
    textAlign: "center",
  },
  stayOnlineSubtitle: {
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
