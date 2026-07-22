import { type ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: ReactNode;
  style?: ViewStyle;
};

/**
 * Full-width primary action button.
 * Matches the reference: bg-primary (#2C3E5B), white text, py-4, rounded-xl, shadow.
 * Uses StyleSheet per AGENTS.md style exception rules for Pressable pressed state.
 */
export function PrimaryButton({
  title,
  onPress,
  disabled = false,
  icon,
  style,
}: PrimaryButtonProps) {
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
    backgroundColor: "#2C3E5B",
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(15, 23, 42, 0.15)",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 8,
    minHeight: 56,
    opacity: 1,
  },
  buttonPressed: {
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
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
