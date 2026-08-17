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
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          { opacity: contentFade, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.iconWrap}>
          <Ionicons name={iconName} size={120} color={NAVY} />
        </View>
        <Text style={styles.label}>
          Switching to {ROLE_LABELS[role] || role}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
  },
  iconWrap: {
    width: 320,
    height: 320,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  label: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
});
