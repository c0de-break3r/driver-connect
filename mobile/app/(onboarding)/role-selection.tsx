import { View, Text, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/button";
import { useRoleStore } from "@/store/useRoleStore";
import type { UserRole } from "@/store/useRoleStore";

const ROLES: { id: UserRole; title: string; description: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  {
    id: "driver",
    title: "Driver",
    description: "Find driving jobs and earn money",
    icon: "car-outline",
  },
  {
    id: "owner",
    title: "Vehicle Owner",
    description: "List your vehicles for rent",
    icon: "business-outline",
  },
  {
    id: "client",
    title: "Client",
    description: "Book drivers and vehicles",
    icon: "person-outline",
  },
  {
    id: "corporate",
    title: "Corporate",
    description: "Manage fleet and team transport",
    icon: "briefcase-outline",
  },
];

export default function RoleSelectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const setRole = useRoleStore((state) => state.setRole);

  const handleContinue = () => {
    if (!selectedRole) return;
    setRole(selectedRole);
    router.push(`/(onboarding)/${selectedRole}-identity`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        <Text style={styles.title}>What best describes you?</Text>
        <Text style={styles.subtitle}>
          This helps us customize your experience.
        </Text>

        <View style={styles.rolesGrid}>
          {ROLES.map((role) => (
            <Pressable
              key={role.id}
              onPress={() => setSelectedRole(role.id)}
              style={[
                styles.roleCard,
                selectedRole === role.id && styles.roleCardSelected,
              ]}
            >
              <View
                style={[
                  styles.iconCircle,
                  selectedRole === role.id && styles.iconCircleSelected,
                ]}
              >
                <Ionicons
                  name={role.icon}
                  size={28}
                  color={selectedRole === role.id ? "#FFFFFF" : "#2C3E5B"}
                />
              </View>
              <Text
                style={[
                  styles.roleTitle,
                  selectedRole === role.id && styles.roleTitleSelected,
                ]}
              >
                {role.title}
              </Text>
              <Text style={styles.roleDescription}>{role.description}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.footer}>
          <Button
            onPress={handleContinue}
            disabled={!selectedRole}
            className="w-full"
          >
            Continue
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
  rolesGrid: {
    gap: 16,
  },
  roleCard: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 12,
  },
  roleCardSelected: {
    borderColor: "#2C3E5B",
    backgroundColor: "#F9FAFB",
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleSelected: {
    backgroundColor: "#2C3E5B",
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C3E5B",
  },
  roleTitleSelected: {
    color: "#2C3E5B",
  },
  roleDescription: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
  },
  footer: {
    marginTop: "auto",
  },
});
