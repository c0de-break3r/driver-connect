import { Pressable, StyleSheet, Text, View } from "react-native";

export type OnboardingOptionRowProps = {
  icon?: string;
  title: string;
  description?: string;
  selected: boolean;
  isLast?: boolean;
  onPress: () => void;
};

/**
 * Single selectable option row used across onboarding choice screens.
 *
 * Layout matches the role-question list pattern:
 * - Optional emoji icon in a soft rounded box
 * - Bold title + lighter description stacked vertically
 * - Right-hand check badge when selected
 * - Bottom divider (omitted on the last item)
 */
export function OnboardingOptionRow({
  icon,
  title,
  description,
  selected,
  isLast,
  onPress,
}: OnboardingOptionRowProps) {
  return (
    <Pressable onPress={onPress}>
      <View
        style={[
          styles.option,
          selected && styles.optionSelected,
          isLast && styles.optionLast,
        ]}
      >
        {selected && (
          <View style={styles.checkBadge}>
            <Text style={styles.checkText}>✓</Text>
          </View>
        )}

        {icon && (
          <View
            style={[
              styles.iconBox,
              selected ? styles.iconBoxSelected : styles.iconBoxDefault,
            ]}
          >
            <Text style={styles.iconEmoji}>{icon}</Text>
          </View>
        )}

        <View style={[styles.textColumn, !icon && styles.textColumnNoIcon]}>
          <Text
            style={[styles.title, selected && styles.titleSelected]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {description && (
            <Text style={styles.description} numberOfLines={2}>
              {description}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#E8ECF0",
  },
  optionSelected: {
    // Selection is shown by the right-hand check badge
  },
  optionLast: {
    borderBottomWidth: 0,
  },
  checkBadge: {
    position: "absolute",
    top: 14,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#2C3E5B",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  checkText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBoxSelected: {
    backgroundColor: "rgba(44, 62, 91, 0.08)",
  },
  iconBoxDefault: {
    backgroundColor: "rgba(44, 62, 91, 0.04)",
  },
  iconEmoji: {
    fontSize: 24,
  },
  textColumn: {
    flex: 1,
    marginLeft: 14,
  },
  textColumnNoIcon: {
    marginLeft: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E5B",
    lineHeight: 22,
  },
  titleSelected: {
    fontWeight: "700",
  },
  description: {
    fontSize: 13,
    color: "#6E7E91",
    lineHeight: 18,
    marginTop: 2,
  },
});
