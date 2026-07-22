import { Image } from "expo-image";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { images } from "@/constants/images";

export type AuthSocialButtonsProps = {
  /** Whether the Google SSO flow is in progress */
  loading?: boolean;
  /** Called when the Google button is pressed */
  onGooglePress: () => void;
};

/**
 * "or continue with" divider + Google OAuth button.
 *
 * Extracted from the identical pattern in sign-in and sign-up screens:
 * - Thin horizontal divider with centered "or continue with" text
 * - Outlined button with Google logo and "Continue with Google" text
 * - Loading spinner while SSO is in progress
 */
export function AuthSocialButtons({
  loading = false,
  onGooglePress,
}: AuthSocialButtonsProps) {
  return (
    <>
      {/* ── Divider ── */}
      <View style={styles.dividerWrap}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or continue with</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* ── Google button ── */}
      <Pressable
        style={styles.socialBtn}
        onPress={onGooglePress}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#2C3E5B" />
        ) : (
          <View style={styles.socialRow}>
            <Image
              source={images.googleG}
              style={styles.googleIcon}
              contentFit="contain"
            />
            <Text style={styles.socialBtnText}>Continue with Google</Text>
          </View>
        )}
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  dividerWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E5EA",
  },
  dividerText: {
    fontSize: 13,
    color: "#A0AAB4",
    marginHorizontal: 14,
  },
  socialBtn: {
    backgroundColor: "#FFF8F3",
    borderWidth: 1,
    borderColor: "#E0E5EA",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  socialBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A2E",
  },
  socialRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
});
