import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Animated, StyleSheet, Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { HomeScreenContent } from "./HomeScreenContent";
import WelcomeAuthScreen from "@/components/WelcomeAuthScreen";
import { useAuth } from "@/contexts/AuthProvider";
import { useTabBounce } from "@/hooks/useTabBounce";
import { LoginPromptScreen } from "@/components/LoginPromptScreen";
import { useHomeStore } from "@/store/useHomeStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const NAVY = "#2C3E5B";

export default function HomeScreen() {
  const [showAuth, setShowAuth] = useState(false);
  const [authOrigin, setAuthOrigin] = useState<string>("explore");
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const activeTab = useHomeStore((state) => state.activeTab);
  const setActiveTab = useHomeStore((state) => state.setActiveTab);
  const { signedIn } = useAuth();

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const seen = await AsyncStorage.getItem("hasSeenWelcomeAuth");
        if (seen === "true") {
          setIsFirstLaunch(false);
        } else {
          setIsFirstLaunch(true);
          setShowAuth(true);
          setAuthOrigin("explore");
          await AsyncStorage.setItem("hasSeenWelcomeAuth", "true");
        }
      } catch {
        setIsFirstLaunch(true);
        setShowAuth(true);
        setAuthOrigin("explore");
      }
    };
    checkFirstLaunch();
  }, []);

  const openAuth = (origin: string) => {
    setAuthOrigin(origin);
    setShowAuth(true);
  };

  const handleAuthDismiss = () => {
    setShowAuth(false);
    setActiveTab("explore");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.content}>
          {activeTab === "explore" && <HomeScreenContent onLoginPress={() => openAuth("explore")} />}
        {activeTab === "favorites" && (
          <LoginPromptScreen
            title="Favorites"
            subtitle="Log in to view your favorites. You can save, view, or edit favorites once you've logged in."
            buttonText="Log in"
            onLoginPress={() => openAuth("favorites")}
          />
        )}
        {activeTab === "trips" && (
          <View style={styles.comingSoon}>
            <Text style={styles.comingSoonText}>Trips coming soon</Text>
          </View>
        )}
        {activeTab === "messages" && (
          <LoginPromptScreen
            title="Messages"
            subtitle="Log in to see messages. Once you log in, you'll find messages from hosts here."
            buttonText="Log in"
            onLoginPress={() => openAuth("messages")}
          />
        )}
        {activeTab === "profile" && (
          <LoginPromptScreen
            title="Profile"
            subtitle="Log in and start planning your next trip."
            buttonText="Log in or sign up"
            showMenuItems
            onLoginPress={() => openAuth("profile")}
          />
        )}
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
          onPress={() => openAuth("trips")}
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
