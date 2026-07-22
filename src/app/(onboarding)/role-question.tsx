import * as Haptics from "expo-haptics";
import { router, useFocusEffect, type Href } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/ui";
import { useRoleStore, type UserRole } from "@/store/useRoleStore";

/**
 * Role question screen — routes to driver signup for drivers, auth for others.
 * Matches driver-signup.tsx positioning.
 */

type RoleOption = {
  key: UserRole;
  icon: string;
  title: string;
  description: string;
};

const OPTIONS: RoleOption[] = [
  {
    key: "driver",
    icon: "🚗",
    title: "Driver",
    description: "I drive — find job opportunities",
  },
  {
    key: "owner",
    icon: "👨🏾‍💼",
    title: "Vehicle Owner",
    description: "I own a vehicle — find drivers to hire",
  },
  {
    key: "client",
    icon: "🧑‍🦰",
    title: "Client",
    description: "I need a ride or driver for an occasion",
  },
  {
    key: "corporate",
    icon: "🏢",
    title: "Corporate Client",
    description: "I manage outsourced drivers or fleets",
  },
];

export default function RoleQuestion() {
  const setRole = useRoleStore((s) => s.setRole);
  const [selected, setSelected] = useState<UserRole | null>(null);

  // Entrance animations
  const contentOpacity = useMemo(() => new Animated.Value(0), []);
  const contentY = useMemo(() => new Animated.Value(20), []);

  useFocusEffect(
    useCallback(() => {
      contentOpacity.setValue(0);
      contentY.setValue(20);

      Animated.parallel([
        Animated.sequence([
          Animated.delay(100),
          Animated.parallel([
            Animated.timing(contentOpacity, {
              toValue: 1,
              duration: 450,
              useNativeDriver: true,
            }),
            Animated.timing(contentY, {
              toValue: 0,
              duration: 450,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start();
    }, [contentOpacity, contentY]),
  );

  const handleSelect = (role: UserRole) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(role);
  };

  const handleContinue = () => {
    if (!selected) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setRole(selected);

    if (selected === "driver") {
      router.push("/(onboarding)/driver-signup" as Href);
    } else {
      router.push("/(auth)/sign-in" as Href);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>How can we help you today?</Text>

        <Text style={styles.subtitle}>
          Choose the option that best describes what you&apos;re looking for.
        </Text>

        {/* ── Role options ── */}
        <View style={styles.optionsContainer}>
          {OPTIONS.map((option, index) => {
            const isSelected = selected === option.key;
            return (
              <Pressable
                key={option.key}
                onPress={() => handleSelect(option.key)}
              >
                <View
                  style={[
                    styles.optionRow,
                    index < OPTIONS.length - 1 && styles.optionBorder,
                    isSelected && styles.optionSelected,
                  ]}
                >
                  <View style={styles.optionIcon}>
                    <Text style={styles.optionEmoji}>{option.icon}</Text>
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>{option.title}</Text>
                    <Text style={styles.optionDesc}>{option.description}</Text>
                  </View>
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <Text style={styles.checkText}>✓</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* ── CTA Button ── */}
        <View style={styles.buttonContainer}>
          <PrimaryButton
            title="Continue"
            onPress={handleContinue}
            disabled={!selected}
            style={{ width: "100%" }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F3",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backArrow: {
    fontSize: 24,
    color: "#2C3E5B",
    fontWeight: "300",
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#2C3E5B",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#EAE1D9",
  },
  optionSelected: {
    borderWidth: 2,
    borderColor: "#FF7B54",
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(44, 62, 91, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  optionEmoji: {
    fontSize: 20,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E5B",
  },
  optionDesc: {
    fontSize: 12,
    color: "#6E7E91",
    marginTop: 2,
  },
  checkBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FF7B54",
    alignItems: "center",
    justifyContent: "center",
  },
  checkText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  buttonContainer: {
    paddingVertical: 16,
  },
});
