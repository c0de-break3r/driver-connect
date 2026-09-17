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
import { Rating } from "@/components/ui/rating";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { Separator } from "@/components/ui/separator";
import { DRIVERS } from "@/data/drivers";

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
            description="Reviews will appear here once available."
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
          <Button size="sm" onPress={() => router.push(`/(driver)/write-review?driverId=${driverId}` as any)} className="rounded-full">
            <Ionicons name="pencil" size={18} color="#FFFFFF" />
            <Text style={styles.writeButtonText}>Write</Text>
          </Button>
        </View>

        <Card className="mb-6">
          <CardContent>
            <Text style={styles.entityNameHeader}>{entityName}</Text>
            <View style={styles.summaryBody}>
              <View style={styles.summaryLeft}>
                <Text style={styles.averageRating}>{summary.average.toFixed(1)}</Text>
                <Rating value={Math.round(summary.average)} readOnly size="md" />
                <Text style={styles.totalReviews}>
                  {summary.total} review{summary.total !== 1 ? "s" : ""}
                </Text>
              </View>
              <View style={styles.summaryRight}>
                {summary.distribution.map((count, index) => (
                  <View key={index} style={styles.distributionRow}>
                    <Text style={styles.distributionLabel}>{5 - index}</Text>
                    <View style={styles.distributionBarBg}>
                      <Progress
                        value={summary.total > 0 ? (count / summary.total) * 100 : 0}
                        className="h-2"
                        indicatorClassName="bg-orange-500"
                      />
                    </View>
                    <Text style={styles.distributionCount}>{count}</Text>
                  </View>
                ))}
              </View>
            </View>
          </CardContent>
        </Card>

        <View style={styles.reviewsList}>
          {reviews.map((review) => (
            <Card key={review.id} className="mb-3">
              <CardContent>
                <View style={styles.reviewHeader}>
                  <Avatar src={review.avatar} fallback={review.name[0]} size="md" />
                  <View style={styles.reviewHeaderText}>
                    <Text style={styles.reviewerName}>{review.name}</Text>
                    <Rating value={review.rating} readOnly size="sm" />
                  </View>
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </View>
                <Text style={styles.reviewTitle}>{review.title}</Text>
                <Text style={styles.reviewComment}>{review.text}</Text>
              </CardContent>
            </Card>
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
    color: "#2C3E5B",
  },
  headerRight: {
    width: 80,
    alignItems: "flex-end",
  },
  writeButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
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
    color: "#2C3E5B",
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
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  reviewHeaderText: {
    flex: 1,
    gap: 2,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2C3E5B",
  },
  reviewDate: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2C3E5B",
    marginBottom: 4,
  },
  reviewComment: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
    lineHeight: 20,
  },
});
