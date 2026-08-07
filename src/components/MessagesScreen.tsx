import { useState, useRef } from "react";
import {
  Animated,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthProvider";

const NAVY = "#2C3E5B";

const FILTER_TABS = [
  "All",
  "Traveling",
  "Support",
  "Booking",
  "Payment",
  "Account",
  "System",
] as const;
type FilterTab = (typeof FILTER_TABS)[number];

export default function MessagesScreen() {
  const { signedIn } = useAuth();
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchExpanded, setSearchExpanded] = useState(false);
  const settingsSheetAnim = useRef(new Animated.Value(0)).current;
  const searchWidthAnim = useRef(new Animated.Value(0)).current;
  const searchInputRef = useRef<TextInput>(null);

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

  const toggleSearch = () => {
    if (searchExpanded) {
      setSearchExpanded(false);
      Animated.timing(searchWidthAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: false,
      }).start();
    } else {
      setSearchExpanded(true);
      searchWidthAnim.setValue(0);
      Animated.timing(searchWidthAnim, {
        toValue: 1,
        duration: 280,
        useNativeDriver: false,
      }).start(() => {
        searchInputRef.current?.focus();
      });
    }
  };

  if (!signedIn) {
    return (
      <View style={styles.loginContainer}>
        <Text style={styles.title}>Messages</Text>
          <Text style={styles.subtitle}>Log in to see messages. Once you log in, you&apos;ll find messages from hosts here.</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Log in</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={toggleSearch} hitSlop={8} style={styles.iconButton}>
              <Ionicons name={searchExpanded ? "close" : "search"} size={22} color={NAVY} />
            </TouchableOpacity>
            <Animated.View
              style={[
                styles.searchExpandWrap,
                {
                width: searchWidthAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 215],
                }),

                  opacity: searchWidthAnim,
                  marginLeft: searchWidthAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 10],
                  }),
                },
              ]}
            >
              <View style={styles.searchInputWrap}>
                <Ionicons name="search" size={20} color="#000000" />
                <TextInput
                  ref={searchInputRef}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search all messages"
                  placeholderTextColor="#9CA3AF"
                  style={styles.searchInput}
                />
              </View>
            </Animated.View>
          </View>

          <TouchableOpacity onPress={openSettings} hitSlop={8} style={styles.iconButton}>
            <Ionicons name="settings-outline" size={22} color={NAVY} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
          style={styles.filterScrollView}
        >
          {FILTER_TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.filterChip, activeFilter === tab && styles.filterChipActive]}
              onPress={() => setActiveFilter(tab)}
            >
              <Text style={[styles.filterText, activeFilter === tab && styles.filterTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.emptyState}>
          <Ionicons name="chatbubble-ellipses-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>You don&apos;t have any messages</Text>
          <Text style={styles.emptySubtitle}>When you receive a new message, it will appear here.</Text>
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
    paddingTop: Platform.select({ ios: 60, android: 40 }),
    paddingBottom: 48,
  },
  loginContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: NAVY,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#111827",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    minHeight: 36,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  searchExpandWrap: {
    overflow: "hidden",
    height: 40,
    justifyContent: "center",
  },
  searchInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F8F8F8",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    height: 40,
    borderWidth: 2,
    borderColor: "#000000",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: NAVY,
    paddingVertical: 0,
  },
  iconButton: {
    padding: 8,
  },
  filterScrollContent: {
    gap: 10,
    paddingHorizontal: 20,
  },
  filterScrollView: {
    backgroundColor: "transparent",
    marginHorizontal: -20,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterChipActive: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: NAVY,
    marginTop: 24,
    marginBottom: 8,
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
