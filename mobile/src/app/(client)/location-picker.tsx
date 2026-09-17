import { useState } from "react";
import { ScrollView, StyleSheet, Text, View, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SearchBar } from "@/components/ui/search-bar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar } from "@/components/ui/avatar";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import { useLocationPickerStore } from "@/store/useLocationPickerStore";

const NAVY = "#2C3E5B";

const SAMPLE_LOCATIONS = [
  "Accra Mall, Accra", "Kotoka International Airport, Accra", "Labadi Beach, Accra",
  "Kwame Nkrumah Circle, Accra", "Makola Market, Accra", "East Legon, Accra",
  "Osu, Accra", "Madina, Accra", "Kumasi Central Market, Kumasi",
  "KNUST Campus, Kumasi", "Lake Bosumtwi, Kumasi", "Takoradi Market Circle, Sekondi-Takoradi",
];

const POPULAR_LOCATIONS = [
  "Kotoka International Airport, Accra", "Accra Mall, Accra", "Labadi Beach, Accra", "Kwame Nkrumah Circle, Accra",
];

const LOCATIONS_BY_REGION: Record<string, string[]> = {
  "Accra": ["Accra Mall, Accra", "Kotoka International Airport, Accra", "Labadi Beach, Accra", "Kwame Nkrumah Circle, Accra", "Makola Market, Accra", "East Legon, Accra", "Osu, Accra", "Madina, Accra"],
  "Kumasi": ["Kumasi Central Market, Kumasi", "KNUST Campus, Kumasi", "Lake Bosumtwi, Kumasi"],
  "Sekondi-Takoradi": ["Takoradi Market Circle, Sekondi-Takoradi"],
};

type Mode = "pickup" | "destination";

export default function LocationPickerScreen() {
  const params = useLocalSearchParams<{ mode?: string; userRegion?: string }>();
  const mode = (params.mode as "pickup" | "destination") || "pickup";
  const userRegion = params.userRegion || "";
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const toast = useToast();
  const setSelectedLocation = useLocationPickerStore((state) => state.setSelectedLocation);

  const baseLocations = mode === "destination" ? SAMPLE_LOCATIONS : (LOCATIONS_BY_REGION[userRegion] || SAMPLE_LOCATIONS);
  const popularLocations = mode === "destination" ? POPULAR_LOCATIONS : (LOCATIONS_BY_REGION[userRegion] || POPULAR_LOCATIONS).slice(0, 4);

  const filtered = query.trim().length > 0 ? baseLocations.filter((loc) => loc.toLowerCase().includes(query.toLowerCase())) : [];

  const handleSelect = (location: string) => {
    setRecentSearches((prev) => [location, ...prev.filter((s) => s !== location)].slice(0, 5));
    setSelectedLocation(location, mode);
    router.back();
  };

  const title = mode === "pickup" ? "Select pickup location" : "Select destination";

  const LocationRow = ({ location, icon, iconColor }: { location: string; icon: string; iconColor: string }) => (
    <Button variant="ghost" onPress={() => handleSelect(location)} className="h-auto py-3.5 px-4 flex-row items-center gap-3.5 border-b border-gray-100">
      <View className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center border border-gray-200">
        <Ionicons name={icon as any} size={18} color={iconColor} />
      </View>
      <Text className="flex-1 text-sm font-medium" style={{ color: NAVY }}>{location}</Text>
    </Button>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View className="flex-row items-center justify-between px-5 pt-4 pb-3 border-b border-gray-200">
        <Button variant="ghost" size="icon" onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200">
          <Ionicons name="arrow-back" size={24} color={NAVY} />
        </Button>
        <Text className="text-base font-bold" style={{ color: NAVY }}>{title}</Text>
        <View className="w-10" />
      </View>

      <View className="mx-5 mt-3 mb-2 relative z-20">
        <SearchBar
          placeholder="Search locations"
          value={query}
          onChangeText={setQuery}
          autoFocus
          className="bg-white border-gray-200"
        />

        {query.trim().length > 0 && (
          <Card className="mt-0 absolute top-full left-0 right-0 z-30 border-gray-200 shadow-lg rounded-xl overflow-hidden">
            {filtered.length === 0 ? (
              <View className="py-10 items-center">
                <Text className="text-base font-bold mb-1" style={{ color: NAVY }}>No locations found</Text>
                <Text className="text-sm font-medium text-gray-500">Try a different search term</Text>
              </View>
            ) : (
              filtered.map((location) => (
                <LocationRow key={location} location={location} icon="location-outline" iconColor={NAVY} />
              ))
            )}
          </Card>
        )}
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {query.trim().length === 0 && (
          <>
            {recentSearches.length > 0 && (
              <View className="mt-6">
                <Text className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Recent</Text>
                {recentSearches.map((location) => (
                  <LocationRow key={location} location={location} icon="time-outline" iconColor="#6B7280" />
                ))}
              </View>
            )}

            <View className="mt-6">
              <Text className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Popular</Text>
              {popularLocations.map((location) => (
                <LocationRow key={location} location={location} icon="star-outline" iconColor="#6B7280" />
              ))}
            </View>

            <View className="mt-6">
              <Text className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">All locations</Text>
              {baseLocations.map((location) => (
                <LocationRow key={location} location={location} icon="location-outline" iconColor="#6B7280" />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { paddingHorizontal: 20, paddingBottom: 48 },
});
