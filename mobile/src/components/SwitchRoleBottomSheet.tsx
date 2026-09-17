import { useRef, useEffect } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

const NAVY = "#2C3E5B";

type Role = "driver" | "owner" | "client" | "corporate";

const ROLE_OPTIONS: { value: Role; label: string; description: string }[] = [
  { value: "driver", label: "Driver", description: "Offer driving services" },
  { value: "owner", label: "Vehicle Owner", description: "List vehicles for rent" },
  { value: "client", label: "Client", description: "Book vehicles or drivers" },
  { value: "corporate", label: "Corporate Client", description: "Fleet and corporate transport" },
];

type SwitchRoleBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSelectRole: (role: Role) => void;
  currentRole?: Role | null;
};

export default function SwitchRoleBottomSheet({ visible, onClose, onSelectRole, currentRole }: SwitchRoleBottomSheetProps) {
  const sheetAnim = useRef(new Animated.Value(0)).current;

  const openSheet = () => {
    sheetAnim.setValue(0);
    Animated.timing(sheetAnim, {
      toValue: 1,
      duration: 420,
      useNativeDriver: true,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(sheetAnim, {
      toValue: 0,
      duration: 320,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const handleRolePress = (role: Role) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectRole(role);
    closeSheet();
  };

  useEffect(() => {
    if (visible) {
      openSheet();
    }
  }, [visible]);

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={closeSheet}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeSheet}>
        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [
                {
                  translateY: sheetAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [600, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.headerRow}>
            <Text style={styles.title}>Choose Your Hosting Service</Text>
            <TouchableOpacity onPress={closeSheet} hitSlop={8}>
              <Ionicons name="close" size={22} color={NAVY} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.roleList} showsVerticalScrollIndicator={false}>
            {ROLE_OPTIONS.filter((option) => option.value !== currentRole).map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.roleItem}
                activeOpacity={0.85}
                onPress={() => handleRolePress(option.value)}
              >
                <View>
                  <Text style={styles.roleItemLabel}>{option.label}</Text>
                  <Text style={styles.roleItemDescription}>{option.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: Platform.select({ ios: 32, android: 24 }),
    maxHeight: Dimensions.get("window").height * 0.85,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: NAVY,
  },
  roleList: {
    gap: 12,
    paddingBottom: 8,
  },
  roleItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  roleItemLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
  },
  roleItemDescription: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
});
