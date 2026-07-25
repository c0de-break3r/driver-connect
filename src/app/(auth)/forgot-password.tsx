import { Image } from "expo-image";
import { router, type Href, useLocalSearchParams } from "expo-router";
import {
    ActivityIndicator,
    Animated,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import {
    AuthBackButton,
    AuthFooter,
    AuthInput,
} from "@/components/ui";
import { images } from "@/constants/images";
import { usePasswordReset } from "@/hooks/usePasswordReset";
import { useStaggeredEntrance } from "@/hooks/useStaggeredEntrance";

export default function ForgotPassword() {
  const entrance = useStaggeredEntrance();
  const reset = usePasswordReset();
  const params = useLocalSearchParams<{ from?: string }>();
  const from = params.from;

  const backToSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
    } else {
      const target: Href = from
        ? (`/(auth)/sign-in?from=${from}` as Href)
        : ("/(auth)/sign-in?from=forgot-password" as Href);
      router.replace(target);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF8F3" }} edges={["top"]}>
      <AuthBackButton
        opacity={entrance.headerOpacity}
        goBack={backToSignIn}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        <Animated.View
          style={[
            styles.iconWrap,
            { opacity: entrance.headerOpacity },
          ]}
        >
          <Image
            source={images.appIcon}
            style={styles.iconImage}
            contentFit="contain"
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.headlineWrap,
            {
              opacity: entrance.formOpacity,
              transform: [{ translateY: entrance.formTranslateY }],
            },
          ]}
        >
          <Text style={styles.title}>{reset.getTitle()}</Text>
          <Text style={styles.subtitle}>{reset.getSubtitle()}</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.form,
            {
              opacity: entrance.formOpacity,
              transform: [{ translateY: entrance.formTranslateY }],
            },
          ]}
        >
          {reset.phase === "email" && (
            <AuthInput
              label="Email"
              value={reset.email}
              onChangeText={reset.setEmail}
              placeholder="Email"
              keyboardType="email-address"
              editable={!reset.isFetching}
            />
          )}

          {reset.phase === "code" && (
            <>
              <AuthInput
                label="Verification code"
                value={reset.code}
                onChangeText={reset.setCode}
                placeholder="123456"
                keyboardType="number-pad"
                maxLength={6}
                editable={!reset.isFetching}
              />
              <Pressable
                onPress={reset.handleResendCode}
                disabled={reset.isFetching}
                hitSlop={8}
              >
                <Text style={styles.resendText}>Resend code</Text>
              </Pressable>
            </>
          )}

          {reset.phase === "password" && (
            <AuthInput
              label="New password"
              value={reset.password}
              onChangeText={reset.setPassword}
              placeholder="New password"
              secure
              editable={!reset.isFetching}
            />
          )}

          {reset.error && (
            <Text style={styles.errorText}>{reset.error}</Text>
          )}

          {reset.phase !== "success" && (
            <View style={styles.buttonSpacer}>
              {reset.isFetching ? (
                <ActivityIndicator size="large" color="#2C3E5B" />
              ) : (
                <Pressable
                  style={[
                    styles.primaryBtn,
                    reset.isActionDisabled && styles.primaryBtnDisabled,
                  ]}
                  onPress={reset.handleAction}
                  disabled={reset.isActionDisabled}
                >
                  <Text style={styles.primaryBtnText}>
                    {reset.getButtonLabel()}
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {reset.phase === "success" && (
            <View style={styles.buttonSpacer}>
              <Pressable
                style={styles.primaryBtn}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  backToSignIn();
                }}
              >
                <Text style={styles.primaryBtnText}>Sign in</Text>
              </Pressable>
            </View>
          )}
        </Animated.View>

        <Animated.View style={{ opacity: entrance.formOpacity }}>
          <AuthFooter variant="forgot-password-link" />
        </Animated.View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 40,
  },
  iconWrap: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconImage: {
    width: 120,
    height: 120,
  },
  headlineWrap: {
    alignItems: "center",
    marginBottom: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2C3E5B",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  form: {
    marginBottom: 28,
  },
  resendText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2C3E5B",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 12,
  },
  errorText: {
    color: "#E74C3C",
    fontSize: 13,
    marginBottom: 12,
    textAlign: "center",
  },
  buttonSpacer: {
    marginTop: 12,
  },
  primaryBtn: {
    backgroundColor: "#2C3E5B",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
