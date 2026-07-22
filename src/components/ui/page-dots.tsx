import { useEffect, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";

type PageDotsProps = {
  /** Total number of pages/steps */
  total: number;
  /** Current page index (0-based) */
  current: number;
};

const VISIBLE_DOTS = 5;
const DOT_SIZE = 8;
const ACTIVE_WIDTH = 24;
const INACTIVE_WIDTH = DOT_SIZE;
const DOT_GAP = 4;

/**
 * Pagination dot indicator — 5 connected dots with a sliding window.
 *
 * Shows exactly 5 dots that touch each other (no gap). The active dot
 * is wider (pill-shaped) and centered. When the current index moves
 * beyond the visible window, the dots animate to reappear one after
 * the other in a smooth cycle.
 *
 * Reference: image-reference/onboarding/onboarding03–07.jpg
 */
export function PageDots({ total, current }: PageDotsProps) {
  // Compute the window start so the active dot is centered when possible
  const windowStart = computeWindowStart(current, total);

  return (
    <View style={styles.container}>
      {Array.from({ length: VISIBLE_DOTS }).map((_, slotIndex) => {
        const absoluteIndex = (windowStart + slotIndex) % total;
        const isActive = absoluteIndex === current;
        return (
          <Dot key={slotIndex} isActive={isActive} slotIndex={slotIndex} />
        );
      })}
    </View>
  );
}

function computeWindowStart(current: number, total: number): number {
  if (total <= VISIBLE_DOTS) return 0;
  const halfWindow = Math.floor(VISIBLE_DOTS / 2);
  let start = current - halfWindow;
  if (start < 0) start = 0;
  if (start > total - VISIBLE_DOTS) start = total - VISIBLE_DOTS;
  return start;
}

function Dot({ isActive }: { isActive: boolean; slotIndex: number }) {
  const [widthAnim] = useState(() => new Animated.Value(isActive ? ACTIVE_WIDTH : INACTIVE_WIDTH));

  useEffect(() => {
    Animated.spring(widthAnim, {
      toValue: isActive ? ACTIVE_WIDTH : INACTIVE_WIDTH,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();
  }, [isActive, widthAnim]);

  return (
    <Animated.View
      style={[
        styles.dot,
        isActive ? styles.dotActive : styles.dotInactive,
        { width: widthAnim },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: DOT_GAP,
    paddingVertical: 16,
  },
  dot: {
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  dotActive: {
    backgroundColor: "#2C3E5B",
  },
  dotInactive: {
    backgroundColor: "#D1D5DB",
  },
});
