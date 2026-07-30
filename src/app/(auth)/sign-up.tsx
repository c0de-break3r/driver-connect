import { Image } from "expo-image";
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

import {
    AuthBackButton,
    AuthFooter,
    AuthInput,
    PrimaryButton,
} from "@/components/ui";
import { images } from "@/constants/images";
import { useSignUpFlow } from "@/hooks/useSignUpFlow";
import { useStaggeredEntrance } from "@/hooks/useStaggeredEntrance";

export default function SignUp() {
  const entrance = useStaggeredEntrance();
  const flow = useSignUpFlow();
<<<<<<< HEAD
  const params = useLocalSearchParams<{ from?: string }>();
  const fromDriverIdentity = params.from === "driver-identity";

  const backTarget: "welcome" | "identity" = fromDriverIdentity ? "identity" : "welcome";
=======
>>>>>>> 33eb3cd (updates)

  if (flow.pendingVerification) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF8F3" }} edges={["top"]}>
        <AuthBackButton opacity={entrance.headerOpacity} goBack={() => flow.setPendingVerification(false)} />

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
              styles.header,
              { opacity: entrance.headerOpacity },
            ]}
          >
            <Text style={styles.title}>Check your email</Text>
            <Text style={styles.subtitle}>
              We sent a verification code to{"\n"}
              <Text style={styles.emailHighlight}>{flow.email}</Text>
            </Text>
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
              label="Verification code"
              value={flow.code}
              onChangeText={flow.setCode}
              placeholder="Enter 6-digit code"
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />

            {flow.error && <Text style={styles.errorText}>{flow.error}</Text>}

            <View style={styles.buttonSpacer}>
              {flow.loading ? (
                <ActivityIndicator size="large" color="#2C3E5B" />
              ) : (
                <PrimaryButton
                  title="Verify Email"
                  onPress={flow.handleVerify}
                  disabled={flow.loading || !flow.canVerify}
                  style={{ width: "100%" }}
                />
              )}
            </View>

            <Pressable style={styles.textLink} onPress={flow.handleResendCode}>
              <Text style={styles.textLinkText}>
                Didn&apos;t get a code?{" "}
                <Text style={styles.textLinkBold}>Resend</Text>
              </Text>
            </Pressable>

            <Pressable
              style={styles.textLink}
              onPress={() => flow.setPendingVerification(false)}
            >
              <Text style={styles.textLinkText}>
                <Text style={styles.textLinkBold}>Change email</Text>
              </Text>
            </Pressable>
          </Animated.View>

          <View nativeID="clerk-captcha" />
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

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
            label="Full Name"
            value={flow.fullName}
            onChangeText={flow.setFullName}
            placeholder="Enter your full name"
            icon={<Ionicons name="person-outline" size={18} color="#6E7E91" />}
          />

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

          {flow.error && <Text style={styles.errorText}>{flow.error}</Text>}

          <View style={styles.buttonSpacer}>
            {flow.loading ? (
              <ActivityIndicator size="large" color="#2C3E5B" />
            ) : (
              <PrimaryButton
                title="Sign Up"
                onPress={flow.handleSubmit}
                disabled={!flow.canSubmit}
                style={{ width: "100%" }}
              />
            )}
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: entrance.footerOpacity }}>
<<<<<<< HEAD
          <AuthSocialButtons
            loading={flow.googleLoading}
            onGooglePress={flow.handleGoogleSignUp}
          />
        </Animated.View>

        {!fromDriverIdentity && (
          <Animated.View style={{ opacity: entrance.footerOpacity }}>
            <AuthFooter variant="sign-in-link" from={undefined} />
          </Animated.View>
        )}
=======
          <AuthFooter variant="sign-in-link" />
        </Animated.View>
>>>>>>> 33eb3cd (updates)

        <View nativeID="clerk-captcha" />
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
    marginBottom: 28,
  },
  iconImage: {
    width: 140,
    height: 140,
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A2E",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 20,
  },
  emailHighlight: {
    fontWeight: "600",
    color: "#2C3E5B",
  },
  form: {
    gap: 18,
    marginTop: 8,
  },
  errorText: {
    color: "#E74C3C",
    fontSize: 13,
    marginBottom: 12,
    textAlign: "center",
  },
  buttonSpacer: {
    marginTop: 8,
  },
  textLink: {
    alignItems: "center",
    paddingVertical: 8,
  },
  textLinkText: {
    fontSize: 14,
    color: "#6E7E91",
  },
  textLinkBold: {
    fontWeight: "600",
    color: "#2C3E5B",
  },
});
