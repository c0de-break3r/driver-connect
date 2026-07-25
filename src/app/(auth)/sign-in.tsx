import { Image } from "expo-image";
import { Href, router, useLocalSearchParams } from "expo-router";
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
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import {
    AuthBackButton,
    AuthFooter,
    AuthInput,
    AuthSocialButtons,
    PrimaryButton,
} from "@/components/ui";
import { images } from "@/constants/images";
import { useSignInFlow } from "@/hooks/useSignInFlow";
import { useStaggeredEntrance } from "@/hooks/useStaggeredEntrance";

export default function SignIn() {
  const entrance = useStaggeredEntrance();
  const flow = useSignInFlow();
  const params = useLocalSearchParams<{ from?: string }>();
  const fromWelcome = params.from === "welcome";
  const fromDriverIdentity = params.from === "driver-identity";
  const fromForgotPassword = params.from === "forgot-password";
  const signInOnly = fromWelcome || fromDriverIdentity || fromForgotPassword;

  const backTarget: "welcome" | "identity" | "forgot-password" = fromDriverIdentity
    ? "identity"
    : fromForgotPassword
      ? "forgot-password"
      : "welcome";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF8F3" }} edges={["top"]}>
      <AuthBackButton opacity={entrance.headerOpacity} goBack={backTarget} />

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
            {
              opacity: entrance.iconOpacity,
              transform: [{ scale: entrance.iconScale }],
            },
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
            styles.form,
            {
              opacity: entrance.formOpacity,
              transform: [{ translateY: entrance.formTranslateY }],
            },
          ]}
        >
          <AuthInput
            label="Email"
            value={flow.email}
            onChangeText={flow.setEmail}
            placeholder="Email"
            keyboardType="email-address"
            icon={<Ionicons name="mail-outline" size={18} color="#6E7E91" />}
          />

          <AuthInput
            label="Password"
            value={flow.password}
            onChangeText={flow.setPassword}
            placeholder="Password"
            secure
            icon={<Ionicons name="lock-closed-outline" size={18} color="#6E7E91" />}
          />

          <Pressable
            style={styles.forgotWrap}
            hitSlop={8}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              const href: Href = fromWelcome
                ? "/(auth)/forgot-password?from=welcome"
                : fromDriverIdentity
                  ? "/(auth)/forgot-password?from=driver-identity"
                  : "/(auth)/forgot-password?from=forgot-password";
              router.push(href);
            }}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>

          <View style={styles.buttonSpacer}>
            {flow.loading ? (
              <ActivityIndicator size="large" color="#2C3E5B" />
            ) : (
              <PrimaryButton
                title="Continue"
                onPress={flow.handleSubmit}
                disabled={!flow.canSubmit}
                style={{ width: "100%" }}
              />
            )}
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: entrance.footerOpacity }}>
          <AuthSocialButtons
            loading={flow.googleLoading}
            onGooglePress={flow.handleGoogleSignIn}
          />
        </Animated.View>

        {!signInOnly && (
          <Animated.View style={{ opacity: entrance.footerOpacity }}>
            <AuthFooter variant="sign-up-link" from={undefined} />
          </Animated.View>
        )}
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
  form: {
    gap: 18,
    marginTop: 8,
  },
  forgotWrap: {
    alignItems: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2C3E5B",
  },
  buttonSpacer: {
    marginTop: 8,
  },
});
