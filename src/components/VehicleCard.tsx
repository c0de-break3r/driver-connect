import { StyleSheet, Text, View, Pressable } from "react-native";
import { useRef } from "react";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Animated } from "react-native";
import type { VehicleFavorite } from "@/store/useFavoritesStore";

const NAVY = "#2C3E5B";
const GREEN = "#10B981";

type VehicleCardProps = {
  vehicle: VehicleFavorite;
  isFavorite?: boolean;
  onPress?: () => void;
  onFavoritePress?: () => void;
  list?: boolean;
  style?: any;
};

export function VehicleCard({ vehicle, isFavorite = false, onPress, onFavoritePress, list = false, style }: VehicleCardProps) {
  const avatarUrl = vehicle.ownerAvatar;
  const heartScale = useRef(new Animated.Value(1)).current;

  const triggerHeartBeat = () => {
    heartScale.setValue(1);
    Animated.sequence([
      Animated.timing(heartScale, { toValue: 1.35, duration: 120, useNativeDriver: true }),
      Animated.timing(heartScale, { toValue: 0.85, duration: 120, useNativeDriver: true }),
      Animated.timing(heartScale, { toValue: 1.15, duration: 120, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, tension: 180, friction: 3 }),
    ]).start();
  };

  const handleFavoritePress = () => {
    triggerHeartBeat();
    onFavoritePress?.();
  };

  return (
    <Pressable style={[styles.card, list && styles.listCard, style]} onPress={onPress}>
      <View style={[styles.imageWrap, list && styles.listImageWrap]}>
        <Image source={{ uri: vehicle.image }} style={styles.cardImage} contentFit="cover" />
        <Pressable style={styles.favoriteBadge} onPress={handleFavoritePress}>
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={18}
              color={isFavorite ? "#E74C3C" : "#6B7280"}
            />
          </Animated.View>
        </Pressable>
      </View>
      <View style={[styles.cardBody, list && styles.listCardBody]}>
        <Text style={styles.price}>{vehicle.price}</Text>
        <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
          {vehicle.title}
        </Text>
        <Text style={styles.cardSubtitle}>
          {vehicle.location} • {vehicle.condition}
        </Text>
        <Text style={styles.cardTransmission}>{vehicle.transmission}</Text>
        <View style={styles.metaRow}>
          {vehicle.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={12} color={GREEN} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
          {vehicle.isVerified && vehicle.yearsOnPlatform ? (
            <Text style={styles.yearsText}>• {vehicle.yearsOnPlatform}</Text>
          ) : (
            <Text style={styles.yearsText}>{vehicle.yearsOnPlatform}</Text>
          )}
        </View>
        <View style={styles.ownerRow}>
          <Image source={{ uri: avatarUrl }} style={styles.ownerAvatar} contentFit="cover" />
          <Text style={styles.ownerName} numberOfLines={1} ellipsizeMode="tail">
            {vehicle.ownerName}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  listCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  imageWrap: {
    position: "relative",
    width: "100%",
    height: 120,
  },
  listImageWrap: {
    width: 140,
    height: 140,
    flexShrink: 1,
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
  cardBody: {
    padding: 10,
    gap: 3,
    flex: 1,
  },
  listCardBody: {
    padding: 12,
    justifyContent: "center",
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
    color: GREEN,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: NAVY,
    flexShrink: 1,
  },
  cardSubtitle: {
    fontSize: 11,
    fontWeight: "500",
    color: "#6B7280",
  },
  cardTransmission: {
    fontSize: 11,
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
