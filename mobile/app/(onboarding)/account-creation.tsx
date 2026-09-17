import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { router } from "expo-router";

export default function AccountCreationScreen() {
  const insets = useSafeAreaInsets();

  const handleContinue = () => {
    router.push("/(onboarding)/core-product-trial");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>
          Save your progress and access all Driver Connect features.
        </Text>

        <View style={styles.form}>
          <Button onPress={handleContinue} className="w-full">
            Create Account
          </Button>
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
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2C3E5B",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 32,
    lineHeight: 24,
  },
  form: {
    gap: 16,
  },
});
