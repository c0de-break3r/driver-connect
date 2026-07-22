import { router, type Href } from "expo-router";
import { Animated, Platform, Pressable, StyleSheet, Text } from "react-native";

export type AuthBackButtonProps = {
  /** Animated opacity value from useStaggeredEntrance (header layer) */
  opacity: Animated.Value;
  /**
   * Where to navigate on back press.
   * - `"welcome"` → goes to Welcome screen
   * - `"sign-in"` → goes to sign-in screen
   * - Custom function for full control
   */
  goBack: "welcome" | "sign-in" | (() => void);
};

/**
 * Consistent back button for auth screens.
 *
 * Positioned absolute top-left with staggered entrance animation.
 * Back navigation logic always includes a fallback route.
 */
export function AuthBackButton({ opacity, goBack }: AuthBackButtonProps) {
  const handlePress = () => {
    if (typeof goBack === "function") {
      goBack();
      return;
    }

    // Try back first - slides from left when there IS a navigation stack
    try {
      router.back();
    } catch {
      // Fallback: route explicitly to welcome or sign-in
      if (goBack === "welcome") {
        router.replace("/(onboarding)/welcome" as Href);
      } else {
        router.replace("/(auth)/sign-in" as Href);
      }
    }
  };

  return (
    <Animated.View style={[styles.backBtnWrap, { opacity }]}>
      <Pressable style={styles.backBtn} onPress={handlePress} hitSlop={12}>
        <Text style={styles.backBtnText}>{"‹"}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backBtnWrap: {
    position: "absolute",
    top: Platform.OS === "ios" ? 56 : 40,
    left: 16,
    zIndex: 10,
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
  backBtnText: {
    fontSize: 24,
    fontWeight: "300",
    color: "#2C3E5B",
  },
});
