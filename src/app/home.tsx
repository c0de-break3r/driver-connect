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
import TripsScreen from "@/components/TripsScreen";
import { EmptyState } from "@/components/ui/empty-state";

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
    setActiveTab("explore");
  };

  const renderContent = () => {
    if (!isLoaded) {
      return <View className="flex-1 items-center justify-center bg-white" />;
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
          <EmptyState
            icon={
              <View className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center">
                <Ionicons name="heart-outline" size={48} color={NAVY} />
              </View>
            }
            title="No favorites"
            description="Log in to view your favorites. You can save, view, or edit favorites once you've logged in."
            action={{ label: "Log in", onPress: openAuth }}
          />
        );
      }
      if (activeTab === "trips") {
        return <TripsScreen signedIn={signedIn} openAuth={openAuth} />;
      }
      if (activeTab === "messages") {
        return (
          <EmptyState
            icon={
              <View className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center">
                <Ionicons name="chatbubble-ellipses-outline" size={48} color={NAVY} />
              </View>
            }
            title="No messages"
            description="Log in to view and send messages to hosts and drivers."
            action={{ label: "Log in", onPress: openAuth }}
          />
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
      return <TripsScreen signedIn={signedIn} openAuth={openAuth} />;
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
      <View className="flex-1 bg-white">
        <Animated.View
          className="flex-1"
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
          {renderContent()}
        </Animated.View>

        {!welcomeVisible && !isSwitchingRole && !switchingRole ? (
          <View className="flex-row items-center justify-around bg-white border-t border-gray-200 pt-2.5 pb-4 px-3">
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
      </View>

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
    <Pressable className="items-center gap-1 flex-1" onPress={() => { bounce(); onPress?.(); }}>
      <Animated.View style={animatedStyle}>
        <Ionicons
          name={icon}
          size={22}
          color={active ? "#2C3E5B" : "#9CA3AF"}
        />
      </Animated.View>
      <Text
        className={[
          "text-[11px] font-semibold",
          active ? "text-foreground" : "text-gray-400",
        ].join(" ")}
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
});
