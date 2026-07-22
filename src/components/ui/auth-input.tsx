import { useState } from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export type AuthInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  /** "email-address" | "number-pad" | "default" */
  keyboardType?: "default" | "email-address" | "number-pad" | "numeric";
  /** Show password visibility toggle */
  secure?: boolean;
  /** Auto-capitalize (default: none for email, sentences otherwise) */
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  /** Max character length (e.g. 6 for OTP codes) */
  maxLength?: number;
  /** Auto-focus on mount */
  autoFocus?: boolean;
  /** Disable input (e.g. while fetching) */
  editable?: boolean;
  /** Error message shown below the input */
  error?: string | null;
  /** Extra bottom margin (overrides default 20) */
  marginBottom?: number;
  /** Optional icon element rendered inside the input */
  icon?: React.ReactNode;
};

/**
 * Labeled text input for auth screens.
 *
 * Includes:
 * - Floating label above the input
 * - Optional left icon inside a rounded container
 * - Optional password visibility toggle (eye icon)
 * - Error message below the input
 * - Consistent styling matching the identity form design
 *
 * Uses StyleSheet per AGENTS.md exception rules for TextInput.
 */
export function AuthInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  secure = false,
  autoCapitalize,
  maxLength,
  autoFocus = false,
  editable = true,
  error,
  marginBottom,
  icon,
}: AuthInputProps) {
  const [showText, setShowText] = useState(false);

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputRow,
          marginBottom !== undefined ? { marginBottom } : undefined,
        ]}
      >
        {icon && <View style={styles.inputIcon}>{icon}</View>}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder ?? label}
          placeholderTextColor="#A0AAB4"
          autoCapitalize={autoCapitalize ?? (secure ? "none" : "none")}
          keyboardType={keyboardType}
          autoCorrect={false}
          secureTextEntry={secure && !showText}
          maxLength={maxLength}
          autoFocus={autoFocus}
          editable={editable}
        />
        {secure && (
          <Pressable onPress={() => setShowText(!showText)} hitSlop={8}>
            <Text style={styles.eyeIcon}>{showText ? "◉" : "◎"}</Text>
          </Pressable>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2C3E5B",
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAE1D9",
    borderRadius: 999,
    paddingHorizontal: 16,
    height: 56,
    gap: 12,
  },
  inputIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F5ECE5",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#2C3E5B",
    height: "100%",
  },
  eyeIcon: {
    fontSize: 18,
    marginLeft: 8,
    color: "#6E7E91",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 6,
    marginBottom: 12,
  },
});
