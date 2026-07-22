import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import { PageDots, PrimaryButton, ScreenContainer } from "@/components/ui";

export type DriverStepShellProps = {
  /** 0-based step index in the 14-step driver flow. */
  stepIndex: number;
  /** Screen title. */
  title: string;
  /** Short explanatory sentence (centered between title and children). */
  description: string;
  /** Optional additional styles for the description text. */
  descriptionStyle?: object;
  /** Primary CTA label. */
  buttonTitle?: string;
  /** Whether the primary button is disabled. */
  buttonDisabled?: boolean;
  /** Called when the user taps the primary button. */
  onContinue: () => void;
  /** Optional custom back handler. Defaults to router.back(). */
  onBack?: () => void;
  /** Screen body content rendered below the description. */
  children: React.ReactNode;
};

const TOTAL_STEPS = 16;

/**
 * Shared shell for the driver onboarding steps.
 *
 * Provides the standard top bar (back arrow + progress dots), a centered
 * title/description, an animated content area, and a sticky navy Continue CTA.
 */
export function DriverStepShell({
  stepIndex,
  title,
  description,
  descriptionStyle,
  buttonTitle = "Continue",
  buttonDisabled = false,
  onContinue,
  onBack,
  children,
}: DriverStepShellProps) {
  const contentOpacity = useMemo(() => new Animated.Value(0), []);
  const contentY = useMemo(() => new Animated.Value(20), []);
  const footerOpacity = useMemo(() => new Animated.Value(0), []);
  const footerY = useMemo(() => new Animated.Value(20), []);

  useFocusEffect(
    useCallback(() => {
      contentOpacity.setValue(0);
      contentY.setValue(20);
      footerOpacity.setValue(0);
      footerY.setValue(20);

      Animated.parallel([
        Animated.sequence([
          Animated.delay(100),
          Animated.parallel([
            Animated.timing(contentOpacity, {
              toValue: 1,
              duration: 450,
              useNativeDriver: true,
            }),
            Animated.timing(contentY, {
              toValue: 0,
              duration: 450,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.sequence([
          Animated.delay(350),
          Animated.parallel([
            Animated.timing(footerOpacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(footerY, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start();
    }, [contentOpacity, contentY, footerOpacity, footerY]),
  );

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  const handleContinue = () => {
    if (buttonDisabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    onContinue();
  };

  return (
    <ScreenContainer>
      <View style={styles.screen}>
        {/* ── Top bar ── */}
        <View style={styles.topBar}>
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>
          <View style={styles.dotsWrap}>
            <PageDots total={TOTAL_STEPS} current={stepIndex} />
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* ── Content ── */}
        <Animated.View
          style={[
            styles.body,
            { opacity: contentOpacity, transform: [{ translateY: contentY }] },
          ]}
        >
          <Text style={styles.title}>{title}</Text>
          <Text style={[styles.description, descriptionStyle]}>{description}</Text>
          <View style={styles.bodyContent}>{children}</View>
        </Animated.View>

        {/* ── Bottom CTA ── */}
        <Animated.View
          style={[
            styles.footer,
            { opacity: footerOpacity, transform: [{ translateY: footerY }] },
          ]}
        >
          <PrimaryButton
            title={buttonTitle}
            onPress={handleContinue}
            disabled={buttonDisabled}
            style={{ width: "100%" }}
          />
        </Animated.View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    fontSize: 24,
    color: "#2C3E5B",
    fontWeight: "300",
    marginTop: -2,
  },
  dotsWrap: {
    flex: 1,
  },
  body: {
    flex: 1,
    marginTop: 16,
    justifyContent: "space-between",
    alignItems: "center",
  },
  bodyContent: {
    width: "100%",
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#2C3E5B",
    textAlign: "center",
    lineHeight: 34,
  },
  description: {
    fontSize: 14,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  footer: {
    gap: 12,
  },
});
