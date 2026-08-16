import { useState, useMemo } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import { useHomeStore } from "@/store/useHomeStore";
import Toast from "@/components/Toast";

const NAVY = "#2C3E5B";
const ORANGE = "#F97316";

const TIME_SLOTS = [
  "10:00 am", "10:30 am", "11:00 am", "11:30 am",
  "12:00 pm", "12:30 pm", "1:00 pm", "1:30 pm",
];

const WEEK_DAYS = ["S", "M", "T", "W", "T", "F", "S"];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function TripDatesScreen() {
  const params = useLocalSearchParams();
  const collectionId = params.collectionId as string | undefined;

  const updateCollectionTripDates = useFavoritesStore((state) => state.updateCollectionTripDates);
  const setActiveTab = useHomeStore((state) => state.setActiveTab);

  const initialMonthIndex = 7; // August (0-indexed)
  const initialYear = 2026;

  const [viewYear, setViewYear] = useState(initialYear);
  const [viewMonthIndex, setViewMonthIndex] = useState(initialMonthIndex);
  const [selectedStart, setSelectedStart] = useState<number | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<number | null>(null);
  const [pickupTime, setPickupTime] = useState("10:00 am");
  const [returnTime, setReturnTime] = useState("10:00 am");
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: "success" | "error" | "info" | "warning" }>({ visible: false, message: "", type: "success" });

  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: "", type: "success" }), 2500);
  };

  const daysInMonth = useMemo(() => {
    const monthIndex = viewMonthIndex;
    const days: (number | null)[] = [];
    const firstDay = new Date(viewYear, monthIndex, 1).getDay();
    const daysCount = new Date(viewYear, monthIndex + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysCount; i++) {
      days.push(i);
    }
    return days;
  }, [viewYear, viewMonthIndex]);

  const formatDate = (day: number) => {
    const date = new Date(viewYear, viewMonthIndex, day);
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  const handlePrevMonth = () => {
    if (viewMonthIndex === 0) {
      setViewMonthIndex(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonthIndex(viewMonthIndex - 1);
    }
    setSelectedStart(null);
    setSelectedEnd(null);
  };

  const handleNextMonth = () => {
    if (viewMonthIndex === 11) {
      setViewMonthIndex(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonthIndex(viewMonthIndex + 1);
    }
    setSelectedStart(null);
    setSelectedEnd(null);
  };

  const handleAddTripDates = () => {
    if (!collectionId) {
      showToast("We couldn't find this list. Please try again.", "error");
      return;
    }
    if (selectedStart === null || selectedEnd === null) {
      showToast("Please choose both pickup and return dates to continue.", "warning");
      return;
    }

    const formatDateISO = (day: number) => {
      const date = new Date(viewYear, viewMonthIndex, day);
      return date.toISOString().split("T")[0];
    };

    updateCollectionTripDates(collectionId, {
      startDate: formatDateISO(selectedStart),
      endDate: formatDateISO(selectedEnd),
      startTime: pickupTime,
      endTime: returnTime,
    });

    setActiveTab("favorites");
    router.replace(`/favorites/collection/${collectionId}`);
  };

  const handleDayPress = (day: number | null) => {
    if (!day) return;
    if (selectedStart === null || (selectedStart !== null && selectedEnd !== null)) {
      setSelectedStart(day);
      setSelectedEnd(null);
    } else if (day < selectedStart) {
      setSelectedEnd(selectedStart);
      setSelectedStart(day);
    } else if (day === selectedStart) {
      setSelectedEnd(day);
    } else {
      setSelectedEnd(day);
    }
  };

  const isDaySelected = (day: number | null) => {
    if (!day) return false;
    return day === selectedStart || day === selectedEnd;
  };

  const isDayInRange = (day: number | null) => {
    if (!day || selectedStart === null || selectedEnd === null) return false;
    return day > selectedStart && day < selectedEnd;
  };

  const getDayStyle = (day: number | null) => {
    if (!day) return styles.dayEmpty;
    if (isDaySelected(day)) return styles.daySelected;
    if (isDayInRange(day)) return styles.dayInRange;
    return styles.day;
  };

  const getDayTextStyle = (day: number | null) => {
    if (!day) return styles.dayTextEmpty;
    if (isDaySelected(day)) return styles.dayTextSelected;
    if (isDayInRange(day)) return styles.dayTextInRange;
    return styles.dayText;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={NAVY} />
        </Pressable>
        <Text style={styles.headerTitle}>Trip dates</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Trip Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Pickup</Text>
              <Text style={styles.summaryValue}>
                {selectedStart ? formatDate(selectedStart) : "Select date"}
              </Text>
              <Text style={styles.summaryTime}>{pickupTime}</Text>
            </View>
            <View style={styles.summaryArrow}>
              <Ionicons name="arrow-forward" size={20} color="#9CA3AF" />
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Return</Text>
              <Text style={styles.summaryValue}>
                {selectedEnd ? formatDate(selectedEnd) : "Select date"}
              </Text>
              <Text style={styles.summaryTime}>{returnTime}</Text>
            </View>
          </View>
        </View>

        {/* Calendar */}
        <View style={styles.calendarCard}>
          <View style={styles.monthRow}>
            <Pressable onPress={handlePrevMonth} style={styles.monthNavButton}>
              <Ionicons name="chevron-back" size={20} color="#9CA3AF" />
            </Pressable>
            <Text style={styles.monthTitle}>
              {MONTH_NAMES[viewMonthIndex]} {viewYear}
            </Text>
            <Pressable onPress={handleNextMonth} style={styles.monthNavButton}>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>
          </View>

          <View style={styles.weekDaysRow}>
            {WEEK_DAYS.map((day, index) => (
              <View key={index} style={styles.weekDayCell}>
                <Text style={styles.weekDayText}>{day}</Text>
              </View>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {daysInMonth.map((day, index) => (
              <Pressable
                key={index}
                style={[styles.dayCell, getDayStyle(day)]}
                onPress={() => handleDayPress(day)}
                disabled={!day}
              >
                {day && (
                  <Text style={getDayTextStyle(day)}>{day}</Text>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Time Selection */}
        <View style={styles.timeSection}>
          <Text style={styles.timeSectionTitle}>Select times</Text>

          <View style={styles.timeGroup}>
            <View style={styles.timeHeader}>
              <Ionicons name="log-in-outline" size={18} color={NAVY} />
              <Text style={styles.timeLabel}>Pickup</Text>
            </View>
            <View style={styles.timeOptions}>
              {TIME_SLOTS.map((time) => (
                <Pressable
                  key={time}
                  style={[styles.timeChip, pickupTime === time && styles.timeChipSelected]}
                  onPress={() => setPickupTime(time)}
                >
                  <Text style={[styles.timeChipText, pickupTime === time && styles.timeChipTextSelected]}>
                    {time}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.timeGroup}>
            <View style={styles.timeHeader}>
              <Ionicons name="log-out-outline" size={18} color={NAVY} />
              <Text style={styles.timeLabel}>Return</Text>
            </View>
            <View style={styles.timeOptions}>
              {TIME_SLOTS.map((time) => (
                <Pressable
                  key={time}
                  style={[styles.timeChip, returnTime === time && styles.timeChipSelected]}
                  onPress={() => setReturnTime(time)}
                >
                  <Text style={[styles.timeChipText, returnTime === time && styles.timeChipTextSelected]}>
                    {time}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          style={styles.resetButton}
          onPress={() => {
            setSelectedStart(null);
            setSelectedEnd(null);
            setPickupTime("10:00 am");
            setReturnTime("10:00 am");
          }}
        >
          <Ionicons name="close-circle-outline" size={18} color="#6B7280" />
          <Text style={styles.resetButtonText}>Reset</Text>
        </Pressable>
        <Pressable
          style={styles.primaryButton}
          onPress={handleAddTripDates}
        >
          <Text style={styles.primaryButtonText}>Confirm dates</Text>
          <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ visible: false, message: "", type: "success" })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: NAVY,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  summaryCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    gap: 4,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
  },
  summaryTime: {
    fontSize: 13,
    fontWeight: "600",
    color: ORANGE,
  },
  summaryArrow: {
    alignItems: "center",
    justifyContent: "center",
  },
  calendarCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  monthNavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  monthTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: NAVY,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  weekDaysRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekDayCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dayEmpty: {
    // empty cell
  },
  day: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  daySelected: {
    backgroundColor: ORANGE,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  dayInRange: {
    backgroundColor: "#EEF2FF",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: {
    fontSize: 14,
    fontWeight: "600",
    color: NAVY,
  },
  dayTextSelected: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  dayTextInRange: {
    fontSize: 14,
    fontWeight: "700",
    color: NAVY,
  },
  dayTextEmpty: {
    fontSize: 14,
    color: "transparent",
  },
  timeSection: {
    marginBottom: 24,
  },
  timeSectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
    marginBottom: 16,
  },
  timeGroup: {
    marginBottom: 16,
  },
  timeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  timeLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: NAVY,
  },
  timeOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  timeChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  timeChipSelected: {
    backgroundColor: ORANGE,
    borderColor: ORANGE,
  },
  timeChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: NAVY,
  },
  timeChipTextSelected: {
    color: "#FFFFFF",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  resetButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6B7280",
  },
  primaryButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: NAVY,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  bottomSpacer: {
    height: 40,
  },
  toast: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
});
