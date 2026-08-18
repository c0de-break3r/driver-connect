import { Image } from "expo-image";
import { TouchableOpacity, View } from "react-native";
import { Text } from "react-native";
import { StyleSheet } from "react-native";

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
    <View style={styles.emptyState}>
      {image && (
        <View style={[styles.illustrationWrap, compact && styles.illustrationWrapCompact]}>
          <Image source={image} style={[styles.emptyImage, compact && styles.emptyImageCompact]} contentFit="contain" />
        </View>
      )}
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
      {ctaText && onCtaPress && (
        <TouchableOpacity style={styles.ctaButton} onPress={onCtaPress}>
          <Text style={styles.ctaButtonText}>{ctaText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
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
  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: NAVY,
    textAlign: "center",
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  ctaButton: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  ctaButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
  },
});
