import { Tabs, Redirect } from "expo-router";
import { Platform, View, Pressable, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { useRoleStore } from "@/store/useRoleStore";
import { useTabVisibilityStore } from "@/store/useTabVisibilityStore";

const NAVY = "#2C3E5B";

interface IconConfig {
  active: string;
  inactive: string;
  component: "ionicons" | "antdesign";
}

const icons: Record<string, IconConfig> = {
  dashboard: { active: "home", inactive: "home-outline", component: "ionicons" },
  map: { active: "map", inactive: "map-outline", component: "ionicons" },
  wallet: { active: "wallet", inactive: "wallet-outline", component: "ionicons" },
  account: { active: "person", inactive: "person-outline", component: "ionicons" },
};

function CustomTabBar({ state, descriptors, navigation }: any) {
  const [activeLabelIndex, setActiveLabelIndex] = useState<number | null>(null);
  const hideTimer = useState<ReturnType<typeof setTimeout> | undefined>(undefined)[0];
  const setHideTimer = useState<ReturnType<typeof setTimeout> | undefined>(undefined)[1];
  const tabVisible = useTabVisibilityStore((s) => s.visible);
  const [animatedValue] = useState(() => new Animated.Value(1));

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: tabVisible ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [tabVisible, animatedValue]);

  const handleTap = (index: number, routeName: string) => {
    const isAlreadyActive = state.index === index;
    if (isAlreadyActive) {
      setActiveLabelIndex((prev) => (prev === index ? null : index));
    } else {
      navigation.navigate(routeName);
      setActiveLabelIndex(index);
    }

    if (hideTimer) clearTimeout(hideTimer);
    const id = setTimeout(() => {
      if (state.index === index) return;
      setActiveLabelIndex(null);
    }, 1500);
    setHideTimer(id);
  };

  return (
    <Animated.View
      style={[
        styles.tabBar,
        {
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0],
              }),
            },
          ],
        },
      ]}
    >
      {state.routes.map((route: any, index: number) => {
        const iconConfig = icons[route.name] ?? { active: "ellipse", inactive: "ellipse-outline", component: "ionicons" } as IconConfig;
        const isFocused = state.index === index;
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
          </Pressable>
        );
      })}
    </Animated.View>
  );
}

export default function DriverTabsLayout() {
  const { isLoaded, signedIn } = useAuth();
  const role = useRoleStore((s) => s.role);

  if (!isLoaded) {
    return null;
  }

  if (!signedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (role !== "driver") {
    return <Redirect href="/role-select" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        lazy: true,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="dashboard" options={{ title: "Home" }} />
      <Tabs.Screen name="map" options={{ title: "Map" }} />
      <Tabs.Screen name="wallet" options={{ title: "Wallet" }} />
      <Tabs.Screen name="account" options={{ title: "Account" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#FFF8F3",
    paddingVertical: 10,
    borderTopWidth: 0,
    paddingBottom: Platform.OS === "ios" ? 24 : 10,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
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
});
