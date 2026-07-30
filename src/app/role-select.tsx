import * as Haptics from "expo-haptics";
import { router, useFocusEffect, type Href } from "expo-router";
import { useCallback, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

import { PrimaryButton } from "@/components/ui";
import { images } from "@/constants/images";
import { useRoleStore, type UserRole } from "@/store/useRoleStore";
import { useSlideEntrance } from "@/hooks/useSlideEntrance";
import { getPostAuthRoute } from "@/lib/routing";

type RoleOption = {
  key: UserRole;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
};

const OPTIONS: RoleOption[] = [
  {
    key: "driver",
    icon: "car-outline",
    title: "Driver",
    description: "I drive — find job opportunities",
  },
  {
    key: "owner",
    icon: "key-outline",
    title: "Vehicle Owner",
    description: "I own a vehicle — find drivers to hire",
  },
  {
    key: "client",
    icon: "calendar-outline",
    title: "Client",
    description: "I need a ride or driver for an occasion",
  },
  {
    key: "corporate",
    icon: "business-outline",
    title: "Corporate Client",
    description: "I manage outsourced drivers or fleets",
  },
];

export default function RoleSelect() {
  const setRole = useRoleStore((s) => s.setRole);
  const [selected, setSelected] = useState<UserRole | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const { anims, start } = useSlideEntrance({
    count: OPTIONS.length,
    direction: "left",
    initialDelay: 120,
    staggerDelay: 90,
  });

  useFocusEffect(
    useCallback(() => {
      start();
      setIsNavigating(false);
    }, [start]),
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
    if (isNavigating) return;
    setIsNavigating(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setRole(selected);

    const destination = getPostAuthRoute(selected);
    router.replace(destination as Href);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroContainer}>
          <Image
            source={images.heroIllustrator}
            style={styles.heroImage}
            contentFit="cover"
          />
        </View>

        <Text style={styles.title}>How can we help you today?</Text>

        <Text style={styles.subtitle}>
          Choose the option that best describes what you&apos;re looking for.
        </Text>

        <View style={styles.optionsContainer}>
          {OPTIONS.map((option, index) => {
            const isSelected = selected === option.key;
            const anim = anims[index];

            return (
              <Pressable
                key={option.key}
                onPress={() => handleSelect(option.key)}
              >
                <Animated.View
                  style={[
                    styles.optionRow,
                    index < OPTIONS.length - 1 && styles.optionBorder,
                    isSelected && styles.optionSelected,
                    {
                      opacity: anim.opacity,
                      transform: [{ translateX: anim.translate }],
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.optionIcon,
                      isSelected && styles.optionIconSelected,
                    ]}
                  >
                    <Ionicons
                      name={option.icon}
                      size={24}
                      color={isSelected ? "#FFFFFF" : "#2C3E5B"}
                    />
                  </View>
                  <View style={styles.optionContent}>
                    <Text
                      style={[
                        styles.optionTitle,
                        isSelected && styles.optionTitleSelected,
                      ]}
                    >
                      {option.title}
                    </Text>
                    <Text style={styles.optionDesc}>{option.description}</Text>
                  </View>
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    </View>
                  )}
                </Animated.View>
              </Pressable>
            );
          })}
        </View>

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
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 32,
  },
  heroContainer: {
    marginBottom: 23,
  },
  heroImage: {
    width: "100%",
    height: 180,
    borderRadius: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2C3E5B",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 34,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 15,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 16,
    marginBottom: 28,
  },
  optionsContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 0,
  },
  optionSelected: {
    borderColor: "#FF7B54",
    backgroundColor: "#FFF8F3",
    shadowOpacity: 0.08,
    elevation: 2,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F5ECE5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  optionIconSelected: {
    backgroundColor: "#FF7B54",
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2C3E5B",
    marginBottom: 2,
  },
  optionTitleSelected: {
    color: "#2C3E5B",
  },
  optionDesc: {
    fontSize: 12,
    color: "#6E7E91",
    lineHeight: 16,
  },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FF7B54",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
});
