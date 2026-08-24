import { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useMutation } from "convex/react";
import { api } from "@/lib/convexApi";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/contexts/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Rating } from "@/components/ui/rating";

const NAVY = "#2C3E5B";

type CategoryRating = { label: string; value: number };

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
    if (overallRating === 0) { alert("Please select an overall rating."); return; }
    if (!bookingId) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await createReview({
        bookingId: bookingId as any, reviewerId: userId!, revieweeId: "",
        rating: overallRating, comment: reviewText.trim() || undefined, categories,
      });
      alert("Thank you! Your review has been submitted.");
      router.back();
    } catch {
      alert("Unable to submit review. Please try again.");
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
        <Text className="text-lg font-extrabold mb-1" style={{ color: NAVY }}>Rate & Review</Text>
        <Text className="text-sm font-medium text-gray-500 mb-6">How was your experience?</Text>

        <Card className="bg-gray-50 border-gray-200 mb-4 items-center">
          <Text className="text-sm font-bold mb-3" style={{ color: NAVY }}>Overall Rating</Text>
          <Rating value={overallRating} onChange={(val) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setOverallRating(val); }} size="lg" />
        </Card>

        <Card className="bg-gray-50 border-gray-200 mb-4">
          <Text className="text-sm font-bold mb-4" style={{ color: NAVY }}>Rate by Category</Text>
          {categories.map((cat, index) => (
            <View key={cat.label} className="flex-row items-center justify-between py-2">
              <Text className="text-sm font-semibold" style={{ color: NAVY }}>{cat.label}</Text>
              <Rating
                value={cat.value}
                onChange={(val) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  const updated = [...categories];
                  updated[index] = { ...cat, value: val };
                  setCategories(updated);
                }}
                size="sm"
              />
            </View>
          ))}
        </Card>

        <Card className="bg-gray-50 border-gray-200 mb-6">
          <Text className="text-sm font-bold mb-3" style={{ color: NAVY }}>Write a Review (optional)</Text>
          <TextInput
            placeholder="Share your experience..."
            placeholderTextColor="#9CA3AF"
            value={reviewText}
            onChangeText={setReviewText}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-base flex-1 min-h-[120px]"
          />
        </Card>

        <Button onPress={handleSubmit} className="rounded-xl py-4">
          <Text className="text-sm font-bold text-white">Submit Review</Text>
        </Button>
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
});
