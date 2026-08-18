import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Animated, StyleSheet, Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { HomeScreenContent } from "./HomeScreenContent";
import WelcomeAuthScreen from "@/components/WelcomeAuthScreen";
import { useTabBounce } from "@/hooks/useTabBounce";
import { useDashboardShell } from "@/hooks/useDashboardShell";
import MessagesScreen from "@/components/MessagesScreen";
import ProfileScreen from "@/components/ProfileScreen";
import { useAppStateStore } from "@/store/useAppStateStore";
import FavoritesScreen from "@/components/FavoritesScreen";
import RoleSwitchTransition from "@/components/RoleSwitchTransition";

const NAVY = "#2C3E5B";

export default function HomeScreen() {
  const { setHasSeenWelcome } = useAppStateStore();

  const {
    activeTab,
    setActiveTab,
    switchingRole,
    welcomeVisible,
    setWelcomeVisible,
    openAuth,
    fadeAnim,
    scaleAnim,
    signedIn,
    isLoaded,
  } = useDashboardShell({
    tabs: ["explore", "trips", "favorites", "messages", "profile"],
    defaultTab: "explore",
    backTargetTab: "profile",
  });

  const [isSwitchingRole, setIsSwitchingRole] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (signedIn) {
      setWelcomeVisible(false);
    }
  }, [isLoaded, signedIn, setWelcomeVisible]);

  const handleAuthDismiss = () => {
    setHasSeenWelcome(true);
    setWelcomeVisible(false);
    if (!signedIn) {
      setActiveTab("explore");
      return;
    }
    setActiveTab("explore");
  };

  const renderContent = () => {
    if (!isLoaded) {
      return <View style={styles.loadingContainer} />;
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
          <View style={styles.centerContent}>
            <View style={styles.iconCircle}>
              <Ionicons name="heart-outline" size={48} color={NAVY} />
            </View>
            <Text style={styles.emptyTitle}>No favorites</Text>
            <Text style={styles.emptySubtitle}>
              Log in to view your favorites. You can save, view, or edit favorites once you&apos;ve logged in.
            </Text>
            <Pressable
              style={styles.emptyCta}
              onPress={() => {
                openAuth();
              }}
            >
              <Text style={styles.emptyCtaText}>Log in</Text>
            </Pressable>
          </View>
        );
      }
      if (activeTab === "trips") {
        return (
          <View style={styles.centerContent}>
            <View style={styles.iconCircle}>
              <Ionicons name="calendar-outline" size={48} color={NAVY} />
            </View>
            <Text style={styles.emptyTitle}>No trips yet</Text>
            <Text style={styles.emptySubtitle}>
              Your upcoming vehicle bookings and driver hires will appear here once you confirm a booking.
            </Text>
            <Pressable
              style={styles.emptyCta}
              onPress={() => {
                openAuth();
              }}
            >
              <Text style={styles.emptyCtaText}>Log in</Text>
            </Pressable>
          </View>
        );
      }
      if (activeTab === "messages") {
        return (
          <View style={styles.centerContent}>
            <View style={styles.iconCircle}>
              <Ionicons name="chatbubble-ellipses-outline" size={48} color={NAVY} />
            </View>
            <Text style={styles.emptyTitle}>No messages</Text>
            <Text style={styles.emptySubtitle}>
              Log in to view and send messages to hosts and drivers.
            </Text>
            <Pressable
              style={styles.emptyCta}
              onPress={() => {
                openAuth();
              }}
            >
              <Text style={styles.emptyCtaText}>Log in</Text>
            </Pressable>
          </View>
        );
      }
      if (activeTab === "profile") {
        return (
          <ProfileScreen
            onSwitchingRoleChange={setIsSwitchingRole}
            signedIn={false}
            openAuth={openAuth}
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
        <View style={styles.centerContent}>
          <View style={styles.iconCircle}>
            <Ionicons name="calendar-outline" size={48} color={NAVY} />
          </View>
          <Text style={styles.emptyTitle}>No trips yet</Text>
          <Text style={styles.emptySubtitle}>
            Your upcoming trips will appear here once you make a booking.
          </Text>
        </View>
      );
    }
    if (activeTab === "messages") {
      return <MessagesScreen />;
    }
    if (activeTab === "profile") {
      return (
        <ProfileScreen
          onSwitchingRoleChange={setIsSwitchingRole}
          signedIn={signedIn}
          openAuth={openAuth}
        />
      );
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

      {!welcomeVisible && !isSwitchingRole && !switchingRole ? (
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
            icon="calendar-outline"
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

      {switchingRole ? (
        <RoleSwitchTransition role={switchingRole} fromRole="client" />
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 60,
    gap: 16,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: NAVY,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  emptyCta: {
    marginTop: 16,
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  emptyCtaText: {
    color: NAVY,
    fontSize: 15,
    fontWeight: "700",
  },
});
