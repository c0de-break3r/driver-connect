import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthProvider";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convexApi";

const NAVY = "#2C3E5B";

export default function OwnerProfileScreen() {
  const router = useRouter();
  const { userId } = useAuth();

  const convexUser = useQuery(
    api.users.getByUserId,
    userId ? { userId } : "skip"
  );

  const ownerProfile = useQuery(
    api.users.getOwnerProfile,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  const updateOwnerProfile = useMutation(api.users.updateOwnerProfile);

  const [companyName, setCompanyName] = useState(ownerProfile?.companyName ?? "");
  const [fleetSize, setFleetSize] = useState(
    ownerProfile?.fleetSize !== undefined ? String(ownerProfile.fleetSize) : ""
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!convexUser?._id) return;
    setSaving(true);
    try {
      await updateOwnerProfile({
        userId: convexUser._id,
        companyName: companyName || undefined,
        fleetSize: fleetSize ? Number(fleetSize) : undefined,
      });
      router.back();
    } catch (error) {
      console.error("Failed to update owner profile:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity hitSlop={8} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={NAVY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            hitSlop={8}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>{saving ? "Saving..." : "Save"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {convexUser?.firstName?.[0]?.toUpperCase() ?? "O"}
            </Text>
          </View>
          <Text style={styles.ownerName}>
            {convexUser?.firstName ?? "Vehicle Owner"}
          </Text>
          <Text style={styles.ownerEmail}>{convexUser?.email ?? ""}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Details</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Company / Business Name</Text>
            <TextInput
              style={styles.input}
              value={companyName}
              onChangeText={setCompanyName}
              placeholder="e.g. Nana Agyemang Motors"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Fleet Size</Text>
            <TextInput
              style={styles.input}
              value={fleetSize}
              onChangeText={setFleetSize}
              placeholder="Number of vehicles"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={convexUser?.email ?? ""}
              editable={false}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Role</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value="Vehicle Owner"
              editable={false}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: NAVY,
  },
  ownerName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  ownerEmail: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
    backgroundColor: "#F9FAFB",
  },
  inputDisabled: {
    backgroundColor: "#F3F4F6",
    color: "#6B7280",
  },
});
