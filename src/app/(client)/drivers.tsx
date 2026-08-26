import { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import { Text } from "@/components/ui/text";
import { Skeleton } from "@/components/ui/skeleton";
import DriverCard from "@/components/DriverCard";
import { driversRepository } from "@/data/repositories/driversRepository";
import { Driver } from "@/types/explore";

export default function DriversListScreen() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    driversRepository.getTopRated().then((data) => {
      setDrivers(data);
      setLoading(false);
    });
  }, []);

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={drivers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DriverCard driver={item} />
        )}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => {}} tintColor="#2C3E5B" colors={["#2C3E5B"]} />
        }
        contentContainerStyle={{ padding: 20, gap: 14 }}
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
  card: {
    backgroundColor: "#FFFFFF",
  },
});
