import { router, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type AuthFooterVariant = "sign-up-link" | "sign-in-link" | "forgot-password-link";

export type AuthFooterProps = {
  variant: AuthFooterVariant;
  /** Optional origin param to preserve across auth navigation, e.g. "driver-identity" */
  from?: string;
};

/**
 * Shared footer for auth screens.
 *
 * - sign-up-link: "Don't have an account? Sign up" → opens sign-up
 * - sign-in-link: "Already have an account? Sign in" → opens sign-in
 * - forgot-password-link: simple centered text fallback
 *
 * The variant name describes where the link goes.
 */
export function AuthFooter({ variant, from }: AuthFooterProps) {
  const goToSignUp = variant === "sign-up-link";

  if (variant === "forgot-password-link") {
    return (
      <View style={styles.wrap}>
        <Text style={styles.text}>I have remembered my password? </Text>
        <Pressable hitSlop={8}>
          <Text style={styles.link}>Sign in</Text>
        </Pressable>
      </View>
    );
  }

  const target = goToSignUp ? "/(auth)/sign-up" : "/(auth)/sign-in";
  const href: Href = from
    ? (`${target}?from=${from}` as Href)
    : (target as Href);

  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>
        {goToSignUp ? "Don't have an account? " : "Already have an account? "}
      </Text>
      <Pressable
        onPress={() => router.push(href)}
        hitSlop={8}
      >
        <Text style={styles.link}>
          {goToSignUp ? "Sign up" : "Sign in"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 4,
  },
  text: {
    fontSize: 14,
    color: "#6E7E91",
  },
  link: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2C3E5B",
  },
});
