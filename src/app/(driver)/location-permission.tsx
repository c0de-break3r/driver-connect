import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import { router, type Href } from "expo-router";

import { PrimaryButton } from "@/components/ui";

export default function LocationPermission() {
  const [granted, setGranted] = useState(false);
  const [checking, setChecking] = useState(true);

  const navigateToDashboard = () => {
    setTimeout(() => {
      router.replace("/(driver)/(tabs)/dashboard" as Href);
    }, 120);
  };

  useEffect(() => {
    let mounted = true;

    async function checkPermission() {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (mounted) {
          if (status === "granted") {
            setGranted(true);
            navigateToDashboard();
          }
          setChecking(false);
        }
      } catch {
        if (mounted) setChecking(false);
      }
    }

    checkPermission();

    return () => {
      mounted = false;
    };
  }, []);

  const requestLocationPermission = async (): Promise<boolean> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access location is required.");
      return false;
    }
    return true;
  };

  const handleContinue = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    setGranted(true);
    navigateToDashboard();
  };

  if (checking) {
    return null;
  }

  if (granted) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="search" size={96} color="#FF7B54" />
        </View>

        <Text style={styles.heading}>Find customer near you</Text>
        <Text style={styles.subtitle}>
          Please allow location access to start finding available customers near
          you
        </Text>

        <View style={styles.buttonSpacer}>
          <PrimaryButton
            title="Continue"
            onPress={handleContinue}
            style={{ width: "100%" }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF8F3",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  iconWrap: {
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2C3E5B",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  buttonSpacer: {
    width: "100%",
    marginTop: 8,
  },
});
