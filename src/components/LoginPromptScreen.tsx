import { StyleSheet, Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const NAVY = "#2C3E5B";

type LoginPromptScreenProps = {
  title: string;
  subtitle: string;
  buttonText?: string;
  showMenuItems?: boolean;
  onLoginPress?: () => void;
};

export function LoginPromptScreen({
  title,
  subtitle,
  buttonText = "Log in",
  showMenuItems = false,
  onLoginPress,
}: LoginPromptScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <Pressable
        style={styles.button}
        onPress={onLoginPress}
      >
        <Text style={styles.buttonText}>{buttonText}</Text>
      </Pressable>

      {showMenuItems && (
        <View style={styles.menuSection}>
          <Pressable style={styles.menuItem}>
            <View style={styles.menuIconWrap}>
              <Ionicons name="settings-outline" size={20} color={NAVY} />
            </View>
            <Text style={styles.menuLabel}>Account settings</Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </Pressable>
          <Pressable style={styles.menuItem}>
            <View style={styles.menuIconWrap}>
              <Ionicons name="help-circle-outline" size={20} color={NAVY} />
            </View>
            <Text style={styles.menuLabel}>Get help</Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </Pressable>
          <View style={styles.menuDivider} />
          <Pressable style={styles.menuItem}>
            <View style={styles.menuIconWrap}>
              <Ionicons name="document-text-outline" size={20} color={NAVY} />
            </View>
            <Text style={styles.menuLabel}>Legal</Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: NAVY,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#111827",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  menuSection: {
    marginTop: 32,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    gap: 16,
  },
  menuIconWrap: {
    width: 24,
    alignItems: "center",
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: NAVY,
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
  },
});
