import { useQuery } from "convex/react";
import { api } from "@/lib/convexApi";
import { useAuth } from "@/contexts/AuthProvider";
import { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import EmptyState from "@/components/EmptyState";

const NAVY = "#2C3E5B";

export default function DriverReviewsScreen() {
  const { userId } = useAuth();
  const convexUser = useQuery(
    api.users.getByUserId,
    userId ? { userId } : "skip",
  );

  const reviews = useQuery(
    api.jobs.getDriverReviews,
    convexUser?._id ? { driverId: convexUser._id } : "skip",
  );

  const averageRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / reviews.length;
  }, [reviews]);

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Text key={star} style={[styles.star, star <= rating && styles.starActive]}>
            {star <= rating ? "★" : "☆"}
          </Text>
        ))}
      </View>
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Reviews</Text>
      </View>

      {!reviews || reviews.length === 0 ? (
        <EmptyState
          title="No reviews yet"
          subtitle="Reviews from clients will appear here once you complete jobs."
        />
      ) : (
        <>
          <View style={styles.summaryCard}>
            <Text style={styles.averageRating}>{averageRating.toFixed(1)}</Text>
            {renderStars(Math.round(averageRating))}
            <Text style={styles.totalReviews}>
              {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </Text>
          </View>

          <View style={styles.reviewsList}>
            {reviews.map((review) => (
              <View key={review._id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewerAvatar}>
                    <Text style={styles.reviewerInitial}>
                      {review.reviewerId[0]?.toUpperCase() ?? "U"}
                    </Text>
                  </View>
                  <View style={styles.reviewHeaderText}>
                    <Text style={styles.reviewerName}>Client</Text>
                    {renderStars(review.rating)}
                  </View>
                  <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
                </View>
                {review.comment ? (
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                ) : null}
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 0,
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  headerRow: {
    marginTop: 10,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
  },
  summaryCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
  reviewerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: NAVY,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewerInitial: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
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
  reviewComment: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    lineHeight: 20,
  },
});
