import { StyleSheet, Text, View, Pressable } from "react-native";
import { useRef, useCallback, memo } from "react";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Animated } from "react-native";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { VehicleFavorite } from "@/store/useFavoritesStore";

const GREEN = "#10B981";

type VehicleCardProps = {
  vehicle: VehicleFavorite;
  isFavorite?: boolean;
  onPress?: () => void;
  onFavoritePress?: () => void;
  list?: boolean;
  style?: any;
  verified?: boolean;
  compact?: boolean;
};

export default memo(function VehicleCard({ vehicle, isFavorite = false, onPress, onFavoritePress, list = false, style, verified = vehicle.isVerified, compact = false }: VehicleCardProps) {
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
      style={[styles.card, list && styles.listCard, compact && styles.compactCard, style]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.cardInner, { transform: [{ translateX: slideAnim }] }]}>
        <Card className={`p-0 overflow-hidden ${list ? "flex-row" : ""}`} style={{ width: list || compact ? "100%" : undefined }}>
          <View style={[styles.imageWrap, list && styles.listImageWrap, compact && styles.compactImageWrap]}>
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
          <View style={[styles.cardBody, list && styles.listCardBody, compact && styles.compactCardBody]}>
            <Text className="text-sm font-bold text-[#2C3E5B]" numberOfLines={1} ellipsizeMode="tail">
              {vehicle.title}
            </Text>
             {compact ? (
               <View className="flex-row items-center gap-1">
                 <Text className="text-sm font-bold text-[#10B981]">{vehicle.price}</Text>
                 <Text className="text-xs font-medium text-[#6B7280]">/day</Text>
               </View>
             ) : list ? (
               <>
                 <Text className="text-xs font-medium text-[#6B7280]" numberOfLines={1}>
                   {vehicle.location}
                 </Text>
                 <View className="flex-row items-center gap-1 mt-1">
                   <Text className="text-base font-bold text-[#10B981]">{vehicle.price}</Text>
                   <Text className="text-xs font-medium text-[#6B7280]">/day</Text>
                 </View>
               </>
             ) : (
               <>
                 <Text className="text-xs font-medium text-[#6B7280]" numberOfLines={1}>
                   {vehicle.category} • {vehicle.transmission} • {vehicle.condition}
                 </Text>
                 <Text className="text-xs font-medium text-[#6B7280]">
                   <Ionicons name="star" size={12} color="#FFB800" /> {vehicle.rating} ({vehicle.yearsOnPlatform})
                 </Text>
                 <View className="flex-row items-center gap-1 mt-1">
                   <Text className="text-base font-bold text-[#10B981]">{vehicle.price}</Text>
                   <Text className="text-xs font-medium text-[#6B7280]">/day</Text>
                    {verified && (
                      <Badge variant="primary" className="ml-auto flex-row items-center gap-1">
                        <Ionicons name="checkmark-circle-outline" size={12} color="#FFFFFF" />
                        <Text className="text-white font-semibold text-[11px]">Verified</Text>
                      </Badge>
                    )}
                 </View>
               </>
             )}
          </View>
        </Card>
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
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
  compactCard: {
    width: 160,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  compactImageWrap: {
    width: "100%",
    height: 110,
  },
  compactCardBody: {
    padding: 10,
    gap: 4,
  },
});
