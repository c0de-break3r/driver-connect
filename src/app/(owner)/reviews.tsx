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
import { Card } from "@/components/ui/card";
import { Rating } from "@/components/ui/rating";
import { Avatar } from "@/components/ui/avatar";
import EmptyState from "@/components/EmptyState";

const NAVY = "#2C3E5B";

export default function OwnerReviewsScreen() {
  const { userId } = useAuth();
  const convexUser = useQuery(
    api.users.getByUserId,
    userId ? { userId } : "skip",
  );

  const reviews = useQuery(
    api.jobs.getOwnerReviews,
    convexUser?._id ? { ownerId: convexUser._id } : "skip",
  );

  const averageRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / reviews.length;
  }, [reviews]);

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
          subtitle="Reviews from your guests will appear here once they complete their stays."
        />
      ) : (
        <>
          <Card className="items-center gap-2 mb-6">
            <Text style={styles.averageRating}>{averageRating.toFixed(1)}</Text>
            <Rating value={Math.round(averageRating)} size="md" readOnly />
            <Text style={styles.totalReviews}>
              {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </Text>
          </Card>

          <View style={styles.reviewsList}>
            {reviews.map((review) => (
              <Card key={review._id} className="gap-3">
                <View style={styles.reviewHeader}>
                  <Avatar
                    size="sm"
                    fallback={review.reviewerId[0]?.toUpperCase() ?? "U"}
                    className="bg-navy"
                  />
                  <View style={styles.reviewHeaderText}>
                    <Text style={styles.reviewerName}>Guest</Text>
                    <Rating value={review.rating} size="sm" readOnly />
                  </View>
                  <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
                </View>
                {review.comment ? (
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                ) : null}
              </Card>
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
  averageRating: {
    fontSize: 48,
    fontWeight: "800",
    color: NAVY,
  },
  totalReviews: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  reviewsList: {
    gap: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
