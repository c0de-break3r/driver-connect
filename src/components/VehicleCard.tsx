import { StyleSheet, Text, View, Pressable } from "react-native";
import { useRef, useCallback, memo } from "react";
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
  verified?: boolean;
};

export default memo(function VehicleCard({ vehicle, isFavorite = false, onPress, onFavoritePress, list = false, style, verified = vehicle.isVerified }: VehicleCardProps) {
  const heartScale = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const isNavigatingRef = useRef(false);

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

  const handlePress = useCallback(() => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 600);
    onPress?.();
  }, [onPress]);

  const handlePressIn = () => {
    Animated.spring(slideAnim, {
      toValue: -10,
      useNativeDriver: true,
      tension: 180,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 180,
      friction: 8,
    }).start();
  };

  return (
    <Pressable
      style={[styles.card, list && styles.listCard, style]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.cardInner, { transform: [{ translateX: slideAnim }] }]}>
        <View style={[styles.imageWrap, list && styles.listImageWrap]}>
        <Image source={{ uri: vehicle.image }} style={styles.cardImage} contentFit="cover" />
        <View style={styles.topRightActions}>
          <Pressable style={styles.favoriteBadge} onPress={handleFavoritePress}>
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={22}
                color={isFavorite ? "#E74C3C" : "#FFFFFF"}
              />
            </Animated.View>
          </Pressable>
        </View>
      </View>
      <View style={[styles.cardBody, list && styles.listCardBody]}>
        <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
          {vehicle.title}
        </Text>
        <Text style={styles.cardSubtitle} numberOfLines={1}>
          {vehicle.category} • {vehicle.transmission} • {vehicle.condition}
        </Text>
        <Text style={styles.cardMeta}>
          <Ionicons name="star" size={14} color="#FFB800" /> {vehicle.rating} ({vehicle.yearsOnPlatform})
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{vehicle.price}</Text>
          <Text style={styles.pricePeriod}>/day</Text>
          {verified && (
            <View style={styles.verifiedBadgeInline}>
               <Ionicons name="checkmark-circle" size={14} color={GREEN} />
              <Text style={styles.verifiedBadgeText}>Verified</Text>
            </View>
          )}
        </View>
      </View>
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
  },
  cardInner: {
    flex: 1,
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
    alignItems: "center",
    justifyContent: "center",
  },
  topRightActions: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    gap: 8,
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
  cardSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 2,
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
  verifiedBadgeInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: "auto",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: "#FFF7ED",
  },
  verifiedBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#10B981",
  },
});
