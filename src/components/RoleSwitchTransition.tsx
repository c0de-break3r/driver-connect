import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { UserRole } from "@/store/useRoleStore";

const NAVY = "#2C3E5B";

type RoleSwitchTransitionProps = {
  role: UserRole;
  fromRole?: UserRole;
};

const ROLE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  owner: "car-outline",
  driver: "person-outline",
  client: "person-outline",
  corporate: "business-outline",
};

const ROLE_LABELS: Record<string, string> = {
  owner: "Vehicle Owner",
  driver: "Driver",
  client: "Guest",
  corporate: "Corporate",
};

const ROLE_ROUTES: Record<string, string> = {
  owner: "/(owner)",
  driver: "/(driver)",
  corporate: "/(corporate)",
  client: "/home",
};

export default function RoleSwitchTransition({
  role,
  fromRole,
}: RoleSwitchTransitionProps) {
  const contentFade = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    contentFade.setValue(0);
    scaleAnim.setValue(0.8);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(contentFade, {
          toValue: 1,
          duration: 320,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 14,
          stiffness: 160,
          mass: 0.8,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1200),
    ]).start(() => {
      const target = ROLE_ROUTES[role] || "/home";
      router.replace(target as any);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const iconName = ROLE_ICONS[role] || "person-outline";

  return (
    <View className="absolute inset-0 bg-white items-center justify-center z-[100]">
      <Animated.View
        style={[
          styles.content,
          { opacity: contentFade, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View className="w-80 h-80 items-center justify-center overflow-hidden">
          <Ionicons name={iconName} size={120} color={NAVY} />
        </View>
        <Text className="text-lg font-bold text-[#111827] text-center">
          Switching to {ROLE_LABELS[role] || role}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
  },
});
