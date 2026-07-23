import { Tabs } from "expo-router";
import { Platform, View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useRef, useState } from "react";
import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { useRoleStore } from "@/store/useRoleStore";

const NAVY = "#2C3E5B";

interface IconConfig {
  active: string;
  inactive: string;
  component: "ionicons" | "antdesign";
}

const icons: Record<string, IconConfig> = {
  dashboard: { active: "home", inactive: "home-outline", component: "ionicons" },
  map: { active: "map", inactive: "map-outline", component: "ionicons" },
  activity: { active: "time", inactive: "time-outline", component: "ionicons" },
  messages: { active: "message", inactive: "message", component: "antdesign" },
  wallet: { active: "wallet", inactive: "wallet-outline", component: "ionicons" },
};

function CustomTabBar({ state, descriptors, navigation }: any) {
  const [activeLabelIndex, setActiveLabelIndex] = useState<number | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleTap = (index: number, routeName: string) => {
    const isAlreadyActive = state.index === index;
    if (isAlreadyActive) {
      setActiveLabelIndex((prev) => (prev === index ? null : index));
    } else {
      navigation.navigate(routeName);
      setActiveLabelIndex(index);
    }

    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (state.index === index) return;
      setActiveLabelIndex(null);
    }, 1500);
  };

  return (
    <View style={styles.tabBar}>
    {state.routes.map((route: any, index: number) => {
      const { options } = descriptors[route.key];
      const label = options.title ?? route.name;
      const iconConfig = icons[route.name] ?? { active: "ellipse", inactive: "ellipse-outline", component: "ionicons" } as IconConfig;
      const isFocused = state.index === index;
      const showLabel = isFocused || activeLabelIndex === index;
      const iconName = isFocused || activeLabelIndex === index ? iconConfig.active : iconConfig.inactive;

      return (
        <Pressable
          key={route.key}
          style={styles.tabItem}
          onPress={() => handleTap(index, route.name)}
          hitSlop={8}
        >
          <View
            style={[
              styles.iconWrap,
              isFocused && styles.iconWrapActive,
            ]}
          >
            {iconConfig.component === "antdesign" ? (
              <AntDesign
                name={iconName as any}
                size={22}
                color={isFocused ? "#FFFFFF" : NAVY}
              />
            ) : (
              <Ionicons
                name={iconName as keyof typeof Ionicons.glyphMap}
                size={22}
                color={isFocused ? "#FFFFFF" : NAVY}
              />
            )}
          </View>
            {showLabel && (
              <Text
                style={[
                  styles.label,
                  { color: isFocused ? "#FFFFFF" : NAVY },
                ]}
              >
                {label}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

export default function DriverTabsLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const role = useRoleStore((s) => s.role);

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn || role !== "driver") {
    const href = role === "driver" ? "/(auth)/sign-in" : "/(onboarding)/role-select";
    return <Redirect href={href as any} />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="dashboard" options={{ title: "Home" }} />
      <Tabs.Screen name="map" options={{ title: "Map" }} />
      <Tabs.Screen name="activity" options={{ title: "Activity" }} />
      <Tabs.Screen name="messages" options={{ title: "Message" }} />
      <Tabs.Screen name="wallet" options={{ title: "Wallet" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#FFF8F3",
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#EAE1D9",
    paddingBottom: Platform.OS === "ios" ? 24 : 10,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minWidth: 64,
    paddingVertical: 4,
  },
  iconWrap: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  iconWrapActive: {
    backgroundColor: NAVY,
    borderRadius: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
  },
});
