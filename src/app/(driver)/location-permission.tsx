import { useEffect, useState } from "react";
import {
    Animated,
    Easing,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import { router, type Href } from "expo-router";

import { PrimaryButton } from "@/components/ui";

type LocationChoice = "approximate" | "precise" | null;

export default function LocationPermission() {
  const [choice, setChoice] = useState<LocationChoice>(null);
  const radarRotation = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.timing(radarRotation, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = radarRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const handleContinue = async () => {
    if (!choice) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const accuracy =
      choice === "approximate"
        ? Location.Accuracy.Low
        : Location.Accuracy.High;

    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (granted) {
      await Location.getCurrentPositionAsync({ accuracy });
    }

    router.replace("/(driver)/(tabs)/dashboard" as Href);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.radarWrap,
            { transform: [{ rotate: spin }] },
          ]}
        >
          <View style={styles.radarOuter}>
            {[...Array(8)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.radarDot,
                  {
                    top: `${50 + 40 * Math.sin((i * 45 * Math.PI) / 180)}%`,
                    left: `${50 + 40 * Math.cos((i * 45 * Math.PI) / 180)}%`,
                  },
                ]}
              />
            ))}
          </View>
          <View style={styles.radarCenter}>
            <View style={styles.radarInner}>
              <View style={styles.pinWrap}>
                <View style={styles.pinCircle} />
                <View style={styles.pinStem} />
                <View style={styles.pinDot} />
              </View>
            </View>
          </View>
        </Animated.View>

        <Text style={styles.heading}>Find customer near you</Text>
        <Text style={styles.subtitle}>
          Please select your location to start finding available customer near
          you
        </Text>

        <View style={styles.optionsWrap}>
          <Pressable
            style={[
              styles.option,
              choice === "approximate" && styles.optionActive,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setChoice("approximate");
            }}
          >
            <View style={styles.radio}>
              {choice === "approximate" && <View style={styles.radioFill} />}
            </View>
            <View style={styles.optionTextWrap}>
              <Text style={styles.optionTitle}>Approximate</Text>
              <Text style={styles.optionDesc}>
                Use only approximate location
              </Text>
            </View>
          </Pressable>

          <Pressable
            style={[styles.option, choice === "precise" && styles.optionActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setChoice("precise");
            }}
          >
            <View style={styles.radio}>
              {choice === "precise" && <View style={styles.radioFill} />}
            </View>
            <View style={styles.optionTextWrap}>
              <Text style={styles.optionTitle}>Precise</Text>
              <Text style={styles.optionDesc}>
                Use precise location always
              </Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.buttonSpacer}>
          <PrimaryButton
            title="Continue"
            onPress={handleContinue}
            disabled={!choice}
            style={{ width: "100%" }}
            icon={
              <View style={styles.buttonIcon}>
                <View style={styles.buttonIconInner} />
              </View>
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  radarWrap: {
    width: 220,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
  },
  radarOuter: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  radarDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#94A3B8",
    position: "absolute",
  },
  radarCenter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#1E3A8A",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1E3A8A",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.35,
    shadowRadius: 40,
    elevation: 16,
  },
  radarInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  pinWrap: {
    alignItems: "center",
  },
  pinCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
    borderColor: "#1E3A8A",
  },
  pinStem: {
    width: 3,
    height: 18,
    backgroundColor: "#FFFFFF",
    marginTop: -2,
  },
  pinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1E3A8A",
    marginTop: -1,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  optionsWrap: {
    width: "100%",
    gap: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  optionActive: {
    borderColor: "#1E3A8A",
    backgroundColor: "#EFF6FF",
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },
  radioFill: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#1E3A8A",
  },
  optionTextWrap: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  optionDesc: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  buttonSpacer: {
    width: "100%",
    marginTop: 8,
  },
  buttonIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF33",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIconInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
  },
});
