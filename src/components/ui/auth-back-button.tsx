import { router, type Href } from "expo-router";
import { Animated, Platform, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type AuthBackButtonProps = {
  /** Animated opacity value from useStaggeredEntrance (header layer) */
  opacity: Animated.Value;
  /**
   * Where to navigate on back press.
   * - `"welcome"` → goes to Welcome screen
   * - `"identity"` → goes to Provide Your Identity screen
   * - `"sign-in"` → goes to sign-in screen
   * - Custom function for full control
   */
  goBack: "welcome" | "identity" | "sign-in" | "forgot-password" | (() => void);
};

/**
 * Consistent back button for auth screens.
 *
 * Positioned absolute top-left with staggered entrance animation.
 * Uses explicit route replacement so behavior is predictable even
 * when there is no navigation stack history.
 */
export function AuthBackButton({ opacity, goBack }: AuthBackButtonProps) {
  const handlePress = () => {
    if (typeof goBack === "function") {
      goBack();
      return;
    }

    const target = goBack === "welcome"
      ? "/(onboarding)/welcome"
      : goBack === "identity"
        ? "/(onboarding)/driver-identity"
        : goBack === "forgot-password"
          ? "/(auth)/forgot-password"
          : "/(auth)/sign-in";

    router.replace(target as Href);
  };

  return (
    <Animated.View style={[styles.backBtnWrap, { opacity }]}>
      <Pressable style={styles.backBtn} onPress={handlePress} hitSlop={12}>
        <Ionicons name="chevron-back" size={22} color="#2C3E5B" />
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
});
