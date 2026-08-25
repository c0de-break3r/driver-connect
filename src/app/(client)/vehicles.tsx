import { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import { Text } from "@/components/ui/text";
import { Skeleton } from "@/components/ui/skeleton";
import VehicleCard from "@/components/VehicleCard";
import { vehiclesRepository } from "@/data/repositories/vehiclesRepository";
import { FeaturedVehicle } from "@/types/explore";
import type { VehicleFavorite } from "@/store/useFavoritesStore";

export default function VehiclesListScreen() {
  const [vehicles, setVehicles] = useState<FeaturedVehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vehiclesRepository.getFeatured().then((data) => {
      setVehicles(data);
      setLoading(false);
    });
  }, []);

  const toVehicleFavorite = (v: FeaturedVehicle): VehicleFavorite => ({
    id: v.id,
    title: v.title,
    category: v.subtitle.split("·")[0]?.trim() || "",
    location: v.subtitle.split("·").pop()?.trim() || "",
    region: "",
    price: `GH₵ ${v.pricePerDay}`,
    originalPrice: "",
    period: "per day",
    rating: 0,
    image: v.image,
    ownerName: "",
    ownerAvatar: "",
    isVerified: false,
    condition: "Listed",
    transmission: "Automatic",
    yearsOnPlatform: "New",
  });

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          return (
            <VehicleCard vehicle={toVehicleFavorite(item)} list={true} />
          );
        }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => {}} tintColor="#2C3E5B" colors={["#2C3E5B"]} />
        }
        contentContainerStyle={{ padding: 20, gap: 14 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-16">
            <Text className="text-lg font-extrabold text-[#2C3E5B]">No vehicles found</Text>
            <Text className="text-sm text-gray-500 mt-1">Check back later for new listings</Text>
          </View>
        }
        ListFooterComponent={
          loading ? (
            <View className="gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <View key={i} className="gap-2">
                  <Skeleton className="h-[120px] w-full rounded-2xl" />
                  <Skeleton className="h-4 w-3/4 rounded-full" />
                  <Skeleton className="h-3 w-1/2 rounded-full" />
                </View>
              ))}
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
  },
});
