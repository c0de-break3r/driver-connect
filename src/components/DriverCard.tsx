import { useRef, useCallback } from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Animated } from "react-native";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Driver } from "@/types/explore";

const NAVY = "#2C3E5B";

type DriverCardProps = {
  driver: Driver;
  isFavorite?: boolean;
  onPress?: () => void;
  onFavoritePress?: () => void;
  list?: boolean;
};

export default function DriverCard({ driver, isFavorite = false, onPress, onFavoritePress, list = false }: DriverCardProps) {
  const heartScale = useRef(new Animated.Value(1)).current;

  const triggerHeartBeat = useCallback(() => {
    heartScale.setValue(1);
    Animated.sequence([
      Animated.timing(heartScale, { toValue: 1.35, duration: 120, useNativeDriver: true }),
      Animated.timing(heartScale, { toValue: 0.85, duration: 120, useNativeDriver: true }),
      Animated.timing(heartScale, { toValue: 1.15, duration: 120, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, tension: 180, friction: 3 }),
    ]).start();
  }, [heartScale]);

  const handleFavoritePress = () => {
    triggerHeartBeat();
    onFavoritePress?.();
  };

  return (
    <Pressable
      style={[styles.card, list ? styles.listCard : undefined]}
      onPress={onPress}
    >
      <Card className={`p-0 overflow-hidden ${list ? "flex-row" : ""}`}>
        <View style={[styles.imageWrap, list && styles.listImageWrap]}>
          <Image source={{ uri: driver.image }} style={styles.cardImage} contentFit="cover" />
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
        <View style={[styles.cardBody, list && styles.listCardBody]}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {driver.name}
          </Text>
          <Text style={styles.cardSubtitle}>{driver.location}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#FFB800" />
            <Text style={styles.ratingText}>{driver.rating}</Text>
            <Text style={styles.tripsText}>({driver.trips} trips)</Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
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
    height: 120,
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
  listImageWrap: {
    width: 140,
    aspectRatio: 1.5,
    flexShrink: 1,
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
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "700",
    color: NAVY,
  },
  tripsText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#6B7280",
  },
});
