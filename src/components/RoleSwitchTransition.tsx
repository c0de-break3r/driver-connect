import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { images } from "@/constants/images";

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
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2600),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1200,
        easing: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        useNativeDriver: true,
      }),
      Animated.delay(2600),
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

  const isOwner = role === "owner";

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          {isOwner ? (
            <View style={styles.slideContainer}>
              <Image source={images.roleOwner} style={styles.slideImage} contentFit="contain" />
              <Animated.View
                style={[
                  styles.slideOverlay,
                  {
                    transform: [
                      {
                        translateX: rotateAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -320],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Image source={images.roleGuest} style={styles.slideImage} contentFit="contain" />
              </Animated.View>
            </View>
          ) : (
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
          )}
        </View>

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
    width: 320,
    height: 320,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  slideContainer: {
    width: 320,
    height: 320,
    alignItems: "center",
    justifyContent: "center",
  },
  slideOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
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
