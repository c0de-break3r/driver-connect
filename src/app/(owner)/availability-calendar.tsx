import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convexApi";
import { useAuth } from "@/contexts/AuthProvider";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const NAVY = "#2C3E5B";
const GREEN = "#10B981";
const RED = "#EF4444";
const YELLOW = "#F59E0B";
const GRAY = "#D1D5DB";
const WHITE = "#FFFFFF";
const BG = "#F9FAFB";
const BORDER = "#E5E7EB";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function AvailabilityCalendarScreen() {
  const router = useRouter();
  const { vehicleId: routeVehicleId } = useLocalSearchParams<{ vehicleId?: string }>();
  const { userId } = useAuth();
  const convexUser = useQuery(
    api.users.getByUserId,
    userId ? { userId } : "skip"
  );

  const today = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }, []);

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [blockingRange, setBlockingRange] = useState<{
    start: string | null;
    end: string | null;
  }>({ start: null, end: null });
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDateDetail, setShowDateDetail] = useState(false);

  const blocks = useQuery(
    api.jobs.getVehicleAvailabilityBlocks,
    routeVehicleId ? { vehicleId: routeVehicleId as any } : "skip"
  );

  const allBookings = useQuery(
    api.jobs.getOwnerBookings,
    convexUser?._id ? { ownerId: convexUser._id } : "skip"
  );

  const createBlock = useMutation(api.jobs.createAvailabilityBlock);
  const deleteBlock = useMutation(api.jobs.deleteAvailabilityBlock);

  const dateStatusMap = useMemo((): Record<string, "available" | "booked" | "blocked" | "past"> => {
    const map: Record<string, "available" | "booked" | "blocked" | "past"> = {};
    const todayStr = getTodayDateString();

    if (allBookings && routeVehicleId) {
      const vId = routeVehicleId as any;
      allBookings.forEach((booking) => {
        if (booking.vehicleId !== vId) return;
        if (booking.status === "cancelled") return;
        const status: "booked" | "blocked" =
          booking.status === "confirmed" ? "booked" : "blocked";
        let d = new Date(booking.startDate + "T00:00:00");
        const end = new Date(booking.endDate + "T00:00:00");
        while (d <= end) {
          const key = formatDate(d);
          if (!map[key] || map[key] === "past") {
            map[key] = status;
          }
          d = new Date(d.getTime() + 86400000);
        }
      });
    }

    if (blocks) {
      blocks.forEach((block) => {
        let d = new Date(block.startDate + "T00:00:00");
        const end = new Date(block.endDate + "T00:00:00");
        while (d <= end) {
          const key = formatDate(d);
          if (!map[key]) {
            map[key] = "blocked";
          }
          d = new Date(d.getTime() + 86400000);
        }
      });
    }

    Object.keys(map).forEach((dateStr) => {
      if (dateStr < todayStr) {
        map[dateStr] = "past";
      }
    });

    return map;
  }, [blocks, allBookings, routeVehicleId]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleLongPress = (day: number) => {
    const dateStr = formatDate(new Date(currentYear, currentMonth, day));
    const todayStr = getTodayDateString();
    if (dateStr < todayStr) return;
    setBlockingRange({ start: dateStr, end: dateStr });
    setShowBlockModal(true);
  };

  const handleTap = (day: number) => {
    const dateStr = formatDate(new Date(currentYear, currentMonth, day));
    const status = dateStatusMap[dateStr];
    if (status && status !== "available") {
      setSelectedDate(dateStr);
      setShowDateDetail(true);
    }
  };

  const handleBlockRange = async () => {
    if (!blockingRange.start || !blockingRange.end || !convexUser?._id) return;
    if (!routeVehicleId) {
      Alert.alert("No vehicle", "Select a vehicle to create availability blocks.");
      return;
    }
    try {
      await createBlock({
        vehicleId: routeVehicleId as any,
        ownerId: convexUser._id,
        startDate: blockingRange.start,
        endDate: blockingRange.end,
        reason: "Blocked by owner",
      });
      setShowBlockModal(false);
      setBlockingRange({ start: null, end: null });
    } catch {
      Alert.alert("Error", "Failed to create availability block.");
    }
  };

  const handleDeleteBlock = async (blockId: any) => {
    try {
      await deleteBlock({ blockId });
      setShowDateDetail(false);
    } catch {
      Alert.alert("Error", "Failed to remove block.");
    }
  };

  const todayStr = getTodayDateString();

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = Array(firstDayOfWeek).fill(null);
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [daysInMonth, firstDayOfWeek]);

  const selectedBlocks = useMemo(() => {
    if (!selectedDate || !blocks) return [];
    return blocks.filter(
      (b) => selectedDate >= b.startDate && selectedDate <= b.endDate
    );
  }, [selectedDate, blocks]);

  const selectedBookings = useMemo(() => {
    if (!selectedDate || !allBookings) return [];
    return allBookings.filter(
      (b) =>
        (b.status === "confirmed" || b.status === "pending") &&
        selectedDate >= b.startDate &&
        selectedDate <= b.endDate
    );
  }, [selectedDate, allBookings]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={NAVY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Availability</Text>
          <TouchableOpacity
            onPress={() => {
              const todayLocal = new Date();
              const d = formatDate(todayLocal);
              setBlockingRange({ start: d, end: d });
              setShowBlockModal(true);
            }}
            hitSlop={8}
          >
            <Ionicons name="add-circle-outline" size={24} color={NAVY} />
          </TouchableOpacity>
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: GREEN }]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: RED }]} />
            <Text style={styles.legendText}>Booked</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: YELLOW }]} />
            <Text style={styles.legendText}>Blocked</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: GRAY }]} />
            <Text style={styles.legendText}>Past</Text>
          </View>
        </View>

        <Card className="mb-4">
          <View style={styles.monthRow}>
            <TouchableOpacity onPress={handlePrevMonth} hitSlop={8}>
              <Ionicons name="chevron-back" size={22} color={NAVY} />
            </TouchableOpacity>
            <Text style={styles.monthLabel}>
              {MONTHS[currentMonth]} {currentYear}
            </Text>
            <TouchableOpacity onPress={handleNextMonth} hitSlop={8}>
              <Ionicons name="chevron-forward" size={22} color={NAVY} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekdayRow}>
            {WEEKDAYS.map((day) => (
              <Text key={day} style={styles.weekdayText}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return <View key={`empty-${idx}`} style={styles.dayCell} />;
              }
              const dateStr = formatDate(new Date(currentYear, currentMonth, day));
              const status = dateStatusMap[dateStr];
              const isToday = dateStr === todayStr;
              const dayColor =
                status === "available"
                  ? GREEN
                  : status === "booked"
                    ? RED
                    : status === "blocked"
                      ? YELLOW
                      : status === "past"
                        ? GRAY
                        : "#374151";

              return (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayCell,
                    isToday && styles.todayCell,
                  ]}
                  onPress={() => handleTap(day)}
                  onLongPress={() => handleLongPress(day)}
                >
                  <View
                    style={[
                      styles.dayCircle,
                      status && styles.dayCircleFilled,
                      status && { backgroundColor: dayColor + "25" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        { color: dayColor },
                        isToday && styles.todayText,
                      ]}
                    >
                      {day}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        <View style={styles.tipCard}>
          <Ionicons name="information-circle-outline" size={18} color={NAVY} />
          <Text style={styles.tipText}>
            Tap a colored date for details. Long press any date to block a range.
          </Text>
        </View>
      </ScrollView>

      <Dialog open={showBlockModal} onOpenChange={setShowBlockModal}>
        <DialogContent className="w-80">
          <DialogHeader>
            <DialogTitle>Block Date Range</DialogTitle>
            <Text style={styles.modalSubtitle}>
              {blockingRange.start}
              {blockingRange.end !== blockingRange.start ? ` → ${blockingRange.end}` : ""}
            </Text>
            <Text style={styles.modalHint}>Edit the dates below before saving:</Text>
          </DialogHeader>

          <View style={styles.modalInputRow}>
            <View style={styles.modalCol}>
              <Text style={styles.modalLabel}>Start</Text>
              <Input
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
                value={blockingRange.start || ""}
                onChangeText={(t) => setBlockingRange((r) => ({ ...r, start: t }))}
              />
            </View>
            <View style={styles.modalCol}>
              <Text style={styles.modalLabel}>End</Text>
              <Input
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
                value={blockingRange.end || ""}
                onChangeText={(t) => setBlockingRange((r) => ({ ...r, end: t }))}
              />
            </View>
          </View>

          <DialogFooter>
            <Button variant="outline" onPress={() => {
              setShowBlockModal(false);
              setBlockingRange({ start: null, end: null });
            }}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Button>
            <Button onPress={handleBlockRange}>
              <Text style={styles.modalSaveText}>Block Dates</Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDateDetail} onOpenChange={setShowDateDetail}>
        <DialogContent className="w-80">
          <DialogHeader>
            <View style={styles.detailHeaderRow}>
              <DialogTitle>{selectedDate}</DialogTitle>
              <TouchableOpacity onPress={() => setShowDateDetail(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color={NAVY} />
              </TouchableOpacity>
            </View>
          </DialogHeader>

          {selectedBlocks.length > 0 && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Availability Blocks</Text>
              {selectedBlocks.map((block) => (
                <View key={block._id} style={styles.detailItem}>
                  <View style={styles.detailItemLeft}>
                    <View style={[styles.statusDot, { backgroundColor: YELLOW }]} />
                    <View>
                      <Text style={styles.detailItemTitle}>Blocked</Text>
                      <Text style={styles.detailItemSub}>
                        {block.startDate} → {block.endDate}
                      </Text>
                      {block.reason && (
                        <Text style={styles.detailItemReason}>{block.reason}</Text>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteBlock(block._id)} hitSlop={8}>
                    <Ionicons name="trash-outline" size={18} color={RED} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {selectedBookings.length > 0 && (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Bookings</Text>
              {selectedBookings.map((booking) => (
                <View key={booking._id} style={styles.detailItem}>
                  <View style={styles.detailItemLeft}>
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: booking.status === "confirmed" ? GREEN : YELLOW },
                      ]}
                    />
                    <View>
                      <Text style={styles.detailItemTitle}>
                        {booking.status === "confirmed" ? "Confirmed" : "Pending"} Booking
                      </Text>
                      <Text style={styles.detailItemSub}>
                        {booking.startDate} → {booking.endDate}
                      </Text>
                      <Text style={styles.detailItemSub}>
                        GHS {booking.totalAmount.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {selectedBlocks.length === 0 && selectedBookings.length === 0 && (
            <View style={styles.detailEmpty}>
              <Text style={styles.detailEmptyText}>No events on this date.</Text>
              <Text style={styles.detailEmptySub}>This date is available.</Text>
            </View>
          )}
        </DialogContent>
      </Dialog>
    </View>
  );
}

function getTodayDateString() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

function formatDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 48,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: NAVY,
  },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  calendarCard: {
    backgroundColor: BG,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 16,
  },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  monthLabel: {
    fontSize: 17,
    fontWeight: "800",
    color: NAVY,
  },
  weekdayRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekdayText: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
    paddingVertical: 6,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.285%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  todayCell: {
    borderRadius: 18,
    backgroundColor: "#EFF6FF",
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircleFilled: {
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  dayText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  todayText: {
    fontWeight: "800",
    color: NAVY,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    color: "#1E40AF",
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 360,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: NAVY,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
  },
  modalHint: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 16,
  },
  modalInputRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  modalCol: {
    flex: 1,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: BG,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalCancelButton: {
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: BORDER,
  },
  modalSaveButton: {
    backgroundColor: NAVY,
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
  },
  modalSaveText: {
    fontSize: 15,
    fontWeight: "700",
    color: WHITE,
  },
  detailHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailSectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: BG,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BORDER,
  },
  detailItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  detailItemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  detailItemSub: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 2,
  },
  detailItemReason: {
    fontSize: 11,
    fontWeight: "500",
    color: "#9CA3AF",
    marginTop: 2,
    fontStyle: "italic",
  },
  detailEmpty: {
    alignItems: "center",
    paddingVertical: 24,
  },
  detailEmptyText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  detailEmptySub: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 4,
  },
});
