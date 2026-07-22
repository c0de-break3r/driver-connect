import { type DimensionValue, StyleSheet, Text, View } from "react-native";

type ProgressBarProps = {
  /** Current step number (1-based) */
  step: number;
  /** Total number of steps */
  total: number;
  /** Optional label shown on the right, e.g. "Role Selection" */
  label?: string;
};

/**
 * Onboarding progress indicator — matches html-reference:
 * thin 6px track (bg-muted), secondary fill (bg-secondary),
 * "STEP X OF Y" label left, optional step name right.
 *
 * Uses StyleSheet for dynamic width calculations (AGENTS.md exception).
 */
export function ProgressBar({ step, total, label }: ProgressBarProps) {
  const fillPercent =
    `${Math.min((step / total) * 100, 100)}%` as DimensionValue;

  return (
    <View style={styles.wrapper}>
      {/* Track */}
      <View style={styles.track}>
        <View style={[styles.fill, { width: fillPercent }]} />
      </View>

      {/* Labels */}
      <View style={styles.labelRow}>
        <Text style={styles.stepLabel}>
          STEP {step} OF {total}
        </Text>
        {label ? <Text style={styles.stepName}>{label}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  track: {
    height: 6,
    width: "100%",
    backgroundColor: "#F5ECE5",
    borderRadius: 999,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: "#FF7B54",
    borderRadius: 999,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#6E7E91",
  },
  stepName: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FF7B54",
    textAlign: "right",
  },
});
