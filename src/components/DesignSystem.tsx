import { StyleSheet, View, Text, Pressable, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRef, type ReactNode } from "react";

export const NAVY = "#2C3E5B";
export const GREEN = "#10B981";
export const RED = "#EF4444";
export const AMBER = "#F59E0B";
export const BLUE = "#3B82F6";
export const BG = "#FFFFFF";
export const BORDER = "#E5E7EB";
export const SUBTLE = "#F3F4F6";
export const MUTED = "#6B7280";
export const DISABLED = "#9CA3AF";

export function createCardStyle(overrides?: Record<string, any>) {
  return {
    backgroundColor: BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    gap: 12,
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    ...overrides,
  } as Record<string, any>;
}

export function createBadgeStyle(overrides?: Record<string, any>) {
  return {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: SUBTLE,
    ...overrides,
  } as Record<string, any>;
}

export function PressableCard({
  style,
  onPress,
  children,
  ...props
}: {
  style?: any;
  onPress?: () => void;
  children?: ReactNode;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.985, useNativeDriver: true, damping: 14, stiffness: 180 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 14, stiffness: 180 }).start();
  };

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} {...props}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

export function SectionHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <View style={styles.sectionHeader}>
      <View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function IconBadge({ name, color = NAVY, backgroundColor = SUBTLE, size = 18 }: { name: keyof typeof Ionicons.glyphMap; color?: string; backgroundColor?: string; size?: number }) {
  return (
    <View style={[styles.iconBadge, { backgroundColor }]}>
      <Ionicons name={name} size={size} color={color} />
    </View>
  );
}

export function StatusBadge({ label, tone = "neutral" }: { label: string; tone?: "success" | "warning" | "danger" | "info" | "neutral" }) {
  const palette: Record<string, { bg: string; text: string }> = {
    success: { bg: "#E8F5E9", text: "#1B5E20" },
    warning: { bg: "#FFF3E0", text: "#E65100" },
    danger: { bg: "#FEE2E2", text: "#991B1B" },
    info: { bg: "#E3F2FD", text: "#1565C0" },
    neutral: { bg: SUBTLE, text: NAVY },
  };
  const colors = palette[tone] ?? palette.neutral;
  return (
    <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.statusBadgeText, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

export function Row({ icon, label, value, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; value?: string; onPress?: () => void }) {
  return (
    <Pressable style={styles.row} onPress={onPress} disabled={!onPress}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={NAVY} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      </View>
      {onPress && <Ionicons name="chevron-forward" size={18} color={DISABLED} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 4,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: NAVY,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: MUTED,
    marginTop: 2,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: SUBTLE,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: NAVY,
  },
  rowValue: {
    fontSize: 13,
    fontWeight: "500",
    color: MUTED,
    marginTop: 2,
  },
});
