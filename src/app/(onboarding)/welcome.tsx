import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router, type Href } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ImageSourcePropType } from "react-native";
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { PrimaryButton, ScreenContainer } from "@/components/ui";
import { images } from "@/constants/images";
import { useOnboardingAnswersStore } from "@/store/useOnboardingAnswersStore";

/** Update a timestamp ref to now (extracted to keep gesture callbacks pure). */
function stampRef(ref: React.MutableRefObject<number>) {
  ref.current = Date.now();
}

/**
 * Welcome carousel — 4 slides with crossfade transitions.
 *
 * Layout:
 * - Peach background (#FFF8F3) fills the screen
 * - Hero image fills top portion with rounded bottom corners
 * - Pagination dots sit at the bottom of the image
 * - Headline, subtext, and CTA are below the image on the peach background
 * - Terms text sits below the CTA on the peach background
 * - Sign-in link sits at the very bottom on peach background
 * - Auto-advance every 4 s, loops from last slide back to first
 * - Manual swipe + dot-tap navigation with smooth crossfade
 *
 * Reference: image-reference/onboarding/onboarding02.jpg
 * Slide images: welcome1–4, welcome6 (welcome5 reserved for assistance)
 */

type Slide = {
  image: ImageSourcePropType;
  headline: string;
  subtext: string;
};

const SLIDES: Slide[] = [
  {
    image: images.welcome1,
    headline: "Your Journey\nStarts Here",
    subtext: "Connect with trusted drivers across Africa",
  },
  {
    image: images.welcome2,
    headline: "Trusted\nConnections",
    subtext: "Every driver is verified and background-checked",
  },
  {
    image: images.welcome3,
    headline: "Book With\nConfidence",
    subtext: "Easy booking, fair prices and reliable service ",
  },
  {
    image: images.welcome6,
    headline: "Professional\nDrivers",
    subtext: "Experienced, vetted professionals at your service",
  },
  {
    image: images.welcome4,
    headline: "Ready\nto Go?",
    subtext: "Join thousands of riders and drivers today",
  },
];

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

/** Pause auto-advance for this long after a user interaction */
const PAUSE_DURATION = 4000;

/** Crossfade duration in ms */
const FADE_DURATION = 400;

/** Minimum horizontal swipe distance to trigger a slide change */
const SWIPE_THRESHOLD = 50;

const ORANGE = "#FF7B54";

/**
 * Render a headline with the part after `\n` in orange.
 * Special case: "Ready\nto Go?" keeps "to " navy and only "Go" orange.
 */
function renderHeadline(text: string) {
  const parts = text.split("\n");
  if (parts.length === 1) return <>{text}</>;

  // Special case: "Ready\nto Go?" → navy "to ", orange "Go", navy "?"
  if (parts[0] === "Ready" && parts[1] === "to Go?") {
    return (
      <>
        {"Ready"}
        {"\n"}
        {"to "}
        <Text style={{ color: ORANGE }}>Go?</Text>
      </>
    );
  }

  return (
    <>
      {parts[0]}
      {"\n"}
      <Text style={{ color: ORANGE }}>{parts[1]}</Text>
    </>
  );
}

export default function Welcome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideOpacities = useMemo(
    () => SLIDES.map(() => new Animated.Value(0)),
    [],
  );

  // ── Auto-swipe refs ──
  const isTouching = useRef(false);
  const lastInteractionTime = useRef<number>(0);

  // ── Entrance animations (headline + subtext only) ──
  const headlineOpacity = useMemo(() => new Animated.Value(0), []);
  const headlineY = useMemo(() => new Animated.Value(20), []);
  const subtextOpacity = useMemo(() => new Animated.Value(0), []);
  const subtextY = useMemo(() => new Animated.Value(15), []);

  // ── Crossfade on slide change ──
  const prevSlideRef = useRef(0);

  const crossfade = useCallback(
    (from: number, to: number) => {
      Animated.timing(slideOpacities[from], {
        toValue: 0,
        duration: FADE_DURATION,
        useNativeDriver: true,
      }).start();
      Animated.timing(slideOpacities[to], {
        toValue: 1,
        duration: FADE_DURATION,
        useNativeDriver: true,
      }).start();
    },
    [slideOpacities],
  );

  // Show first slide on mount
  useEffect(() => {
    slideOpacities[0].setValue(1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const animateText = useCallback(() => {
    headlineOpacity.setValue(0);
    headlineY.setValue(20);
    subtextOpacity.setValue(0);
    subtextY.setValue(15);

    Animated.parallel([
      Animated.sequence([
        Animated.delay(100),
        Animated.parallel([
          Animated.timing(headlineOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(headlineY, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.sequence([
        Animated.delay(300),
        Animated.parallel([
          Animated.timing(subtextOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(subtextY, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  }, [headlineOpacity, headlineY, subtextOpacity, subtextY]);

  // Crossfade + text animation on slide change
  useEffect(() => {
    crossfade(prevSlideRef.current, currentSlide);
    prevSlideRef.current = currentSlide;
    animateText();
  }, [currentSlide, crossfade, animateText]);

  // ── Auto-redirect disabled - causes navigation confusion ──

  // ── Auto-advance timer (loops) ──
  useEffect(() => {
    lastInteractionTime.current = Date.now();
    const id = setInterval(() => {
      if (isTouching.current) return;
      if (Date.now() - lastInteractionTime.current < PAUSE_DURATION) return;

      setCurrentSlide((prev) => {
        const next = (prev + 1) % SLIDES.length;
        lastInteractionTime.current = Date.now();
        return next;
      });
    }, 6000);

    return () => clearInterval(id);
  }, []);

  // ── Swipe gesture handler ──
  /* eslint-disable react-hooks/refs -- PanResponder callbacks are event handlers, not render. */
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 20 && Math.abs(gesture.dy) < 40,
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx < -SWIPE_THRESHOLD) {
            // Swipe left → next
            setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
            stampRef(lastInteractionTime);
          } else if (gesture.dx > SWIPE_THRESHOLD) {
            // Swipe right → prev
            setCurrentSlide(
              (prev) => (prev - 1 + SLIDES.length) % SLIDES.length,
            );
            stampRef(lastInteractionTime);
          }
        },
      }),
    [],
  );
  /* eslint-enable react-hooks/refs */

  const handleLetsGo = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    useOnboardingAnswersStore.getState().setLastCompletedScreen("welcome");
    router.push("/(onboarding)/role-question" as Href);
  };

  const slide = SLIDES[currentSlide];

  return (
    <ScreenContainer>
      <View style={styles.outerContainer}>
        {/* ── Swipeable carousel content ── */}
        <View style={styles.swipeLayer} {...panResponder.panHandlers}>
        {/* ── Image section with dots ── */}
        <View style={styles.imageSection}>
          {/* ── Stacked hero images with crossfade ── */}
          <View style={styles.imageContainer} pointerEvents="none">
            {SLIDES.map((s, i) => (
              <Animated.View
                key={i}
                style={[StyleSheet.absoluteFill, { opacity: slideOpacities[i] }]}
              >
                <Image
                  source={s.image}
                  style={styles.heroImage}
                  contentFit="cover"
                />
              </Animated.View>
            ))}
          </View>

          {/* ── Pagination dots at bottom of image ── */}
          <View style={styles.dotsOnImage}>
            {SLIDES.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentSlide && styles.dotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* ── Text below image on peach background ── */}
        <View style={styles.textBelowImage}>
          <Animated.Text
            style={[
              styles.headline,
              {
                opacity: headlineOpacity,
                transform: [{ translateY: headlineY }],
              },
            ]}
          >
            {renderHeadline(slide.headline)}
          </Animated.Text>

          <Animated.Text
            style={[
              styles.subtext,
              {
                opacity: subtextOpacity,
                transform: [{ translateY: subtextY }],
              },
            ]}
          >
            {slide.subtext}
          </Animated.Text>

          <PrimaryButton
            title="Let's Go"
            onPress={handleLetsGo}
            style={{ width: "100%" }}
          />
        </View>
      </View>

      {/* ── Static footer - not part of the carousel ── */}
      <View style={styles.footer}>
        <Text style={styles.terms}>
          By continuing you accept our{" "}
          <Text style={styles.termsLink}>Terms of Use</Text> and{" "}
          <Text style={styles.termsLink}>Privacy Notice</Text>
        </Text>
        <Pressable onPress={() => router.push("/(auth)/sign-in" as Href)}>
          <Text style={styles.signInText}>
            Already have an account?{" "}
            <Text style={styles.signInLink}>Sign in</Text>
          </Text>
        </Pressable>
      </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  /* ── Outer container ── */
  outerContainer: {
    flex: 1,
  },

  /* ── Swipe gesture layer ── */
  swipeLayer: {
    flex: 1,
  },

  /* ── Image section ── */
  imageSection: {
    height: SCREEN_HEIGHT * 0.58,
    position: "relative",
  },
  imageContainer: {
    ...StyleSheet.absoluteFill,
  },
  heroImage: {
    width: "100%",
    height: "100%",
    borderRadius: 32,
    top: 10,
  },

  /* ── Text below image on peach background ── */
  textBelowImage: {
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 12,
  },

  /* ── Typography ── */
  headline: {
    fontSize: 34,
    fontWeight: "800",
    color: "#2C3E5B",
    textAlign: "center",
    lineHeight: 42,
  },
  subtext: {
    fontSize: 16,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 24,
  },

  /* ── Pagination dots at bottom of image ── */
  dotsOnImage: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  dotActive: {
    width: 24,
    backgroundColor: "#FFFFFF",
  },

  /* ── Footer below image ── */
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 24,
    gap: 10,
    alignItems: "center",
  },
  terms: {
    fontSize: 10,
    color: "#6E7E91",
    textAlign: "center",
    lineHeight: 16,
  },
  termsLink: {
    color: "#2C3E5B",
    fontWeight: "600",
  },
  signInText: {
    fontSize: 14,
    color: "#6E7E91",
  },
  signInLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2C3E5B",
  },
});
