import { useMemo, useCallback, useEffect } from "react";
import { Animated, Pressable, Text, View, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { images } from "@/constants/images";

const NAVY = "#2C3E5B";

export default function PrivacyPolicyScreen() {
  const from = useLocalSearchParams<{ from?: string }>();
  const slideAnim = useMemo(() => new Animated.Value(1), []);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
      easing: (t) => Math.pow(t, 2),
    }).start();
  }, [slideAnim]);

  const goBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(slideAnim, {
      toValue: 1.2,
      duration: 240,
      useNativeDriver: true,
      easing: (t) => Math.pow(t, 2),
    }).start(() => {
      if (from?.from) {
        router.replace(from.from as any);
      } else {
        router.back();
      }
    });
  }, [from, slideAnim]);

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1, 1.2],
    outputRange: [0, 360, 360],
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={goBack} hitSlop={8} style={styles.backButton}>
            <Animated.Text
              style={[
                styles.backArrow,
                { transform: [{ translateX }] },
              ]}
            >
              {'<'}
            </Animated.Text>
            <Animated.Text
              style={[
                styles.backTitle,
                { transform: [{ translateX }] },
              ]}
            >
              Privacy Policy
            </Animated.Text>
          </Pressable>
        </View>

        <View style={styles.scrollContent}>
          <Image
            source={images.appIcon}
            style={styles.icon}
            contentFit="contain"
          />
          <Text style={styles.brandTitle}>Africana Driver Connect</Text>
          <Text style={styles.paragraph}>
            Our Privacy Policy explains what personal information we collect, how we use personal information, how personal information is shared, and privacy rights.
          </Text>
          <Text style={styles.paragraph}>
            Please review the supplemental privacy policies linked within the privacy policy documents, such as for certain Africana Driver Connect services, that may be applicable to you.
          </Text>
          <Text style={styles.sectionTitle}>Supplemental Privacy Policy Documents</Text>
          <Text style={styles.sectionItem}>Privacy Policy</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  backArrow: {
    fontSize: 30,
    color: NAVY,
    lineHeight: 32,
  },
  backTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: NAVY,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    alignItems: "center",
  },
  icon: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: NAVY,
    textAlign: "center",
    marginBottom: 24,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: "#374151",
    textAlign: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: NAVY,
    textAlign: "left",
    alignSelf: "flex-start",
    marginTop: 24,
    marginBottom: 16,
  },
  sectionItem: {
    fontSize: 15,
    lineHeight: 22,
    color: NAVY,
    textAlign: "left",
    alignSelf: "flex-start",
  },
});
