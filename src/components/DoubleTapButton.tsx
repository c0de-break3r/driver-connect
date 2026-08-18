import { useDoubleTap } from "@/hooks/useDoubleTap";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";

type DoubleTapButtonProps = TouchableOpacityProps & {
  /** Optional custom cooldown in ms. Default 600. */
  cooldownMs?: number;
};

/**
 * DoubleTapButton
 * Wraps `TouchableOpacity` and applies `useDoubleTap` to its `onPress`.
 * Drop-in replacement for buttons where double-tap prevention is desired.
 */
export function DoubleTapButton({ onPress, cooldownMs = 600, ...rest }: DoubleTapButtonProps) {
  const safePress = useDoubleTap(onPress as any, { cooldownMs });
  return <TouchableOpacity onPress={safePress} {...rest} />;
}
