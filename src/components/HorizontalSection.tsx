import { useRef } from "react";
import { View, FlatList, Pressable } from "react-native";
import { Text } from "@/components/ui/text";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/EmptyState";
import { router } from "expo-router";

type HorizontalSectionProps<T> = {
  title: string;
  subtitle?: string;
  data: T[];
  loading: boolean;
  emptyTitle?: string;
  emptySubtitle?: string;
  emptyImage?: any;
  seeAllRoute?: string;
  seeAllLabel?: string;
  onSeeAll?: () => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  loadingCount?: number;
  cardWidth?: number;
  keyExtractor?: (item: T, index: number) => string | number;
  reverseHeader?: boolean;
};

export default function HorizontalSection<T>({
  title,
  subtitle,
  data,
  loading,
  emptyTitle = "No items found",
  emptySubtitle = "Check back later for more",
  emptyImage,
  seeAllRoute,
  seeAllLabel = "See All",
  onSeeAll,
  renderItem,
  loadingCount = 4,
  cardWidth = 160,
  keyExtractor,
  reverseHeader = false,
}: HorizontalSectionProps<T>) {
  const showEmpty = !loading && data.length === 0;

  const handleSeeAll = () => {
    if (onSeeAll) {
      onSeeAll();
    } else if (seeAllRoute) {
      router.push(seeAllRoute as any);
    }
  };

  const headerContent = (
    <View className="flex-row items-center gap-2">
      <Text className="text-lg font-extrabold text-white">{title}</Text>
      {subtitle ? (
        <Text className="text-xs font-semibold text-gray-400">{subtitle}</Text>
      ) : null}
    </View>
  );

  const seeAllContent = !showEmpty ? (
    <Pressable onPress={handleSeeAll}>
      <Text className="text-xs font-bold text-gray-400">{seeAllLabel}</Text>
    </Pressable>
  ) : null;

  return (
    <View className="mt-5">
      <View className="flex-row items-center justify-between mb-3">
        {reverseHeader ? (
          <>
            {seeAllContent}
            {headerContent}
          </>
        ) : (
          <>
            {headerContent}
            {seeAllContent}
          </>
        )}
      </View>

      {loading ? (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={Array.from({ length: loadingCount })}
          keyExtractor={(_, index) => `skeleton-${index}`}
          renderItem={() => (
            <View style={{ width: cardWidth, marginRight: 14 }}>
              <Skeleton className="w-full h-[120px] rounded-2xl" />
              <Skeleton className="h-4 w-3/4 rounded-full mt-3" />
              <Skeleton className="h-3 w-1/2 rounded-full mt-2" />
            </View>
          )}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        />
      ) : showEmpty ? (
        <View className="mx-5">
          <EmptyState
            image={emptyImage}
            title={emptyTitle}
            subtitle={emptySubtitle}
            compact
          />
        </View>
      ) : (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={data}
          keyExtractor={keyExtractor ? ((item, index) => String(keyExtractor(item, index))) : undefined}
          renderItem={({ item, index }) => (
            <View style={{ width: cardWidth, marginRight: 14 }}>
              {renderItem(item, index)}
            </View>
          )}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        />
      )}
    </View>
  );
}
