import { Image } from "expo-image";
import { TouchableOpacity, View } from "react-native";
import { Text } from "react-native";
import { StyleSheet } from "react-native";
import { Button } from "@/components/ui/button";

const NAVY = "#2C3E5B";

type EmptyStateProps = {
  image?: any;
  title: string;
  subtitle?: string;
  ctaText?: string;
  onCtaPress?: () => void;
  compact?: boolean;
};

export default function EmptyState({
  image,
  title,
  subtitle,
  ctaText,
  onCtaPress,
  compact = false,
}: EmptyStateProps) {
  return (
    <View className="items-center justify-center py-16">
      {image && (
        <View style={[styles.illustrationWrap, compact && styles.illustrationWrapCompact]}>
          <Image source={image} style={[styles.emptyImage, compact && styles.emptyImageCompact]} contentFit="contain" />
        </View>
      )}
      <Text className="text-lg font-extrabold text-[#2C3E5B] text-center mb-1">{title}</Text>
      {subtitle && <Text className="text-sm font-medium text-[#6B7280] text-center mb-8 max-w-[280px]">{subtitle}</Text>}
      {ctaText && onCtaPress && (
        <Button onPress={onCtaPress}>{ctaText}</Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  illustrationWrap: {
    marginBottom: 24,
  },
  illustrationWrapCompact: {
    marginBottom: 8,
  },
  emptyImage: {
    width: 240,
    height: 240,
    marginBottom: 24,
  },
  emptyImageCompact: {
    marginBottom: 8,
  },
});
