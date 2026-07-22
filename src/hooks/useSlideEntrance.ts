import { useMemo } from "react";
import { Animated, Easing } from "react-native";

type SlideDirection = "left" | "right" | "up";

type SlideAnim = {
  opacity: Animated.Value;
  translate: Animated.Value;
};

type UseSlideEntranceOptions = {
  /** Number of elements to stagger animate */
  count: number;
  /** Slide direction for all elements */
  direction?: SlideDirection;
  /** Delay before the first element animates (ms) */
  initialDelay?: number;
  /** Stagger delay between each element (ms) */
  staggerDelay?: number;
  /** Animation duration per element (ms) */
  duration?: number;
};

type UseSlideEntranceResult = {
  /** Array of animation objects, one per element index */
  anims: SlideAnim[];
  /** Trigger animations manually. Safe to call multiple times. */
  start: () => void;
};

/**
 * Staggered entrance animation for onboarding screens.
 *
 * Each element slides in from the chosen side with a staggered delay.
 * Defaults: slide from bottom, 80ms stagger, 420ms duration.
 *
 * Usage:
 *   const { anims, start } = useSlideEntrance({ count: options.length });
 *   useEffect(() => { start(); }, [start]);
 *
 *   {options.map((opt, i) => (
 *     <Animated.View key={i} style={{ opacity: anims[i].opacity, transform: [{ translateY: anims[i].translate }] }}>
 *       ...
 *     </Animated.View>
 *   ))}
 */
export function useSlideEntrance({
  count,
  direction = "up",
  initialDelay = 120,
  staggerDelay = 80,
  duration = 420,
}: UseSlideEntranceOptions): UseSlideEntranceResult {
  const anims = useMemo(() => {
    const result: SlideAnim[] = [];
    for (let i = 0; i < count; i++) {
      result.push({
        opacity: new Animated.Value(0),
        translate: new Animated.Value(i === 0 ? 0 : direction === "up" ? 18 : direction === "left" ? -18 : 18),
      });
    }
    return result;
  }, [count, direction]);

  const start = useMemo(() => {
    return () => {
      Animated.sequence([
        Animated.delay(initialDelay),
        Animated.stagger(
          staggerDelay,
          anims.map((anim) =>
            Animated.parallel([
              Animated.timing(anim.opacity, {
                toValue: 1,
                duration,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }),
              Animated.timing(anim.translate, {
                toValue: 0,
                duration,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }),
            ]),
          ),
        ),
      ]).start();
    };
  }, [anims, initialDelay, staggerDelay, duration]);

  return { anims, start };
}
