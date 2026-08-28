import { useEffect, useState, useCallback } from "react";
import { View, FlatList, RefreshControl, Pressable, StyleSheet } from "react-native";
import { Text } from "@/components/ui/text";
import { Skeleton } from "@/components/ui/skeleton";
import DriverCard from "@/components/DriverCard";
import { driversRepository } from "@/data/repositories/driversRepository";
import { Driver } from "@/types/explore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function DriversListScreen() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDrivers = useCallback(async () => {
    const data = await driversRepository.getTopRated();
    setDrivers(data);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadDrivers();
  }, [loadDrivers]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDrivers();
  }, [loadDrivers]);

  const handleDriverPress = useCallback((driverId: string) => {
    router.push(`/driver-details?id=${driverId}` as any);
  }, []);

  return (
    <View className="flex-1 bg-white">
      <View style={styles.topActions}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backButton}>
          <View style={styles.backButtonCircle}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </View>
        </Pressable>
      </View>
      <FlatList
        data={drivers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DriverCard driver={item} list onPress={() => handleDriverPress(item.id)} />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#2C3E5B" colors={["#2C3E5B"]} />
        }
        contentContainerStyle={{ padding: 20, paddingTop: 72, gap: 14 }}
        ListEmptyComponent={
          loading ? (
            <View className="gap-3 px-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <View key={i} className="gap-2">
                  <Skeleton className="h-[120px] w-full rounded-2xl" />
                  <Skeleton className="h-4 w-3/4 rounded-full" />
                  <Skeleton className="h-3 w-1/2 rounded-full" />
                </View>
              ))}
            </View>
          ) : (
            <View className="items-center justify-center py-16">
              <Text className="text-lg font-extrabold text-[#2C3E5B]">No drivers found</Text>
              <Text className="text-sm text-gray-500 mt-1">Check back later for verified drivers</Text>
            </View>
          )
        }
        ListFooterComponent={null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topActions: {
    position: "absolute",
    top: 48,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    zIndex: 10,
  },
  backButton: {
    minHeight: 44,
    minWidth: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
});
