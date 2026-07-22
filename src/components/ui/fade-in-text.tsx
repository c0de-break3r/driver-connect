import { useEffect, useMemo } from "react";
import { Animated, StyleSheet, Text } from "react-native";

type FadeInTextProps = {
  /** Array of text lines to fade in one after another */
  lines: string[];
  /** Delay between each line's animation start (ms). Default: 300 */
  staggerMs?: number;
  /** Duration of each line's fade-in (ms). Default: 600 */
  durationMs?: number;
  /** Text style className applied to each line (NativeWind) */
  className?: string;
  /** Called after all lines have finished animating */
  onComplete?: () => void;
};

/**
 * Line-by-line fade-in text component.
 * Used across reflection / onboarding screens where text appears sequentially.
 *
 * Uses Animated.View with StyleSheet (AGENTS.md exception — dynamic animated values).
 */
export function FadeInText({
  lines,
  staggerMs = 300,
  durationMs = 600,
  className,
  onComplete,
}: FadeInTextProps) {
  const opacities = useMemo(
    () => lines.map(() => new Animated.Value(0)),
    [lines],
  );

  useEffect(() => {
    const animations = opacities.map((opacity, index) =>
      Animated.timing(opacity, {
        toValue: 1,
        duration: durationMs,
        delay: index * staggerMs,
        useNativeDriver: true,
      }),
    );

    Animated.parallel(animations).start(() => {
      onComplete?.();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {lines.map((line, index) => (
        <Animated.View key={index} style={{ opacity: opacities[index] }}>
          <Text style={styles.line} className={className}>
            {line}
          </Text>
        </Animated.View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  line: {
    textAlign: "center",
  },
});
