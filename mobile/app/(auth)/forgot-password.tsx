import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSent(true);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Reset password</Text>
        <Text style={styles.subtitle}>
          Enter your email and we&apos;ll send you a reset link
        </Text>

        {sent ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>
              If an account exists with that email, you&apos;ll receive a reset link shortly.
            </Text>
            <Button
              onPress={() => router.push("/(auth)/sign-in")}
              className="w-full mt-4"
            >
              Back to Sign In
            </Button>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <Button
              onPress={handleReset}
              disabled={loading || !email}
              className="w-full mt-4"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </View>
        )}

        <View style={styles.footer}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.link}>← Back to sign in</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#2C3E5B",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 32,
  },
  successBox: {
    padding: 16,
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  successText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#166534",
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E5B",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#2C3E5B",
    backgroundColor: "#F9FAFB",
  },
  footer: {
    marginTop: 32,
  },
  link: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E5B",
  },
});
