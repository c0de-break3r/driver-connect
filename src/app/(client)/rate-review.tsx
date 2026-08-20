import { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useMutation } from "convex/react";
import { api } from "@/lib/convexApi";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/contexts/AuthProvider";
import { createCardStyle, SectionHeader } from "@/components/DesignSystem";

const NAVY = "#2C3E5B";

type CategoryRating = {
  label: string;
  value: number;
};

const CATEGORIES: CategoryRating[] = [
  { label: "Cleanliness", value: 0 },
  { label: "Communication", value: 0 },
  { label: "Punctuality", value: 0 },
  { label: "Value", value: 0 },
];

export default function RateReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ bookingId?: string }>();
  const { userId } = useAuth();
  const [overallRating, setOverallRating] = useState(0);
  const [categories, setCategories] = useState<CategoryRating[]>(CATEGORIES);
  const [reviewText, setReviewText] = useState("");

  const bookingId = params.bookingId as string | undefined;

  const createReview = useMutation(api.jobs.createReview);

  const handleSubmit = async () => {
    if (overallRating === 0) {
      Alert.alert("Rating required", "Please select an overall rating.");
      return;
    }

    if (!bookingId) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await createReview({
        bookingId: bookingId as any,
        reviewerId: userId!,
        revieweeId: "",
        rating: overallRating,
        comment: reviewText.trim() || undefined,
        categories: categories,
      });
      Alert.alert("Thank you!", "Your review has been submitted.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Error", "Unable to submit review. Please try again.");
    }
  };

  if (!bookingId) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Booking not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader title="Rate & Review" subtitle="How was your experience?" />

        <View style={createCardStyle()}>
          <Text style={styles.fieldLabel}>Overall Rating</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setOverallRating(star);
                }}
              >
                <Ionicons
                  name={star <= overallRating ? "star" : "star-outline"}
                  size={40}
                  color={star <= overallRating ? "#FFB800" : "#D1D5DB"}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={createCardStyle({ marginTop: 16 })}>
          <Text style={styles.fieldLabel}>Rate by Category</Text>
          {categories.map((cat, index) => (
            <View key={cat.label} style={styles.categoryRow}>
              <Text style={styles.categoryLabel}>{cat.label}</Text>
              <View style={styles.categoryStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      const updated = [...categories];
                      updated[index] = { ...cat, value: star };
                      setCategories(updated);
                    }}
                  >
                    <Ionicons
                      name={star <= cat.value ? "star" : "star-outline"}
                      size={24}
                      color={star <= cat.value ? "#FFB800" : "#D1D5DB"}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        <View style={createCardStyle({ marginTop: 16 })}>
          <Text style={styles.fieldLabel}>Write a Review (optional)</Text>
          <TextInput
            style={styles.reviewInput}
            placeholder="Share your experience..."
            placeholderTextColor="#9CA3AF"
            value={reviewText}
            onChangeText={setReviewText}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Review</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContent: {
    paddingTop: Platform.select({ ios: 60, android: 40 }),
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
  errorText: { fontSize: 16, fontWeight: "600", color: "#6B7280", textAlign: "center", marginTop: 60 },
  fieldLabel: { fontSize: 14, fontWeight: "700", color: NAVY, marginBottom: 12 },
  starsRow: { flexDirection: "row", justifyContent: "center", gap: 12 },
  categoryRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8 },
  categoryLabel: { fontSize: 14, fontWeight: "600", color: NAVY },
  categoryStars: { flexDirection: "row", gap: 4 },
  reviewInput: {
    backgroundColor: "#F9FAFB", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: NAVY, borderWidth: 1, borderColor: "#E5E7EB", minHeight: 120,
  },
  submitButton: { backgroundColor: NAVY, paddingVertical: 16, borderRadius: 14, alignItems: "center", marginTop: 24 },
  submitButtonText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
});
