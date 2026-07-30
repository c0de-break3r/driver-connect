import { useMemo } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useStaggeredEntrance } from "@/hooks/useStaggeredEntrance";
import { useDriverStatsStore } from "@/store/useDriverStatsStore";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";

const NAVY = "#2C3E5B";
const PEACH = "#FFF8F3";
const WHITE = "#FFFFFF";
const MUTED = "#6E7E91";
const BORDER = "#EAE1D9";

type Transaction = {
  id: string;
  title: string;
  amount: string;
  date: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
};

const transactions: Transaction[] = [
  {
    id: "tx-1",
    title: "Trip payout",
    amount: "+GHS 320",
    date: "Today, 2:15 PM",
    icon: "arrow-down-circle",
    color: "#064E3B",
    bg: "#ECFDF5",
  },
  {
    id: "tx-2",
    title: "Withdrawal",
    amount: "-GHS 500",
    date: "Yesterday",
    icon: "arrow-up-circle",
    color: "#7C2D12",
    bg: "#FFF7ED",
  },
  {
    id: "tx-3",
    title: "Trip payout",
    amount: "+GHS 180",
    date: "Jul 25",
    icon: "arrow-down-circle",
    color: "#064E3B",
    bg: "#ECFDF5",
  },
  {
    id: "tx-4",
    title: "Top-up",
    amount: "+GHS 200",
    date: "Jul 24",
    icon: "add-circle",
    color: "#1E3A8A",
    bg: "#EFF6FF",
  },
];

export default function WalletScreen() {
  const entrance = useStaggeredEntrance();
  const stats = useDriverStatsStore((s) => s.stats);

  const balanceText = useMemo(() => {
    const earnings = stats.find((s) => s.label === "Earnings")?.value ?? "GHS 0";
    return earnings;
  }, [stats]);

  const trendText = "+12% this week";

  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const tx of transactions) {
      const key = tx.date.includes("Today") ? "Today" : tx.date.includes("Yesterday") ? "Yesterday" : "Earlier";
      map.set(key, [...(map.get(key) ?? []), tx]);
    }
    return Array.from(map.entries());
  }, []);

  const handleTransactionPress = async () => {
    await impactAsync(ImpactFeedbackStyle.Light);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PEACH }} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.headerRow,
            { opacity: entrance.headerOpacity, transform: [{ translateY: entrance.headerTranslateY }] },
          ]}
        >
          <View>
            <Text style={styles.title}>Wallet</Text>
            <Text style={styles.subtitle}>Payments & earnings</Text>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.balanceCard,
            { opacity: entrance.formOpacity, transform: [{ translateY: entrance.formTranslateY }] },
          ]}
        >
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Total Earnings</Text>
            <View style={styles.trendBadge}>
              <Ionicons name="trending-up" size={14} color="#064E3B" />
              <Text style={styles.trendText}>{trendText}</Text>
            </View>
          </View>
          <Text style={styles.balanceValue}>{balanceText}</Text>
          <View style={styles.balanceActions}>
            <Pressable style={styles.balanceButton}>
              <Ionicons name="add" size={20} color={NAVY} />
              <Text style={styles.balanceButtonText}>Top Up</Text>
            </Pressable>
            <Pressable style={styles.balanceButton}>
              <Ionicons name="arrow-up" size={20} color={NAVY} />
              <Text style={styles.balanceButtonText}>Withdraw</Text>
            </Pressable>
            <Pressable style={styles.balanceButton}>
              <Ionicons name="receipt" size={20} color={NAVY} />
              <Text style={styles.balanceButtonText}>History</Text>
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.section,
            { opacity: entrance.footerOpacity, transform: [{ translateY: entrance.footerTranslateY }] },
          ]}
        >
          {groups.map(([label, txs]) => (
            <View key={label} style={styles.group}>
              <Text style={styles.groupLabel}>{label}</Text>
              <View style={styles.list}>
                {txs.map((tx) => (
                  <Pressable
                    key={tx.id}
                    onPress={handleTransactionPress}
                    style={({ pressed }) => [styles.txRow, pressed && styles.txRowPressed]}
                  >
                    <View style={[styles.txIcon, { backgroundColor: tx.bg }]}>
                      <Ionicons name={tx.icon} size={22} color={tx.color} />
                    </View>
                    <View style={styles.txTextWrap}>
                      <Text style={styles.txTitle}>{tx.title}</Text>
                      <Text style={styles.txDate}>{tx.date}</Text>
                    </View>
                    <Text
                      style={[
                        styles.txAmount,
                        tx.amount.startsWith("+") ? styles.txAmountPositive : styles.txAmountNegative,
                      ]}
                    >
                      {tx.amount}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
    gap: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: NAVY,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: MUTED,
    marginTop: 2,
  },
  balanceCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 20,
    gap: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#A7F3D0",
  },
  trendText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#064E3B",
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: "700",
    color: NAVY,
  },
  balanceActions: {
    flexDirection: "row",
    gap: 10,
  },
  balanceButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: PEACH,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
  },
  balanceButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: NAVY,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {},
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: NAVY,
  },
  group: {
    gap: 8,
  },
  groupLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    paddingHorizontal: 4,
  },
  list: {
    gap: 10,
  },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  txRowPressed: {
    opacity: 0.92,
  },
  txIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
  },
  txTextWrap: {
    flex: 1,
    gap: 2,
  },
  txTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
  },
  txDate: {
    fontSize: 12,
    fontWeight: "600",
    color: MUTED,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: "700",
  },
  txAmountPositive: {
    color: "#10B981",
  },
  txAmountNegative: {
    color: "#EF4444",
  },
  bottomSpacer: {
    height: 24,
  },
});
