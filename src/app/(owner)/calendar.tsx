import { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthProvider";
import { useQuery } from "convex/react";
import { api } from "@/lib/convexApi";

const NAVY = "#2C3E5B";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function OwnerCalendarScreen() {
  const { userId } = useAuth();

  const convexUser = useQuery(
    api.users.getByUserId,
    userId ? { userId } : "skip"
  );

  const vehicles = useQuery(
    api.jobs.getOwnerVehicles,
    convexUser?._id ? { ownerId: convexUser._id } : "skip"
  );

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [blockedDates, setBlockedDates] = useState<Record<string, boolean>>({});

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [startingDayOfWeek, daysInMonth]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const toggleDate = (day: number) => {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setBlockedDates((prev) => ({
      ...prev,
      [dateKey]: !prev[dateKey],
    }));
  };

  const isBlocked = (day: number) => {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return !!blockedDates[dateKey];
  };

  const selectedVehicle = vehicles?.find((v) => v._id === selectedVehicleId);

  return (
    <View style={styles.container}>
      <View style={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Calendars</Text>
          <TouchableOpacity hitSlop={8}>
            <Ionicons name="search" size={22} color={NAVY} />
          </TouchableOpacity>
        </View>

        <View style={styles.vehicleSelector}>
          <Text style={styles.selectorLabel}>Select a vehicle to manage availability</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vehicleScroll}>
            <View style={styles.vehicleChips}>
              {vehicles?.map((vehicle) => (
                <TouchableOpacity
                  key={vehicle._id}
                  style={[
                    styles.vehicleChip,
                    selectedVehicleId === vehicle._id && styles.vehicleChipActive,
                  ]}
                  onPress={() => setSelectedVehicleId(vehicle._id)}
                >
                  <Text
                    style={[
                      styles.vehicleChipText,
                      selectedVehicleId === vehicle._id && styles.vehicleChipTextActive,
                    ]}
                  >
                    {vehicle.make} {vehicle.model}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.calendarCard}>
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
            {calendarDays.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  day === null && styles.dayCellEmpty,
                  day !== null && isBlocked(day) && styles.dayCellBlocked,
                ]}
                onPress={() => day !== null && toggleDate(day)}
                disabled={day === null}
              >
                {day !== null && (
                  <Text
                    style={[
                      styles.dayText,
                      isBlocked(day) && styles.dayTextBlocked,
                    ]}
                  >
                    {day}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#FFFFFF" }]} />
              <Text style={styles.legendText}>Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: NAVY }]} />
              <Text style={styles.legendText}>Blocked</Text>
            </View>
          </View>
        </View>

        {!selectedVehicle && vehicles && vehicles.length > 0 && (
          <View style={styles.hint}>
            <Ionicons name="information-circle-outline" size={18} color="#6B7280" />
            <Text style={styles.hintText}>
              Select a vehicle above to block or unblock dates.
            </Text>
          </View>
        )}
      </View>
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
    fontSize: 32,
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
  vehicleChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  vehicleChipActive: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  vehicleChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  vehicleChipTextActive: {
    color: "#FFFFFF",
  },
  calendarCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
  },
  dayCellEmpty: {
    backgroundColor: "transparent",
  },
  dayCellBlocked: {
    backgroundColor: NAVY,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  dayTextBlocked: {
    color: "#FFFFFF",
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    marginTop: 16,
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
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  legendText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  hint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    padding: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
    lineHeight: 18,
  },
});
