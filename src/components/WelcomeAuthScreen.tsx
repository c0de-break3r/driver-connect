import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { images } from "@/constants/images";
import { useAuthEntryFlow } from "@/hooks/useAuthEntryFlow";

const SCREEN_HEIGHT = Dimensions.get("window").height;

const ACCENT = "#2C3E5B";
const DARK = "#2C3E5B";
const WHITE = "#FFFFFF";

export default function WelcomeAuthScreen({ onDismiss }: { onDismiss?: () => void }) {
  const flow = useAuthEntryFlow();
  const [sheetState, setSheetState] = useState<"open" | "dismissed">("open");
  const sheetAnim = useMemo(() => new Animated.Value(0), []);
  const closeRotateAnim = useMemo(() => new Animated.Value(0), []);

  const dismiss = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSheetState("dismissed");
    Animated.parallel([
      Animated.timing(sheetAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 2100,
        useNativeDriver: true,
        easing: (t) => 1 - Math.pow(1 - t, 3),
      }),
      Animated.timing(closeRotateAnim, {
        toValue: 1,
        duration: 2100,
        useNativeDriver: true,
        easing: (t) => 1 - Math.pow(1 - t, 3),
      }),
    ]).start(() => {
      if (onDismiss) {
        onDismiss();
      } else {
        router.replace("/home");
      }
    });
  }, [sheetAnim, closeRotateAnim, onDismiss]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => {
          return (
            Math.abs(gesture.dy) > Math.abs(gesture.dx) &&
            gesture.dy > 0 &&
            sheetState !== "dismissed"
          );
        },
        onPanResponderMove: (_, gesture) => {
          if (sheetState !== "dismissed") {
            const next = Math.max(0, gesture.dy);
            sheetAnim.setValue(next);
          }
        },
        onPanResponderRelease: (_, gesture) => {
          if (sheetState !== "dismissed") {
            if (gesture.dy > 100 || gesture.vy > 0.4) {
              dismiss();
            } else {
              Animated.spring(sheetAnim, {
                toValue: 0,
                useNativeDriver: true,
                damping: 20,
                stiffness: 90,
              }).start();
            }
          }
        },
      }),
    [sheetState, sheetAnim, dismiss]
  );

  const sheetStyle = {
    transform: [
      {
        translateY: sheetAnim,
      } as any,
    ],
  } as any;

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.sheet, sheetStyle]} {...panResponder.panHandlers}>
        <View style={styles.headerRow}>
          <Pressable onPress={dismiss} hitSlop={8} style={styles.closeButton}>
            <Animated.Text
              style={[
                styles.closeText,
                {
                  transform: [
                    {
                      rotate: closeRotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "360deg"],
                      }),
                    },
                  ],
                } as any,
              ]}
            >
              ✕
            </Animated.Text>
          </Pressable>
          <View style={styles.handle} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.topSection}>
              <View style={styles.logoWrap}>
                <Image
                  source={images.appIcon}
                  style={styles.logo}
                  contentFit="contain"
                />
              </View>

              <Text style={styles.title}>Log in or sign up</Text>

              {flow.loading && (
                <ActivityIndicator size="small" color="#F97316" style={{ marginBottom: 16 }} />
              )}

              <View style={styles.form}>
                <TextInputBase
                  value={flow.identifier}
                  onChangeText={flow.setIdentifier}
                  editable={!flow.loading}
                />

                {flow.error && <Text style={styles.errorText}>{flow.error}</Text>}

                <View style={styles.buttonSpacer}>
                  {flow.loading ? (
                    <View style={styles.primaryButton}>
                      <Text style={styles.primaryButtonText}>Loading…</Text>
                    </View>
                  ) : (
                    <Pressable
                      onPress={flow.handleMagicLink}
                      disabled={!flow.canSubmit}
                      style={({ pressed }) => [
                        styles.primaryButton,
                        pressed && { opacity: 0.85 },
                        !flow.canSubmit && styles.primaryButtonDisabled,
                      ]}
                    >
                      <Text style={styles.primaryButtonText}>Continue</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.bottomSection}>
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialRow}>
                <Pressable
                  style={styles.socialButton}
                  onPress={() => flow.handleGoogleSignIn()}
                  disabled={flow.loading}
                >
                  <Image
                    source={images.googleG}
                    style={styles.googleIcon}
                    contentFit="contain"
                  />
                  <Text style={styles.socialBtnText}>Google</Text>
                </Pressable>

                <Pressable
                  style={styles.socialButton}
                  onPress={() => {}}
                  disabled={flow.loading}
                >
                  <Ionicons name="logo-apple" size={20} color={DARK} />
                  <Text style={styles.socialBtnText}>Apple</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
}

function TextInputBase({
  value,
  onChangeText,
  editable,
}: {
  value: string;
  onChangeText: (text: string) => void;
  editable: boolean;
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Pressable
      onPress={() => {}}
      style={[
        styles.inputWrap,
        isFocused && styles.inputWrapFocused,
      ]}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Phone number or email"
        placeholderTextColor="#A0AAB4"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={editable}
        style={styles.inputInner}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: SCREEN_HEIGHT,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: WHITE,
    paddingHorizontal: 24,
    paddingBottom: 48,
    zIndex: 1000,
    overflow: "hidden",
  },
  headerRow: {
    paddingTop: 40,
    paddingBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  handle: {
    position: "absolute",
    top: 32,
    left: "50%",
    marginLeft: -18,
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D6CFC7",
  },
  closeButton: {
    position: "absolute",
    right: 12,
    top: 24,
    paddingVertical: 8,
    paddingHorizontal: 12,
    zIndex: 1,
  },
  closeText: {
    fontSize: 16,
    fontWeight: "600",
    color: DARK,
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 48,
    flexGrow: 1,
    justifyContent: "center",
  },
  topSection: {
    width: "100%",
    alignItems: "center",
  },
  bottomSection: {
    width: "100%",
    alignItems: "center",
    marginTop: 24,
  },
  logoWrap: {
    marginBottom: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 96,
    height: 96,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: DARK,
    textAlign: "center",
    marginBottom: 24,
  },
  form: {
    width: "100%",
    gap: 16,
    marginBottom: 24,
  },
  inputWrap: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 14,
    paddingHorizontal: 16,
    minHeight: 52,
    backgroundColor: WHITE,
    justifyContent: "center",
  },
  inputWrapFocused: {
    borderColor: DARK,
  },
  inputInner: {
    fontSize: 15,
    fontWeight: "500",
    color: DARK,
    paddingVertical: Platform.select({ ios: 14, android: 10 }),
  },
  errorText: {
    color: "#E74C3C",
    fontSize: 13,
    marginBottom: 10,
    textAlign: "center",
  },
  buttonSpacer: {
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: ACCENT,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: WHITE,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 18,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  socialRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    width: "100%",
  },
  socialButton: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E0E5EA",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
    flex: 1,
    flexDirection: "row",
    gap: 10,
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  socialBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: DARK,
  },
});
