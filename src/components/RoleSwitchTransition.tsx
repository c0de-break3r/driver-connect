import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const NAVY = "#2C3E5B";

type RoleSwitchTransitionProps = {
  role: "owner" | "driver" | "client" | "corporate";
};

const ROLE_LABELS: Record<string, string> = {
  owner: "Vehicle Owner",
  driver: "Driver",
  client: "Guest",
  corporate: "Corporate",
};

const ROLE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  owner: "car-outline",
  driver: "person-outline",
  client: "person-outline",
  corporate: "business-outline",
};

export default function RoleSwitchTransition({ role }: RoleSwitchTransitionProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1200,
          easing: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(400),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (role === "owner") {
        router.replace("/(owner)");
      } else if (role === "driver") {
        router.replace("/(driver)" as any);
      } else if (role === "corporate") {
        router.replace("/(corporate)" as any);
      } else {
        router.replace("/(client)" as any);
      }
    });
  }, [role, rotateAnim, fadeAnim]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.iconWrap,
            {
              transform: [
                { perspective: 800 },
                { rotateY: rotateInterpolate },
              ],
            },
          ]}
        >
          <Ionicons name={ROLE_ICONS[role]} size={120} color={NAVY} />
        </Animated.View>

        <Text style={styles.label}>
          Switching to {ROLE_LABELS[role] || role}
        </Text>
      </View>
    </Animated.View>
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
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
});
