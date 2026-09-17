import { useMemo, useState, useCallback } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/contexts/AuthProvider";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convexApi";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const NAVY = "#2C3E5B";
const GREEN = "#10B981";
const YELLOW = "#F59E0B";
const RED = "#EF4444";
const GRAY = "#E5E7EB";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type CalendarDayStatus = "available" | "blocked" | "pending" | "confirmed";

function getDayStatus(
  dateKey: string,
  bookings: any[],
  blocks: any[]
): CalendarDayStatus {
  const hasBlock = blocks.some(
    (b) => b.startDate <= dateKey && b.endDate >= dateKey
  );
  if (hasBlock) return "blocked";

  const hasBooking = bookings.some(
    (b) =>
      (b.status === "confirmed" || b.status === "pending") &&
      b.startDate <= dateKey &&
      b.endDate >= dateKey
  );
  if (hasBooking) {
    const confirmed = bookings.some(
      (b) =>
        b.status === "confirmed" &&
        b.startDate <= dateKey &&
        b.endDate >= dateKey
    );
    return confirmed ? "confirmed" : "pending";
  }

  return "available";
}

function statusColor(status: CalendarDayStatus) {
  switch (status) {
    case "confirmed":
      return GREEN;
    case "pending":
      return YELLOW;
    case "blocked":
      return RED;
    default:
      return GRAY;
  }
}

function formatDate(iso: string) {
  const date = new Date(iso + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function CalendarDashboard() {
  const router = useRouter();
  const { userId } = useAuth();
  const params = useLocalSearchParams<{ vehicleId?: string }>();
  const preselectedVehicleId = params.vehicleId;

  const convexUser = useQuery(
    api.users.getByUserId,
    userId ? { userId } : "skip"
  );

  const vehicles = useQuery(
    api.jobs.getOwnerVehicles,
    convexUser?._id ? { ownerId: convexUser._id } : "skip"
  );

  const allBookings = useQuery(
    api.jobs.getOwnerBookings,
    convexUser?._id ? { ownerId: convexUser._id } : "skip"
  );

  const availabilityBlocks = useQuery(
    api.jobs.getOwnerAvailabilityBlocks,
    convexUser?._id ? { ownerId: convexUser._id } : "skip"
  );

  const createBlock = useMutation(api.jobs.createAvailabilityBlock);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    preselectedVehicleId ?? null
  );

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [blockStartDate, setBlockStartDate] = useState("");
  const [blockEndDate, setBlockEndDate] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayInfo, setDayInfo] = useState<{
    date: string;
    status: CalendarDayStatus;
    bookings: any[];
    blocks: any[];
  } | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const filteredBookings = useMemo(() => {
    if (!allBookings) return [];
    if (!selectedVehicleId) return allBookings;
    return allBookings.filter((b) => b.vehicleId === selectedVehicleId);
  }, [allBookings, selectedVehicleId]);

  const filteredBlocks = useMemo(() => {
    if (!availabilityBlocks) return [];
    if (!selectedVehicleId) return availabilityBlocks;
    return availabilityBlocks.filter((b) => b.vehicleId === selectedVehicleId);
  }, [availabilityBlocks, selectedVehicleId]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: { day: number | null; dateKey: string }[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, dateKey: "" });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      days.push({ day: i, dateKey });
    }
    return days;
  }, [year, month]);

  const goToPreviousMonth = useCallback(() => {
    setCurrentDate(new Date(year, month - 1, 1));
  }, [year, month]);

  const goToNextMonth = useCallback(() => {
    setCurrentDate(new Date(year, month + 1, 1));
  }, [year, month]);

  const handleDayPress = (day: number, dateKey: string) => {
    const status = getDayStatus(dateKey, filteredBookings, filteredBlocks);
    const dayBookings = filteredBookings.filter(
      (b) => b.startDate <= dateKey && b.endDate >= dateKey
    );
    const dayBlocks = filteredBlocks.filter(
      (b) => b.startDate <= dateKey && b.endDate >= dateKey
    );
    setDayInfo({ date: dateKey, status, bookings: dayBookings, blocks: dayBlocks });
  };

  const handleLongPress = (day: number) => {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedDate(dateKey);
    setBlockStartDate(dateKey);
    setBlockEndDate(dateKey);
    setBlockReason("");
    setShowCreateModal(true);
  };

  const handleCreateBlock = async () => {
    if (!selectedVehicleId || !blockStartDate || !blockEndDate) {
      Alert.alert("Missing info", "Please select a vehicle and enter start/end dates.");
      return;
    }
    if (!convexUser?._id) {
      Alert.alert("Error", "Unable to identify owner.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await createBlock({
        vehicleId: selectedVehicleId as any,
        ownerId: convexUser._id,
        startDate: blockStartDate,
        endDate: blockEndDate,
        reason: blockReason || undefined,
      });
      setShowCreateModal(false);
      setSelectedDate(null);
      setBlockStartDate("");
      setBlockEndDate("");
      setBlockReason("");
      Alert.alert("Success", "Availability block created.");
    } catch {
      Alert.alert("Error", "Unable to create block. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={NAVY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Calendar</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.vehicleSelector}>
          <Text style={styles.selectorLabel}>Select a vehicle</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.vehicleScroll}
          >
            <View style={styles.vehicleChips}>
              {vehicles?.map((vehicle) => (
                <Chip
                  key={vehicle._id}
                  selected={selectedVehicleId === vehicle._id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedVehicleId(vehicle._id);
                  }}
                  className={selectedVehicleId === vehicle._id ? "bg-navy" : ""}
                  textClassName={selectedVehicleId === vehicle._id ? "text-white" : ""}
                >
                  {vehicle.make} {vehicle.model}
                </Chip>
              ))}
            </View>
          </ScrollView>
        </View>

        <Card className="mb-6">
          <View style={styles.monthRow}>
            <TouchableOpacity hitSlop={8} onPress={goToPreviousMonth}>
              <Ionicons name="chevron-back" size={22} color={NAVY} />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>
              {MONTHS[month]} {year}
            </Text>
            <TouchableOpacity hitSlop={8} onPress={goToNextMonth}>
              <Ionicons name="chevron-forward" size={22} color={NAVY} />
            </TouchableOpacity>
          </View>

          <View style={styles.daysHeaderRow}>
            {DAYS.map((day) => (
              <Text key={day} style={styles.dayHeader}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {calendarDays.map((item, index) => {
              if (item.day === null) {
                return <View key={index} style={styles.dayCellEmpty} />;
              }
              const status = getDayStatus(
                item.dateKey,
                filteredBookings,
                filteredBlocks
              );
              const bgColor = statusColor(status);
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCell,
                    { backgroundColor: bgColor },
                  ]}
                  onPress={() => handleDayPress(item.day!, item.dateKey)}
                  onLongPress={() => handleLongPress(item.day!)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.dayText,
                      status === "available" ? styles.dayTextDefault : styles.dayTextLight,
                    ]}
                  >
                    {item.day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: GREEN }]} />
              <Text style={styles.legendText}>Confirmed</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: YELLOW }]} />
              <Text style={styles.legendText}>Pending</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: RED }]} />
              <Text style={styles.legendText}>Blocked</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: GRAY }]} />
              <Text style={styles.legendText}>Available</Text>
            </View>
          </View>
        </Card>

        {dayInfo && (
          <Card className="mb-6">
            <Text style={styles.dayInfoDate}>{formatDate(dayInfo.date)}</Text>
            <Text style={[styles.dayInfoStatus, { color: statusColor(dayInfo.status) }]}>
              {dayInfo.status.charAt(0).toUpperCase() + dayInfo.status.slice(1)}
            </Text>
            {dayInfo.bookings.length > 0 ? (
              <View style={styles.dayInfoSection}>
                <Text style={styles.dayInfoSectionTitle}>Bookings</Text>
                {dayInfo.bookings.map((b) => (
                  <TouchableOpacity
                    key={b._id}
                    style={styles.dayInfoItem}
                    onPress={() =>
                      router.push({ pathname: "/booking/[id]", params: { id: b._id } } as any)
                    }
                  >
                    <Text style={styles.dayInfoItemText}>
                      {b.pickupLocation} → {b.dropoffLocation}
                    </Text>
                    <Text style={styles.dayInfoItemMeta}>
                      {b.status} | GHS {b.totalAmount.toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
            {dayInfo.blocks.length > 0 ? (
              <View style={styles.dayInfoSection}>
                <Text style={styles.dayInfoSectionTitle}>Availability Blocks</Text>
                {dayInfo.blocks.map((b) => (
                  <View key={b._id} style={styles.dayInfoItem}>
                    <Text style={styles.dayInfoItemText}>
                      {b.startDate} — {b.endDate}
                    </Text>
                    {b.reason ? (
                      <Text style={styles.dayInfoItemMeta}>{b.reason}</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : null}
            {dayInfo.bookings.length === 0 && dayInfo.blocks.length === 0 ? (
              <Text style={styles.dayInfoEmpty}>No bookings or blocks on this day.</Text>
            ) : null}
          </Card>
        )}
      </ScrollView>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="w-80">
          <DialogHeader>
            <DialogTitle>Create Availability Block</DialogTitle>
            <Text style={styles.modalDate}>
              {selectedDate ? formatDate(selectedDate) : ""}
            </Text>
          </DialogHeader>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Vehicle</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.vehicleChips}
            >
              <View style={styles.vehicleChipsRow}>
                {vehicles?.map((vehicle) => (
                  <Chip
                    key={vehicle._id}
                    selected={selectedVehicleId === vehicle._id}
                    onPress={() => setSelectedVehicleId(vehicle._id)}
                    className={selectedVehicleId === vehicle._id ? "bg-navy" : ""}
                    textClassName={selectedVehicleId === vehicle._id ? "text-white" : ""}
                  >
                    {vehicle.make} {vehicle.model}
                  </Chip>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Start date</Text>
            <Input
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
              value={blockStartDate}
              onChangeText={setBlockStartDate}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>End date</Text>
            <Input
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
              value={blockEndDate}
              onChangeText={setBlockEndDate}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Reason (optional)</Text>
            <Input
              placeholder="e.g. Maintenance"
              placeholderTextColor="#9CA3AF"
              value={blockReason}
              onChangeText={setBlockReason}
            />
          </View>

          <DialogFooter>
            <Button variant="outline" onPress={() => {
              setShowCreateModal(false);
              setSelectedDate(null);
            }}>
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </Button>
            <Button onPress={handleCreateBlock}>
              <Text style={styles.modalCreateButtonText}>Create Block</Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
    paddingBottom: 100,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },
  vehicleSelector: {
    marginBottom: 24,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 10,
  },
  vehicleScroll: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  vehicleChips: {
    flexDirection: "row",
    gap: 8,
  },
  vehicleChipsRow: {
    flexDirection: "row",
    gap: 8,
  },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  daysHeaderRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  dayHeader: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "transparent",
  },
  dayCellEmpty: {
    width: "14.28%",
    aspectRatio: 1,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "600",
  },
  dayTextDefault: {
    color: "#111827",
  },
  dayTextLight: {
    color: "#FFFFFF",
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginTop: 16,
    flexWrap: "wrap",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  dayInfoCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 12,
    marginBottom: 24,
  },
  dayInfoDate: {
    fontSize: 16,
    fontWeight: "700",
    color: NAVY,
  },
  dayInfoStatus: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  dayInfoSection: {
    marginTop: 4,
  },
  dayInfoSectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  dayInfoItem: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  dayInfoItemText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  dayInfoItemMeta: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 2,
  },
  dayInfoEmpty: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  modalDate: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  formGroup: {
    gap: 6,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },
  modalCancelButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
  },
  modalCreateButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
