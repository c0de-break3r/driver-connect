import { type ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";

type SecondaryButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: ReactNode;
  style?: ViewStyle;
};

/**
 * Outlined secondary action button.
 * Matches the reference: border-border, transparent bg, rounded-xl, text-primary.
 * Uses StyleSheet per AGENTS.md style exception rules for Pressable pressed state.
 */
export function SecondaryButton({
  title,
  onPress,
  disabled = false,
  icon,
  style,
}: SecondaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        disabled && styles.buttonDisabled,
        style,
      ]}
    >
      <View style={styles.inner}>
        <Text style={styles.text}>{title}</Text>
        {icon}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "transparent",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EAE1D9",
    alignItems: "center",
    justifyContent: "center",
    opacity: 1,
  },
  buttonPressed: {
    backgroundColor: "#F5ECE5",
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  text: {
    color: "#2C3E5B",
    fontSize: 16,
    fontWeight: "600",
  },
});
