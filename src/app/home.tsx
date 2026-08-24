import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Animated, StyleSheet, Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Heart, Calendar, MessageCircle, User, LogIn } from "lucide-react-native";
import { EmptyState } from "@/components/ui/empty-state";

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
      return <View className="flex-1 bg-white" />;
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
            icon={<Heart size={48} color={NAVY} />}
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
            icon={<MessageCircle size={48} color={NAVY} />}
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

  const navItems = [
    { icon: CompassIcon, label: "Explore", tab: "explore" as const },
    { icon: HeartIcon, label: "Favorites", tab: "favorites" as const },
    { icon: CalendarIcon, label: "Trips", tab: "trips" as const },
    { icon: MessageCircleIcon, label: "Messages", tab: "messages" as const },
    { icon: signedIn ? UserIcon : LogInIcon, label: signedIn ? "Profile" : "Log In", tab: "profile" as const },
  ];

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
      </View>

      {!welcomeVisible && !isSwitchingRole && !switchingRole ? (
        <View className="absolute left-0 right-0 bottom-0 flex-row items-center justify-around bg-white border-t border-gray-200 pt-2.5 pb-4 px-3 z-10">
          {navItems.map((item) => (
            <NavItem
              key={item.tab}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.tab}
              onPress={() => setActiveTab(item.tab)}
            />
          ))}
        </View>
      ) : null}

      {switchingRole ? (
        <RoleSwitchTransition role={switchingRole} fromRole="client" />
      ) : null}
    </SafeAreaView>
  );
}

function CompassIcon() {
  return <Ionicons name="compass-outline" size={22} color="#2C3E5B" />;
}

function HeartIcon({ active }: { active?: boolean }) {
  return <Ionicons name="heart-outline" size={22} color={active ? "#2C3E5B" : "#9CA3AF"} />;
}

function CalendarIcon() {
  return <Ionicons name="calendar-outline" size={22} color="#2C3E5B" />;
}

function MessageCircleIcon() {
  return <Ionicons name="chatbubble-ellipses-outline" size={22} color="#2C3E5B" />;
}

function UserIcon() {
  return <Ionicons name="person-outline" size={22} color="#2C3E5B" />;
}

function LogInIcon() {
  return <Ionicons name="log-in-outline" size={22} color="#2C3E5B" />;
}

function NavItem({
  icon: Icon,
  label,
  active,
  onPress,
}: {
  icon: React.ComponentType<{ size?: number; color?: string; active?: boolean }>;
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  const { animatedStyle, bounce } = useTabBounce();

  return (
    <Pressable className="items-center gap-1 flex-1" onPress={() => { bounce(); onPress?.(); }}>
      <Animated.View style={animatedStyle}>
        <Icon size={22} color={active ? "#2C3E5B" : "#9CA3AF"} />
      </Animated.View>
      <Text
        className={[
          "text-[11px] font-semibold",
          active ? "text-[#2C3E5B]" : "text-[#9CA3AF]",
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
