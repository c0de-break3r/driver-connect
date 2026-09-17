import { useCallback, useEffect, useMemo } from "react";
import { Animated, Easing } from "react-native";

export function useTabBounce() {
  const anim = useMemo(() => new Animated.Value(0), []);

  const bounce = useCallback(() => {
    anim.setValue(0);
    Animated.sequence([
      Animated.timing(anim, {
        toValue: -8,
        duration: 120,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
      Animated.timing(anim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.quad),
      }),
    ]).start();
  }, [anim]);

  return { animatedStyle: { transform: [{ translateY: anim }] }, bounce };
}
