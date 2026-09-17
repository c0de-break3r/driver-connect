import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useToast";

const NAVY = "#2C3E5B";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isInRange(date: Date, start: Date | null, end: Date | null) {
  if (!start || !end) return false;
  const time = date.getTime();
  const startTime = start.getTime();
  const endTime = end.getTime();
  return time >= startTime && time <= endTime;
}

type CalendarSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSelectStart: (date: Date) => void;
  onSelectEnd: (date: Date) => void;
  selectedStart: Date | null;
  selectedEnd: Date | null;
  minDate?: Date;
  unavailableRanges?: Array<{ start: Date; end: Date; reason?: string }>;
  bookedRanges?: Array<{ start: Date; end: Date; reason?: string }>;
  userBookedRanges?: Array<{ start: Date; end: Date }>;
  onConfirm?: () => void;
};

export default function CalendarSheet({
  visible,
  onClose,
  onSelectStart,
  onSelectEnd,
  selectedStart,
  selectedEnd,
  minDate,
  unavailableRanges = [],
  bookedRanges = [],
  userBookedRanges = [],
  onConfirm,
}: CalendarSheetProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectingEnd, setSelectingEnd] = useState(false);
  const toast = useToast();

  if (!visible) return null;

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const cells: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const getDateStatus = (day: number) => {
    const date = new Date(year, month, day);
    const dateTime = date.getTime();

    for (const range of unavailableRanges) {
      const start = new Date(range.start);
      const end = new Date(range.end);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      if (dateTime >= start.getTime() && dateTime <= end.getTime()) {
        return { status: "unavailable", reason: range.reason || "Driver/vehicle is unavailable" };
      }
    }

    for (const range of bookedRanges) {
      const start = new Date(range.start);
      const end = new Date(range.end);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      if (dateTime >= start.getTime() && dateTime <= end.getTime()) {
        return { status: "booked", reason: range.reason || "Already booked" };
      }
    }

    for (const range of userBookedRanges) {
      const start = new Date(range.start);
      const end = new Date(range.end);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      if (dateTime >= start.getTime() && dateTime <= end.getTime()) {
        return { status: "userBooked", reason: "" };
      }
    }

    return { status: "available", reason: "" };
  };

  const handleDayPress = (day: number) => {
    const date = new Date(year, month, day);
    const dateStatus = getDateStatus(day);

    if (dateStatus.status === "unavailable") {
      toast.showToast(dateStatus.reason || "Driver/vehicle is unavailable", "warning");
      return;
    }

    if (dateStatus.status === "booked") {
      toast.showToast(dateStatus.reason || "This date is already booked", "warning");
      return;
    }

    if (minDate && date < minDate) return;

    if (!selectingEnd || !selectedStart) {
      onSelectStart(date);
      setSelectingEnd(true);
    } else {
      if (date < selectedStart) {
        onSelectStart(date);
        setSelectingEnd(true);
      } else if (isSameDay(date, selectedStart)) {
        onSelectEnd(date);
        setSelectingEnd(false);
      } else {
        onSelectEnd(date);
        setSelectingEnd(false);
      }
    }
  };

  const isSelected = (day: number) => {
    const date = new Date(year, month, day);
    if (selectedStart && isSameDay(date, selectedStart)) return "start";
    if (selectedEnd && isSameDay(date, selectedEnd)) return "end";
    return null;
  };

  const isInSelectedRange = (day: number) => {
    const date = new Date(year, month, day);
    return isInRange(date, selectedStart, selectedEnd);
  };

  const isToday = (day: number) => {
    const date = new Date(year, month, day);
    return isSameDay(date, today);
  };

  const isDisabled = (day: number) => {
    const date = new Date(year, month, day);
    if (minDate && date < minDate) return true;
    const dateStatus = getDateStatus(day);
    return dateStatus.status === "unavailable" || dateStatus.status === "booked";
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={22} color={NAVY} />
          </Pressable>
          <Text style={styles.title}>Select dates</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.monthRow}>
          <Pressable onPress={handlePrevMonth} style={styles.monthButton}>
            <Ionicons name="chevron-back" size={20} color={NAVY} />
          </Pressable>
          <Text style={styles.monthLabel}>
            {MONTHS[month]} {year}
          </Text>
          <Pressable onPress={handleNextMonth} style={styles.monthButton}>
            <Ionicons name="chevron-forward" size={20} color={NAVY} />
          </Pressable>
        </View>

        <View style={styles.weekRow}>
          {DAYS.map((d) => (
            <Text key={d} style={styles.weekDay}>
              {d}
            </Text>
          ))}
        </View>

        <View style={styles.grid}>
          {cells.map((day, index) => {
            if (day === null) {
              return <View key={`empty-${index}`} style={styles.dayCell} />;
            }

            const selected = isSelected(day);
            const inRange = isInSelectedRange(day);
            const todayFlag = isToday(day);
            const disabled = isDisabled(day);
            const dateStatus = getDateStatus(day);

            return (
              <Pressable
                key={day}
                style={styles.dayCell}
                onPress={() => handleDayPress(day)}
                disabled={disabled}
              >
                <View
                  style={[
                    styles.dayCircle,
                    selected === "start" && styles.dayStart,
                    selected === "end" && styles.dayEnd,
                    inRange && !selected && styles.dayInRange,
                    todayFlag && !selected && styles.dayToday,
                    dateStatus.status === "unavailable" && styles.dayUnavailable,
                    dateStatus.status === "booked" && styles.dayBooked,
                    dateStatus.status === "userBooked" && styles.dayUserBooked,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      selected && styles.dayTextSelected,
                      todayFlag && !selected && styles.dayTextToday,
                      disabled && styles.dayTextDisabled,
                      dateStatus.status === "unavailable" && styles.dayTextUnavailable,
                      dateStatus.status === "booked" && styles.dayTextBooked,
                      dateStatus.status === "userBooked" && styles.dayTextUserBooked,
                    ]}
                  >
                    {day}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {selectedStart && selectedEnd
              ? `${selectedStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${selectedEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
              : selectedStart
                ? "Select end date"
                : "Select start date"}
          </Text>
          {onConfirm && (
            <Pressable style={styles.confirmButton} onPress={onConfirm}>
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
    zIndex: 100,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: NAVY,
  },
  headerRight: {
    width: 40,
  },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  monthButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: NAVY,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  dayStart: {
    backgroundColor: NAVY,
  },
  dayEnd: {
    backgroundColor: NAVY,
  },
  dayInRange: {
    backgroundColor: "#E5E7EB",
  },
  dayToday: {
    borderWidth: 1,
    borderColor: NAVY,
  },
  dayBooked: {
    backgroundColor: "#FEE2E2",
  },
  dayUnavailable: {
    backgroundColor: "#FEE2E2",
  },
  dayUserBooked: {
    backgroundColor: "#D1FAE5",
  },
  dayText: {
    fontSize: 14,
    fontWeight: "600",
    color: NAVY,
  },
  dayTextSelected: {
    color: "#FFFFFF",
  },
  dayTextToday: {
    color: NAVY,
  },
  dayTextDisabled: {
    color: "#D1D5DB",
  },
  dayTextBooked: {
    color: "#B91C1C",
  },
  dayTextUnavailable: {
    color: "#B91C1C",
  },
  dayTextUserBooked: {
    color: "#065F46",
  },
  footer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  footerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  confirmButton: {
    backgroundColor: NAVY,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
