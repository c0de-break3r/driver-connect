import { useEffect, useMemo } from "react";
import { Animated } from "react-native";

/**
 * 4-layer staggered entrance animation shared across auth screens.
 *
 * Layers (with default delays):
 * 1. **header**  — back button / top bar (100ms delay)
 * 2. **icon**    — mascot / app icon with scale spring (200ms delay)
 * 3. **form**    — form inputs slide up + fade (400ms delay)
 * 4. **footer**  — social buttons / footer links (600ms delay)
 *
 * Each layer exposes an `opacity` Animated.Value (and `icon` also has `scale`).
 * `form` additionally exposes `translateY` for the slide-up effect.
 *
 * Usage:
 * ```tsx
 * const entrance = useStaggeredEntrance();
 * <Animated.View style={{ opacity: entrance.headerOpacity }}>...</Animated.View>
 * <Animated.View style={{ opacity: entrance.iconOpacity, transform: [{ scale: entrance.iconScale }] }}>
 *   <Image />
 * </Animated.View>
 * <Animated.View style={{ opacity: entrance.formOpacity, transform: [{ translateY: entrance.formTranslateY }] }}>
 *   <Form />
 * </Animated.View>
 * <Animated.View style={{ opacity: entrance.footerOpacity }}>...</Animated.View>
 * ```
 */
export function useStaggeredEntrance() {
  // Animated values — created once, stable across renders
  const headerOpacity = useMemo(() => new Animated.Value(0), []);
  const headerTranslateY = useMemo(() => new Animated.Value(20), []);
  const iconOpacity = useMemo(() => new Animated.Value(0), []);
  const iconScale = useMemo(() => new Animated.Value(0.85), []);
  const formOpacity = useMemo(() => new Animated.Value(0), []);
  const formTranslateY = useMemo(() => new Animated.Value(20), []);
  const footerOpacity = useMemo(() => new Animated.Value(0), []);
  const footerTranslateY = useMemo(() => new Animated.Value(20), []);

  useEffect(() => {
    Animated.parallel([
      // Layer 1: header / back button
      Animated.sequence([
        Animated.delay(100),
        Animated.parallel([
          Animated.timing(headerOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(headerTranslateY, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]),
      // Layer 2: icon / mascot with scale spring
      Animated.sequence([
        Animated.delay(200),
        Animated.parallel([
          Animated.timing(iconOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.spring(iconScale, {
            toValue: 1,
            tension: 50,
            friction: 9,
            useNativeDriver: true,
          }),
        ]),
      ]),
      // Layer 3: form fade + slide up
      Animated.sequence([
        Animated.delay(400),
        Animated.parallel([
          Animated.timing(formOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(formTranslateY, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]),
      // Layer 4: footer fade + slide up
      Animated.sequence([
        Animated.delay(600),
        Animated.parallel([
          Animated.timing(footerOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(footerTranslateY, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    headerOpacity,
    headerTranslateY,
    iconOpacity,
    iconScale,
    formOpacity,
    formTranslateY,
    footerOpacity,
    footerTranslateY,
  };
}
