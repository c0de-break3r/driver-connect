import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { UserRole } from "@/store/useRoleStore";
import { images } from "@/constants/images";

const NAVY = "#2C3E5B";

type RoleSwitchTransitionProps = {
  role: UserRole;
  fromRole?: UserRole;
};

const ROLE_LABELS: Record<string, string> = {
  owner: "Vehicle Owner",
  driver: "Driver",
  client: "Guest",
  corporate: "Corporate",
};

export default function RoleSwitchTransition({
  role,
  fromRole,
}: RoleSwitchTransitionProps) {
  const contentFade = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const showTargetRoleImage = role === "owner" || role === "client";

  const targetRoleImage =
    role === "owner"
      ? images.roleOwner
      : role === "client"
        ? images.roleGuest
        : null;

  const fallbackIcon = role === "owner"
    ? "car-outline"
    : role === "client"
      ? "person-outline"
      : role === "driver"
        ? "person-outline"
        : "business-outline";

  useEffect(() => {
    contentFade.setValue(0);
    scaleAnim.setValue(0.8);

    const navigate = () => {
      if (role === "owner") {
        router.replace("/(owner)" as any);
      } else if (role === "driver") {
        router.replace("/(driver)" as any);
      } else if (role === "corporate") {
        router.replace("/(corporate)" as any);
      } else {
        router.replace("/home" as any);
      }
    };

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
      Animated.delay(2200),
      Animated.timing(contentFade, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start(navigate);
  }, [role, contentFade, scaleAnim]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          { opacity: contentFade, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.iconWrap}>
          {showTargetRoleImage && targetRoleImage ? (
            <Image
              source={targetRoleImage}
              style={styles.slideImage}
              contentFit="contain"
            />
          ) : (
            <Animated.View
              style={[
                styles.iconWrap,
                {
                  transform: [
                    { perspective: 800 },
                    { rotateY: contentFade.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", "360deg"],
                    })},
                  ],
                },
              ]}
            >
              <Ionicons name={fallbackIcon as keyof typeof Ionicons.glyphMap} size={120} color={NAVY} />
            </Animated.View>
          )}
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
  slideImage: {
    width: 320,
    height: 320,
  },
  label: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
});
