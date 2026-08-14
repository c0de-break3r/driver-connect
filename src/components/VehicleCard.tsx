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
        <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
          {vehicle.title}
        </Text>
        <Text style={styles.cardMeta}>
          {vehicle.condition} • <Ionicons name="star" size={14} color="#FFB800" /> {vehicle.rating} ({vehicle.yearsOnPlatform})
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{vehicle.price}</Text>
          <Text style={styles.pricePeriod}>/day</Text>
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
  },
  listCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  imageWrap: {
    position: "relative",
    width: "100%",
    aspectRatio: 1.5,
  },
  listImageWrap: {
    width: 140,
    aspectRatio: 1.5,
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
    gap: 4,
    flex: 1,
  },
  listCardBody: {
    padding: 12,
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: NAVY,
    flexShrink: 1,
  },
  cardMeta: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: GREEN,
  },
  pricePeriod: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
});
