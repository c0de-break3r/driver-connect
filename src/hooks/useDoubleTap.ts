import { useRef, useCallback } from "react";

type UseDoubleTapOptions = {
  /** Minimum ms between accepted taps. Default 600. */
  cooldownMs?: number;
};

type UseDoubleTapReturn<T extends (...args: any[]) => void> = (...args: Parameters<T>) => void;

/**
 * useDoubleTap
 * Returns an `onPress` handler that ignores taps that occur within `cooldownMs`
 * of the previous accepted tap. Useful for preventing double-submissions and
 * accidental double navigation.
 */
export function useDoubleTap<T extends (...args: any[]) => void>(onPress: T, options: UseDoubleTapOptions = {}): UseDoubleTapReturn<T> {
  const { cooldownMs = 600 } = options;
  const lastTapRef = useRef(0);

  const handlePress = useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastTapRef.current < cooldownMs) {
      return;
    }
    lastTapRef.current = now;
    onPress(...args);
  }, [onPress, cooldownMs]);

  return handlePress as UseDoubleTapReturn<T>;
}
