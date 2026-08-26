import { useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/button";

type DetailsImageHeaderProps = {
  onBack: () => void;
  onShare?: () => void;
  onFavorite: () => void;
  isFavorite: boolean;
  heartScale: Animated.Value;
};

export default function DetailsImageHeader({ onBack, onShare, onFavorite, isFavorite, heartScale }: DetailsImageHeaderProps) {
  return (
    <View style={styles.topActions}>
      <Button variant="ghost" size="icon" onPress={onBack} className="w-10 h-10 rounded-full bg-black/30 border border-white/20" icon={<Ionicons name="arrow-back" size={22} color="#FFFFFF" />} />
      <View style={styles.topRightActions}>
        <Button variant="ghost" size="icon" onPress={onShare} className="w-10 h-10 rounded-full bg-black/30 border border-white/20" icon={<Ionicons name="share-outline" size={22} color="#FFFFFF" />} />
        <Button variant="ghost" size="icon" onPress={onFavorite} className="w-10 h-10 rounded-full bg-black/30 border border-white/20" icon={
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={22} color={isFavorite ? "#E74C3C" : "#FFFFFF"} />
          </Animated.View>
        } />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topActions: {
    position: "absolute",
    top: 48,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topRightActions: {
    flexDirection: "row",
    gap: 12,
  },
});
