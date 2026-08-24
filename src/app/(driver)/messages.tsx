import { useState, useRef } from "react";
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SearchBar } from "@/components/ui/search-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/ui/empty-state";

const NAVY = "#2C3E5B";

export default function DriverMessagesScreen() {
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchExpanded, setSearchExpanded] = useState(false);
  const settingsSheetAnim = useRef(new Animated.Value(0)).current;
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
      Animated.timing(settingsSheetAnim, {
        toValue: 0,
        duration: 240,
        useNativeDriver: false,
      }).start();
    } else {
      setSearchExpanded(true);
      Animated.timing(settingsSheetAnim, {
        toValue: 1,
        duration: 240,
        useNativeDriver: false,
      }).start(() => {
        searchInputRef.current?.focus();
      });
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchExpanded(false);
    Animated.timing(settingsSheetAnim, {
      toValue: 0,
      duration: 240,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={toggleSearch} hitSlop={8} style={styles.iconButton}>
              <Ionicons name="search" size={22} color={NAVY} />
            </TouchableOpacity>

            <Animated.View
              style={[
                styles.searchExpandWrap,
                {
                  width: searchExpanded ? 200 : 0,
                  opacity: searchExpanded ? 1 : 0,
                },
              ]}
            >
              <View style={styles.searchInputWrap}>
                <TouchableOpacity onPress={searchExpanded ? handleClearSearch : undefined} hitSlop={8}>
                  <Ionicons name={searchExpanded ? "close" : "search"} size={20} color={NAVY} />
                </TouchableOpacity>
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

          <Button variant="outline" size="sm" onPress={() => {}} iconAfter={<Ionicons name="chevron-down" size={14} color={NAVY} />} className="rounded-full">
            Sort
          </Button>
          <TouchableOpacity onPress={openSettings} hitSlop={8} style={styles.iconButton}>
            <Ionicons name="settings-outline" size={22} color={NAVY} />
          </TouchableOpacity>
        </View>

        <Card className="mb-6">
          <CardContent>
            <EmptyState
              icon={
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="chatbubble-ellipses-outline" size={40} color={NAVY} />
                </View>
              }
              title="You don't have any messages"
              description="When you receive a new message, it will appear here."
            />
          </CardContent>
        </Card>
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
            <CardContent>
              <View style={styles.settingsHeader}>
                <Text style={styles.settingsTitle}>Messaging settings</Text>
                <TouchableOpacity onPress={closeSettings} hitSlop={8}>
                  <Ionicons name="close" size={22} color={NAVY} />
                </TouchableOpacity>
              </View>

              <Separator className="my-4" />

              <TouchableOpacity style={styles.settingsItem} activeOpacity={0.7}>
                <View style={styles.settingsIconWrap}>
                  <Ionicons name="archive-outline" size={22} color={NAVY} />
                </View>
                <Text style={styles.settingsItemText}>Archived</Text>
              </TouchableOpacity>

              <Separator className="my-2" />

              <TouchableOpacity style={styles.settingsItem} activeOpacity={0.7}>
                <View style={styles.settingsIconWrap}>
                  <Ionicons name="paper-plane-outline" size={22} color={NAVY} />
                </View>
                <Text style={styles.settingsItemText}>Give feedback</Text>
              </TouchableOpacity>
            </CardContent>
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
    paddingLeft: 8,
    paddingRight: 14,
    paddingVertical: 10,
    height: 40,
    borderWidth: 2,
    borderColor: NAVY,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: NAVY,
    paddingVertical: 0,
    textAlign: "left",
  },
  iconButton: {
    padding: 8,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: NAVY,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
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
  },
  settingsIconWrap: {
    width: 24,
    alignItems: "center",
  },
  settingsItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: NAVY,
  },
});
