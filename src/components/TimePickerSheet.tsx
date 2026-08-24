import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const NAVY = "#2C3E5B";

const TIME_SLOTS = [
  "6:00 AM", "6:30 AM", "7:00 AM", "7:30 AM",
  "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM",
  "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
  "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM",
  "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM",
  "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM",
];

type TimePickerSheetProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (startTime: string, endTime: string) => void;
  selectedStartTime?: string;
  selectedEndTime?: string;
};

export default function TimePickerSheet({ visible, onClose, onConfirm, selectedStartTime, selectedEndTime }: TimePickerSheetProps) {
  const [startTime, setStartTime] = useState<string | null>(selectedStartTime || null);
  const [endTime, setEndTime] = useState<string | null>(selectedEndTime || null);
  const [selectingEnd, setSelectingEnd] = useState(false);

  if (!visible) return null;

  const handleSelect = (time: string) => {
    if (!selectingEnd || !startTime) {
      setStartTime(time);
      setSelectingEnd(true);
    } else {
      if (time < startTime) {
        setStartTime(time);
        setSelectingEnd(true);
      } else {
        setEndTime(time);
        setSelectingEnd(false);
      }
    }
  };

  const handleConfirm = () => {
    if (startTime && endTime) {
      onConfirm(startTime, endTime);
    }
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={22} color={NAVY} />
          </Pressable>
          <Text style={styles.title}>Select time interval</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.grid}>
          {TIME_SLOTS.map((time) => {
            const isStart = startTime === time;
            const isEnd = endTime === time;
            const inRange = startTime && endTime && time > startTime && time < endTime;
            return (
              <Pressable
                key={time}
                style={[
                  styles.timeChip,
                  isStart && styles.timeChipSelected,
                  isEnd && styles.timeChipSelected,
                  inRange && styles.timeChipInRange,
                ]}
                onPress={() => handleSelect(time)}
              >
                <Text
                  style={[
                    styles.timeChipText,
                    (isStart || isEnd) && styles.timeChipTextSelected,
                    inRange && styles.timeChipTextInRange,
                  ]}
                >
                  {time}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {startTime && endTime
              ? `${startTime} - ${endTime}`
              : startTime
                ? "Select end time"
                : "Select start time"}
          </Text>
          <Pressable
            style={[
              styles.confirmButton,
              (!startTime || !endTime) ? styles.confirmButtonDisabled : {},
            ]}
            onPress={handleConfirm}
            disabled={!startTime || !endTime}
          >
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </Pressable>
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
    maxHeight: "60%",
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  timeChip: {
    width: "30%",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  timeChipSelected: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  timeChipInRange: {
    backgroundColor: "#E5E7EB",
  },
  timeChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: NAVY,
  },
  timeChipTextSelected: {
    color: "#FFFFFF",
  },
  timeChipTextInRange: {
    color: NAVY,
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
  confirmButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
