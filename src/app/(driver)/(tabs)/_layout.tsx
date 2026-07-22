import { Tabs } from "expo-router";
import { Platform, View } from "react-native";

export default function DriverTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E2E8F0",
          height: Platform.OS === "ios" ? 88 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 24 : 12,
        },
        tabBarActiveTintColor: "#1E3A8A",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: color === "#1E3A8A" ? "#1E3A8A" : "transparent", borderWidth: color === "#1E3A8A" ? 0 : 2, borderColor: color }} />
          ),
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: "Jobs",
          tabBarIcon: ({ color }) => (
            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: color === "#1E3A8A" ? "#1E3A8A" : "transparent", borderWidth: color === "#1E3A8A" ? 0 : 2, borderColor: color }} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: color === "#1E3A8A" ? "#1E3A8A" : "transparent", borderWidth: color === "#1E3A8A" ? 0 : 2, borderColor: color }} />
          ),
        }}
      />
    </Tabs>
  );
}
