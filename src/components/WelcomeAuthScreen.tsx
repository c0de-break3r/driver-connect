import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
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
import { Svg, Circle } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { images } from "@/constants/images";
import { useAuthEntryFlow } from "@/hooks/useAuthEntryFlow";
import { useAuth } from "@/contexts/AuthProvider";

const SCREEN_HEIGHT = Dimensions.get("window").height;

const ACCENT = "#2C3E5B";
const DARK = "#2C3E5B";
const WHITE = "#FFFFFF";

function Avatar({ name }: { name?: string }) {
  const letter = name ? name.charAt(0).toUpperCase() : "?";
  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{letter}</Text>
    </View>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function SwingDotsLoader({ color = DARK, dotSize = 6, containerSize = 32 }: { color?: string; dotSize?: number; containerSize?: number } = {}) {
  return (
    <View style={{ width: containerSize, height: containerSize, alignItems: "center", justifyContent: "center" }}>
      <Svg viewBox="0 0 240 240" width={containerSize} height={containerSize}>
        <AnimatedCircle
          cx="120"
          cy="120"
          r="35"
          fill="none"
          stroke={color}
          strokeWidth={dotSize}
          strokeDasharray={"0 220"}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

function ButtonLoadingIndicator({ color = WHITE, size = 20 }: { color?: string; size?: number } = {}) {
  return <SwingDotsLoader color={color} dotSize={size * 0.35} containerSize={size * 1.6} />;
}

export default function WelcomeAuthScreen({ onDismiss }: { onDismiss?: () => void }) {
  const flow = useAuthEntryFlow();
  const { signedIn, isLoaded } = useAuth();
  const [sheetState, setSheetState] = useState<"open" | "dismissed">("open");
  const sheetAnim = useMemo(() => new Animated.Value(0), []);
  const closeRotateAnim = useMemo(() => new Animated.Value(0), []);
  const fadeAnim = useMemo(() => new Animated.Value(1), []);
  const scrollAtTopRef = useRef(true);

  useEffect(() => {
    if (isLoaded && signedIn && sheetState !== "dismissed") {
      dismiss();
    }
  }, [isLoaded, signedIn]);

  const dismiss = useCallback(() => {
    if (sheetState === "dismissed") return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSheetState("dismissed");
    Animated.parallel([
      Animated.timing(sheetAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 380,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
      Animated.timing(closeRotateAnim, {
        toValue: 1,
        duration: 380,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
    ]).start(() => {
      if (onDismiss) {
        onDismiss();
      } else {
        router.replace("/home");
      }
    });
  }, [sheetAnim, closeRotateAnim, fadeAnim, onDismiss, sheetState]);

  const goBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    flow.reset();
  }, [flow]);

  const switchUser = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    flow.reset();
  }, [flow]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gesture) => {
          if (sheetState === "dismissed") return false;
          const isVertical = Math.abs(gesture.dy) > Math.abs(gesture.dx);
          if (!isVertical) return false;
          if (scrollAtTopRef.current || gesture.dy > 0) {
            return true;
          }
          return false;
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
                damping: 22,
                stiffness: 110,
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
    opacity: fadeAnim,
  } as any;

  const isVerifyStep = flow.step === "verify";

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.sheet, sheetStyle]} {...panResponder.panHandlers}>
        {!isVerifyStep && (
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
        )}

        {isVerifyStep && (
          <View style={styles.verifyHeaderRow}>
            <Pressable onPress={goBack} hitSlop={8} style={styles.iconButton}>
              <Ionicons name="arrow-back" size={22} color={DARK} />
            </Pressable>
            <Pressable onPress={dismiss} hitSlop={8} style={styles.iconButton}>
              <Ionicons name="close" size={22} color={DARK} />
            </Pressable>
          </View>
        )}

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
        >
          {isVerifyStep ? (
            <View style={styles.verifyContainer}>
               <ScrollView
                 contentContainerStyle={styles.verifyContent}
                 showsVerticalScrollIndicator={false}
                 keyboardShouldPersistTaps="handled"
                 onScroll={(e) => {
                   scrollAtTopRef.current = e.nativeEvent.contentOffset.y <= 0;
                 }}
                 scrollEventThrottle={16}
               >

                  <Text style={styles.verifyTitle}>Confirm it&apos;s you</Text>
                 <Text style={styles.verifySubtitle}>
                   We sent a code to {flow.identifier}
                 </Text>

                 <View style={styles.otpWrap}>
                   <TextInput
                     value={flow.otp}
                     onChangeText={flow.setOtp}
                     editable={!flow.loading}
                     autoCapitalize="none"
                     keyboardType="number-pad"
                     maxLength={6}
                     style={styles.otpInput}
                     placeholder="------"
                     placeholderTextColor="#9CA3AF"
                   />
                 </View>

                  {flow.error && <Text style={styles.errorText}>{flow.error}</Text>}

                  <View style={styles.verifyButtonSpacer}>
                    <Pressable
                      onPress={flow.handleVerifyCode}
                      disabled={!flow.canVerify || flow.loading}
                      style={({ pressed }) => [
                        styles.verifyPrimaryButton,
                        pressed && { opacity: 0.85 },
                        (!flow.canVerify || flow.loading) && styles.primaryButtonDisabled,
                      ]}
                    >
                      {flow.loading ? (
                        <ButtonLoadingIndicator />
                      ) : (
                        <Text style={styles.primaryButtonText}>Verify</Text>
                      )}
                    </Pressable>
                  </View>

                 <View style={styles.resendRow}>
                    <Text style={styles.resendText}>Didn&apos;t get it? </Text>
                   {flow.resendCooldown > 0 ? (
                     <Text style={styles.resendLink}>Resend in {flow.resendCooldown}s</Text>
                   ) : (
                     <Pressable onPress={flow.handleSendCode} disabled={flow.loading}>
                       {flow.loading ? (
                         <View style={styles.resendLoadingWrap}>
                           <ButtonLoadingIndicator size={16} color={DARK} />
                         </View>
                       ) : (
                         <Text style={[styles.resendLink, styles.resendLinkActive]}>Send a new code</Text>
                       )}
                     </Pressable>
                   )}
                 </View>
               </ScrollView>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              onScroll={(e) => {
                scrollAtTopRef.current = e.nativeEvent.contentOffset.y <= 0;
              }}
              scrollEventThrottle={16}
            >
              {flow.recognizedUser ? (
                <View style={styles.welcomeBackContent}>
                  <Avatar name={flow.recognizedUser.firstName} />
                  <Text style={styles.welcomeTitle}>
                    Welcome back, {flow.recognizedUser.firstName}
                  </Text>
                  <View style={styles.welcomeEmailRow}>
                    <Ionicons name="mail-outline" size={18} color="#6B7280" />
                    <Text style={styles.welcomeEmail}>
                      {flow.identifier}
                    </Text>
                  </View>
                  <Text style={styles.welcomeSubtitle}>
                    We may email or text you a code to log you in.
                  </Text>
                  <View style={styles.buttonSpacer}>
                    <Pressable
                      onPress={flow.handleLogin}
                      disabled={flow.loadingProvider === "email" && flow.loading}
                      style={({ pressed }) => [
                        styles.primaryButton,
                        pressed && { opacity: 0.85 },
                        flow.loadingProvider === "email" && flow.loading && styles.primaryButtonDisabled,
                      ]}
                    >
                      {flow.loadingProvider === "email" && flow.loading ? (
                        <ButtonLoadingIndicator />
                      ) : (
                        <Text style={styles.primaryButtonText}>Log in</Text>
                      )}
                    </Pressable>
                  </View>
                  <Pressable onPress={switchUser} disabled={flow.loading} style={styles.notYouButton}>
                    {flow.loading ? (
                      <ButtonLoadingIndicator size={16} color={DARK} />
                    ) : (
                      <Text style={[styles.notYouText, flow.loading && styles.notYouTextDisabled]}>Not you?</Text>
                    )}
                  </Pressable>
                </View>
              ) : (
                <>
                  <View style={styles.topSection}>
                    <View style={styles.logoWrap}>
                      <Image
                        source={images.appIcon}
                        style={styles.logo}
                        contentFit="contain"
                      />
                    </View>

                    <Text style={styles.title}>Log in or sign up</Text>

                    <View style={styles.form}>
                      <TextInputBase
                        value={flow.identifier}
                        onChangeText={flow.setIdentifier}
                        editable={!flow.loading}
                        autoCapitalize="none"
                        keyboardType={flow.identifier.includes("@") && flow.identifier.includes(".") ? "email-address" : "default"}
                      />
                      {flow.error && <Text style={styles.errorText}>{flow.error}</Text>}
                      <View style={styles.buttonSpacer}>
                      <Pressable
                        onPress={flow.handleSendCode}
                        disabled={!flow.canSubmit || flow.loading}
                        style={({ pressed }) => [
                          styles.primaryButton,
                          pressed && { opacity: 0.85 },
                          (!flow.canSubmit || flow.loading) && styles.primaryButtonDisabled,
                        ]}
                      >
                        {flow.loadingProvider === "email" && flow.loading ? (
                          <ButtonLoadingIndicator />
                        ) : (
                          <Text style={styles.primaryButtonText}>Continue</Text>
                        )}
                      </Pressable>
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
                          onPress={flow.handleGoogleSignIn}
                          disabled={flow.loading}
                          style={({ pressed }) => [
                            styles.socialButton,
                            pressed && { opacity: 0.85 },
                            flow.loading && styles.primaryButtonDisabled,
                          ]}
                        >
                          {flow.loadingProvider === "google" && flow.loading ? (
                            <View style={styles.socialLoadingWrap}>
                              <ButtonLoadingIndicator size={18} color={DARK} />
                            </View>
                          ) : (
                            <>
                              <Image
                                source={images.googleG}
                                style={styles.googleIcon}
                                contentFit="contain"
                              />
                              <Text style={styles.socialBtnText}>Google</Text>
                            </>
                          )}
                        </Pressable>

                        <Pressable
                          onPress={flow.handleAppleSignIn}
                          disabled={flow.loading}
                          style={({ pressed }) => [
                            styles.socialButton,
                            pressed && { opacity: 0.85 },
                            flow.loading && styles.primaryButtonDisabled,
                          ]}
                        >
                          {flow.loadingProvider === "apple" && flow.loading ? (
                            <View style={styles.socialLoadingWrap}>
                              <ButtonLoadingIndicator size={18} color={DARK} />
                            </View>
                          ) : (
                            <>
                              <Ionicons name="logo-apple" size={20} color={DARK} />
                              <Text style={styles.socialBtnText}>Apple</Text>
                            </>
                          )}
                        </Pressable>
                      </View>

                  </View>
                </>
              )}
            </ScrollView>
          )}
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
}

function TextInputBase({
  value,
  onChangeText,
  editable,
  autoCapitalize = "none",
  keyboardType = "default",
  maxLength,
}: {
  value: string;
  onChangeText: (text: string) => void;
  editable: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address" | "number-pad";
  maxLength?: number;
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
        placeholder={maxLength ? "------" : "Phone number or email"}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        editable={editable}
        maxLength={maxLength}
        style={styles.inputInner}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: SCREEN_HEIGHT,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#FFFFFF",
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
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 16,
    minHeight: 52,
    backgroundColor: "#FFFFFF",
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
  successText: {
    color: "#16A34A",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
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
    overflow: "hidden",
  },
  verifyPrimaryButton: {
    backgroundColor: ACCENT,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
    overflow: "hidden",
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
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
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
  verifyContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  verifyHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 40,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  iconButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  verifyContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  verifyTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: DARK,
    textAlign: "center",
    marginBottom: 12,
  },
  verifySubtitle: {
    fontSize: 15,
    fontWeight: "400",
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  otpWrap: {
    width: "100%",
    maxWidth: 320,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    minHeight: 52,
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginBottom: 20,
  },
  otpInput: {
    fontSize: 15,
    fontWeight: "500",
    color: DARK,
    paddingVertical: Platform.select({ ios: 14, android: 10 }),
    letterSpacing: 6,
    textAlign: "center",
  },
  resendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  resendText: {
    fontSize: 14,
    color: "#6B7280",
  },
  resendLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
    textDecorationLine: "underline",
  },
  resendLinkActive: {
    color: DARK,
  },
  verifyButtonSpacer: {
    marginTop: 20,
    width: "100%",
    maxWidth: 320,
  },
  welcomeBackContent: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 48,
    flexGrow: 1,
    justifyContent: "center",
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#EEECFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  avatarText: {
    fontSize: 34,
    fontWeight: "700",
    color: "#4F46E5",
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: DARK,
    textAlign: "center",
    marginBottom: 16,
  },
  welcomeEmailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
  },
  welcomeEmail: {
    fontSize: 15,
    fontWeight: "500",
    color: "#374151",
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  notYouText: {
    fontSize: 14,
    fontWeight: "600",
    color: DARK,
    textDecorationLine: "underline",
    marginTop: 16,
  },
  socialLoadingWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  resendLoadingWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  notYouButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: "center",
  },
  notYouTextDisabled: {
    opacity: 0.6,
  },
});
