import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

type OnboardingScreenProps = {
  title: string;
  subtitle: string;
  image?: any;
  showSkip?: boolean;
  onNext?: () => void;
  nextLabel?: string;
  children?: React.ReactNode;
};

export function OnboardingScreen({
  title,
  subtitle,
  image,
  showSkip = true,
  onNext,
  nextLabel = "Continue",
  children,
}: OnboardingScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        {showSkip && (
          <Pressable onPress={() => router.replace("/(onboarding)/dashboard")}>
            <Text style={styles.skip}>Skip</Text>
          </Pressable>
        )}

        {image && (
          <View style={styles.imageContainer}>
            <Image source={image} style={styles.image} resizeMode="contain" />
          </View>
        )}

        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        {children}

        <View style={styles.footer}>
          <Pressable onPress={onNext} style={styles.nextButton}>
            <Text style={styles.nextButtonText}>{nextLabel}</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  skip: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "right",
    marginBottom: 24,
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 32,
  },
  image: {
    width: 240,
    height: 240,
  },
  textContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2C3E5B",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
  footer: {
    marginTop: "auto",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2C3E5B",
    paddingVertical: 16,
    borderRadius: 12,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
