import { useRef, useState } from "react";
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const NAVY = "#2C3E5B";

export default function CorporateMessagesScreen() {
  const [showSettings, setShowSettings] = useState(false);
  const settingsSheetAnim = useRef(new Animated.Value(0)).current;

  const openSettings = () => {
    setShowSettings(true);
    settingsSheetAnim.setValue(0);
    Animated.timing(settingsSheetAnim, {
      toValue: 1,
      duration: 420,
      useNativeDriver: true,
    }).start();
  };

  const closeSettings = () => {
    Animated.timing(settingsSheetAnim, {
      toValue: 0,
      duration: 320,
      useNativeDriver: true,
    }).start(() => setShowSettings(false));
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <TouchableOpacity hitSlop={8} style={styles.iconButton}>
              <Ionicons name="search" size={22} color={NAVY} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => {}}
            hitSlop={8}
          >
            <Text style={styles.sortButtonText}>Sort</Text>
            <Ionicons name="chevron-down" size={14} color={NAVY} />
          </TouchableOpacity>
          <TouchableOpacity onPress={openSettings} hitSlop={8} style={styles.iconButton}>
            <Ionicons name="settings-outline" size={22} color={NAVY} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>You don&apos;t have any messages</Text>
          <Text style={styles.emptySubtitle}>
            When you receive a new message, it will appear here.
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={showSettings}
        animationType="none"
        transparent
        onRequestClose={closeSettings}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeSettings}
        >
          <Animated.View
            style={[
              styles.settingsSheet,
              {
                transform: [
                  {
                    translateY: settingsSheetAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [600, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.settingsHeader}>
              <Text style={styles.settingsTitle}>Messaging settings</Text>
              <TouchableOpacity onPress={closeSettings} hitSlop={8}>
                <Ionicons name="close" size={22} color={NAVY} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.settingsItem} activeOpacity={0.7}>
              <Ionicons name="archive-outline" size={22} color={NAVY} />
              <Text style={styles.settingsItemText}>Archived</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingsItem} activeOpacity={0.7}>
              <Ionicons name="paper-plane-outline" size={22} color={NAVY} />
              <Text style={styles.settingsItemText}>Give feedback</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 48,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 10,
    minHeight: 36,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconButton: {
    padding: 8,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: NAVY,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: NAVY,
    marginTop: 24,
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  settingsSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  settingsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: NAVY,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  settingsItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: NAVY,
  },
});
