import { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Animated, StyleSheet, Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { HomeScreenContent } from "./HomeScreenContent";
import WelcomeAuthScreen from "@/components/WelcomeAuthScreen";
import { useAuth } from "@/contexts/AuthProvider";
import { useTabBounce } from "@/hooks/useTabBounce";
import { LoginPromptScreen } from "@/components/LoginPromptScreen";
import MessagesScreen from "@/components/MessagesScreen";
import ProfileScreen from "@/components/ProfileScreen";
import { useHomeStore } from "@/store/useHomeStore";
import { useAppStateStore } from "@/store/useAppStateStore";
import { useRoleStore } from "@/store/useRoleStore";
import { getPostAuthRoute } from "@/lib/routing";
import FavoritesScreen from "@/components/FavoritesScreen";

const NAVY = "#2C3E5B";

export default function HomeScreen() {
  const [welcomeVisible, setWelcomeVisible] = useState(false);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);
  const activeTab = useHomeStore((state) => state.activeTab);
  const setActiveTab = useHomeStore((state) => state.setActiveTab);
  const { signedIn, isLoaded } = useAuth();
  const { setHasSeenWelcome, hasSeenWelcome } = useAppStateStore();
  const hasSeenWelcomeRef = useRef(hasSeenWelcome);
  hasSeenWelcomeRef.current = hasSeenWelcome;
  const prevTabRef = useRef(activeTab);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.97)).current;
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!isLoaded) return;

    if (signedIn) {
      setWelcomeVisible(false);
    } else {
      setWelcomeVisible(!hasSeenWelcomeRef.current);
    }
  }, [isLoaded, signedIn, setHasSeenWelcome]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      fadeAnim.setValue(1);
      scaleAnim.setValue(1);
      return;
    }

    fadeAnim.setValue(0);
    scaleAnim.setValue(0.97);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 280,
        easing: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 18,
        stiffness: 160,
        mass: 0.8,
        useNativeDriver: true,
      }),
    ]).start();

    prevTabRef.current = activeTab;
  }, [activeTab, isLoaded, signedIn, fadeAnim, scaleAnim]);

  const openAuth = () => {
    setWelcomeVisible(true);
  };

  const handleAuthDismiss = () => {
    setHasSeenWelcome(true);
    setWelcomeVisible(false);
    if (!signedIn) {
      setActiveTab("explore");
      return;
    }
    const role = useRoleStore.getState().role;
    if (role) {
      router.replace(getPostAuthRoute(role) as any);
    } else {
      setActiveTab("explore");
    }
  };

  const renderContent = () => {
    if (!isLoaded) {
      return (
        <View style={styles.loadingContainer} />
      );
    }

    if (welcomeVisible) {
      return <WelcomeAuthScreen onDismiss={handleAuthDismiss} />;
    }

    if (!signedIn) {
      if (activeTab === "explore") {
        return <HomeScreenContent onLoginPress={openAuth} />;
      }
      if (activeTab === "favorites") {
        return (
          <LoginPromptScreen
            title="Favorites"
            subtitle="Log in to view your favorites. You can save, view, or edit favorites once you've logged in."
            buttonText="Log in"
            onLoginPress={openAuth}
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
            onLoginPress={openAuth}
          />
        );
      }
    }

    if (activeTab === "explore") {
      return <HomeScreenContent onLoginPress={() => {}} />;
    }
    if (activeTab === "favorites") {
      return <FavoritesScreen />;
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
      return <ProfileScreen onSwitchingRoleChange={setIsSwitchingRole} />;
    }

    return <HomeScreenContent onLoginPress={() => {}} />;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.content}>
        <Animated.View
          style={{
            flex: 1,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
          {renderContent()}
        </Animated.View>
      </View>

      {!welcomeVisible && !isSwitchingRole ? (
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
      ) : null}
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
    zIndex: 10,
  },
  authOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 50,
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
});
