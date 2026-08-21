import { useLocalSearchParams, router } from "expo-router";
import { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyState from "@/components/EmptyState";
import { DRIVERS } from "@/data/drivers";

const NAVY = "#2C3E5B";
const ORANGE = "#F97316";

type Review = {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  date: string;
  title: string;
  text: string;
};

type Summary = {
  average: number;
  total: number;
  distribution: number[];
};

const MOCK_DRIVER_REVIEWS: Record<string, Review[]> = {
  d1: [
    {
      id: "d1-r1",
      name: "Kwame A.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
      rating: 5,
      date: "28 Jul 2026",
      title: "Best lamb in the city",
      text: "The whole charcoal-grilled shoulder is enough for four. Patio under the fig tree is magic at sunset.",
    },
    {
      id: "d1-r2",
      name: "Ama K.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
      rating: 5,
      date: "15 Jul 2026",
      title: "Punctual and professional",
      text: "Excellent driver. Punctual, professional, and very familiar with the area. Would definitely book again.",
    },
  ],
  d2: [
    {
      id: "d2-r1",
      name: "Kofi M.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80",
      rating: 5,
      date: "02 Aug 2026",
      title: "Luxury experience",
      text: "Smooth ride, clean car, and very professional. Highly recommend for airport transfers.",
    },
  ],
};

const MOCK_VEHICLE_REVIEWS: Record<string, Review[]> = {
  v1: [
    {
      id: "v1-r1",
      name: "Yaw B.",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80",
      rating: 5,
      date: "20 Jul 2026",
      title: "Perfect for the trip",
      text: "Vehicle worked perfectly. Owner was totally flexible and communicative with me.",
    },
  ],
  v2: [
    {
      id: "v2-r1",
      name: "Akua M.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
      rating: 5,
      date: "10 Aug 2026",
      title: "Beautiful car",
      text: "The Mercedes was in pristine condition. Pickup was smooth and the owner was very professional.",
    },
  ],
};

function computeSummary(reviews: Review[]): Summary {
  if (reviews.length === 0) {
    return { average: 0, total: 0, distribution: [0, 0, 0, 0, 0] };
  }
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const average = sum / reviews.length;
  const distribution = [0, 0, 0, 0, 0];
  reviews.forEach((review) => {
    const index = Math.min(Math.max(Math.round(review.rating) - 1, 0), 4);
    distribution[index]++;
  });
  return { average, total: reviews.length, distribution };
}

function getEntityName(driverId?: string, vehicleId?: string): string {
  if (driverId) {
    const driver = DRIVERS.find((d) => d.id === driverId);
    return driver?.name || "Driver";
  }
  if (vehicleId) {
    return "Vehicle";
  }
  return "Reviews";
}

export default function ReviewsScreen() {
  const params = useLocalSearchParams();
  const driverId = typeof params.driverId === "string" ? params.driverId : undefined;
  const vehicleId = typeof params.vehicleId === "string" ? params.vehicleId : undefined;

  const reviews = useMemo(() => {
    if (driverId) {
      return MOCK_DRIVER_REVIEWS[driverId] || MOCK_DRIVER_REVIEWS.d1 || [];
    }
    if (vehicleId) {
      return MOCK_VEHICLE_REVIEWS[vehicleId] || MOCK_VEHICLE_REVIEWS.v1 || [];
    }
    return [];
  }, [driverId, vehicleId]);

  const summary = useMemo(() => computeSummary(reviews), [reviews]);
  const entityName = useMemo(() => getEntityName(driverId, vehicleId), [driverId, vehicleId]);

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? "star" : "star-outline"}
            size={14}
            color="#FFB800"
          />
        ))}
      </View>
    );
  };

   if (reviews.length === 0) {
     return (
       <SafeAreaView style={styles.safeArea}>
         <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
           <View style={styles.header}>
             <Pressable onPress={() => router.back()} style={styles.backButton}>
               <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
             </Pressable>
             <Text style={styles.headerTitle}>Reviews</Text>
             <View style={styles.headerRight} />
           </View>
           <EmptyState
             title="No reviews yet"
             subtitle="Reviews will appear here once available."
           />
         </ScrollView>
       </SafeAreaView>
     );
   }

   return (
     <SafeAreaView style={styles.safeArea}>
       <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
         <View style={styles.header}>
           <Pressable onPress={() => router.back()} style={styles.backButton}>
             <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
           </Pressable>
           <Text style={styles.headerTitle}>Reviews</Text>
           <Pressable style={styles.writeButton} onPress={() => router.push(`/(driver)/write-review?driverId=${driverId}` as any)}>
             <Ionicons name="pencil" size={18} color="#FFFFFF" />
             <Text style={styles.writeButtonText}>Write</Text>
           </Pressable>
         </View>

        <View style={styles.summaryCard}>
          <Text style={styles.entityNameHeader}>{entityName}</Text>
          <View style={styles.summaryBody}>
            <View style={styles.summaryLeft}>
              <Text style={styles.averageRating}>{summary.average.toFixed(1)}</Text>
              {renderStars(Math.round(summary.average))}
              <Text style={styles.totalReviews}>
                {summary.total} review{summary.total !== 1 ? "s" : ""}
              </Text>
            </View>
            <View style={styles.summaryRight}>
              {summary.distribution.map((count, index) => (
                <View key={index} style={styles.distributionRow}>
                  <Text style={styles.distributionLabel}>{5 - index}</Text>
                  <View style={styles.distributionBarBg}>
                    <View
                      style={[
                        styles.distributionBarFill,
                        {
                          width: `${(count / summary.total) * 100}%`,
                          backgroundColor: count > 0 ? ORANGE : "#E5E7EB",
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.distributionCount}>{count}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.reviewsList}>
          {reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Image source={{ uri: review.avatar }} style={styles.reviewAvatar} contentFit="cover" />
                <View style={styles.reviewHeaderText}>
                  <Text style={styles.reviewerName}>{review.name}</Text>
                  {renderStars(review.rating)}
                </View>
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>
              <Text style={styles.reviewTitle}>{review.title}</Text>
              <Text style={styles.reviewComment}>{review.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingTop: 0,
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: NAVY,
  },
  headerRight: {
    width: 80,
    alignItems: "flex-end",
  },
  writeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: NAVY,
  },
  writeButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  summaryCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  entityNameHeader: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  summaryBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  summaryLeft: {
    alignItems: "center",
    gap: 8,
    minWidth: 100,
  },
  averageRating: {
    fontSize: 48,
    fontWeight: "800",
    color: NAVY,
  },
  starsRow: {
    flexDirection: "row",
    gap: 4,
  },
  star: {
    fontSize: 18,
    color: "#D1D5DB",
  },
  starActive: {
    color: "#F59E0B",
  },
  totalReviews: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  summaryRight: {
    flex: 1,
    gap: 6,
  },
  distributionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  distributionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    width: 12,
    textAlign: "center",
  },
  distributionBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  distributionBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  distributionCount: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    width: 20,
    textAlign: "right",
  },
  reviewsList: {
    gap: 12,
  },
  reviewCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  reviewHeaderText: {
    flex: 1,
    gap: 2,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "700",
    color: NAVY,
  },
  reviewDate: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: NAVY,
    marginBottom: 4,
  },
  reviewComment: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
    lineHeight: 20,
  },
});
