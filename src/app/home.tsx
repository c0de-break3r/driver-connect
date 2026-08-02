import { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Animated, Dimensions, StyleSheet, Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { HomeScreenContent } from "./HomeScreenContent";
import WelcomeAuthScreen from "@/components/WelcomeAuthScreen";
import { useAuth } from "@/contexts/AuthProvider";
import { useTabBounce } from "@/hooks/useTabBounce";
import { LoginPromptScreen } from "@/components/LoginPromptScreen";
import MessagesScreen from "@/components/MessagesScreen";
import ProfileScreen from "@/components/ProfileScreen";
import { useHomeStore } from "@/store/useHomeStore";

const NAVY = "#2C3E5B";
const TAB_ORDER = ["explore", "favorites", "trips", "messages", "profile"] as const;
const SCREEN_WIDTH = Dimensions.get("window").width;

export default function HomeScreen() {
  const [showAuth, setShowAuth] = useState(false);
  const [authOrigin, setAuthOrigin] = useState<string>("explore");
  const activeTab = useHomeStore((state) => state.activeTab);
  const setActiveTab = useHomeStore((state) => state.setActiveTab);
  const { signedIn, isLoaded } = useAuth();
  const prevTabRef = useRef(activeTab);
  const directionRef = useRef<"left" | "right">("right");
  const slideAnim = useRef(new Animated.Value(0)).current;
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!isLoaded) return;

    if (!signedIn) {
      setShowAuth(true);
      setAuthOrigin("explore");
    }
  }, [isLoaded, signedIn]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const prevIndex = TAB_ORDER.indexOf(prevTabRef.current as (typeof TAB_ORDER)[number]);
    const nextIndex = TAB_ORDER.indexOf(activeTab as (typeof TAB_ORDER)[number]);
    const direction: "left" | "right" = nextIndex > prevIndex ? "right" : "left";
    directionRef.current = direction;

    const startOffset = direction === "right" ? SCREEN_WIDTH : -SCREEN_WIDTH;
    slideAnim.setValue(startOffset);

    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      damping: 18,
      stiffness: 120,
    }).start();

    prevTabRef.current = activeTab;
  }, [activeTab, isLoaded, signedIn, slideAnim]);

  const openAuth = (origin: string) => {
    setAuthOrigin(origin);
    setShowAuth(true);
  };

  const handleAuthDismiss = () => {
    setShowAuth(false);
    setActiveTab("explore");
  };

  const renderContent = () => {
    if (!signedIn) {
      if (activeTab === "explore") {
        return <HomeScreenContent onLoginPress={() => openAuth("explore")} />;
      }
      if (activeTab === "favorites") {
        return (
          <LoginPromptScreen
            title="Favorites"
            subtitle="Log in to view your favorites. You can save, view, or edit favorites once you've logged in."
            buttonText="Log in"
            onLoginPress={() => openAuth("favorites")}
          />
        );
      }
      if (activeTab === "trips") {
        return (
          <View style={styles.comingSoon}>
            <Text style={styles.comingSoonText}>Trips coming soon</Text>
          </View>
        );
      }
      if (activeTab === "messages") {
        return <MessagesScreen />;
      }
      if (activeTab === "profile") {
        return (
          <LoginPromptScreen
            title="Profile"
            subtitle="Log in and start planning your next trip."
            buttonText="Log in or sign up"
            showMenuItems
            onLoginPress={() => openAuth("profile")}
          />
        );
      }
    }

    if (activeTab === "explore") {
      return <HomeScreenContent onLoginPress={() => {}} />;
    }
    if (activeTab === "favorites") {
      return (
        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonText}>Favorites coming soon</Text>
        </View>
      );
    }
    if (activeTab === "trips") {
      return (
        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonText}>Trips coming soon</Text>
        </View>
      );
    }
    if (activeTab === "messages") {
      return <MessagesScreen />;
    }
    if (activeTab === "profile") {
      return <ProfileScreen />;
    }

    return <HomeScreenContent onLoginPress={() => {}} />;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.content}>
        <Animated.View style={{ flex: 1, transform: [{ translateX: slideAnim }] }}>
          {renderContent()}
        </Animated.View>
      </View>

      {showAuth && (
        <WelcomeAuthScreen
          onDismiss={handleAuthDismiss}
        />
      )}

      <View style={styles.bottomNav}>
        <NavItem
          icon="compass-outline"
          label="Explore"
          active={activeTab === "explore"}
          onPress={() => setActiveTab("explore")}
        />
        <NavItem
          icon="heart-outline"
          label="Favorites"
          active={activeTab === "favorites"}
          onPress={() => setActiveTab("favorites")}
        />
        <NavItem
          icon="car-sport-outline"
          label="Trips"
          active={activeTab === "trips"}
          onPress={() => setActiveTab("trips")}
        />
        <NavItem
          icon="chatbubble-ellipses-outline"
          label="Messages"
          active={activeTab === "messages"}
          onPress={() => setActiveTab("messages")}
        />
        <NavItem
          icon={signedIn ? "person-outline" : "log-in-outline"}
          label={signedIn ? "Profile" : "Log In"}
          active={activeTab === "profile"}
          onPress={() => setActiveTab("profile")}
        />
      </View>
    </SafeAreaView>
  );
}

function NavItem({
  icon,
  label,
  active,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  const { animatedStyle, bounce } = useTabBounce();

  return (
    <Pressable style={styles.navItem} onPress={() => { bounce(); onPress?.(); }}>
      <Animated.View style={animatedStyle}>
        <Ionicons
          name={icon}
          size={22}
          color={active ? NAVY : "#9CA3AF"}
        />
      </Animated.View>
      <Text
        style={[
          styles.navLabel,
          active && styles.navLabelActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#FFFFFF",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
    paddingVertical: 10,
    paddingBottom: 16,
    paddingHorizontal: 12,
  },
  navItem: {
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  navLabelActive: {
    color: NAVY,
  },
  comingSoon: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  comingSoonText: {
    fontSize: 16,
    color: "#6B7280",
  },
});
