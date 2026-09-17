import { useState } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import { DRIVERS } from "@/data/drivers";
import { Rating } from "@/components/ui/rating";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const TAG_OPTIONS = [
  "Punctuality",
  "Clean vehicle",
  "Professional",
  "Safe driving",
  "Good communication",
  "Comfortable ride",
  "Local knowledge",
  "Flexible",
];

export default function WriteReviewScreen() {
  const params = useLocalSearchParams();
  const driverId = typeof params.driverId === "string" ? params.driverId : undefined;

  const driver = driverId ? DRIVERS.find((d) => d.id === driverId) : null;
  const entityName = driver?.name || "Driver";
  const entityMeta = driver?.location || "Accra, Ghana";

  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [headline, setHeadline] = useState("");
  const [reviewText, setReviewText] = useState("");
  const toast = useToast();

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handlePostReview = () => {
    if (rating === 0) {
      toast.showToast("Please select a rating", "warning");
      return;
    }
    if (!headline.trim()) {
      toast.showToast("Please add a headline", "warning");
      return;
    }
    toast.showToast("Review posted successfully", "success");
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Write a review</Text>
          <View style={styles.headerRight} />
        </View>

        <Card className="mb-7">
          <CardContent>
            <Text style={styles.entityName}>{entityName}</Text>
            <Text style={styles.entityMeta}>{entityMeta}</Text>
          </CardContent>
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>How was the experience?</Text>
          <View style={styles.starsRow}>
            <Rating value={rating} onChange={setRating} size="lg" />
          </View>
          {rating > 0 && (
            <Text style={styles.ratingLabel}>
              {rating === 1 ? "Poor" : rating === 2 ? "Fair" : rating === 3 ? "Good" : rating === 4 ? "Very good" : "Loved it"}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>What stood out?</Text>
          <View style={styles.tagsContainer}>
            {TAG_OPTIONS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <Chip
                  key={tag}
                  selected={isSelected}
                  onPress={() => toggleTag(tag)}
                  textClassName={isSelected ? "text-orange-600 font-bold" : "text-gray-500"}
                  className={isSelected ? "bg-amber-100 border-orange-400" : "bg-gray-100 border-gray-200"}
                >
                  {tag}
                </Chip>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Headline</Text>
          <Input
            value={headline}
            onChangeText={setHeadline}
            placeholder="Punctual, professional, and great to ride with"
            maxLength={100}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Tell us more</Text>
          <Textarea
            value={reviewText}
            onChangeText={setReviewText}
            placeholder="What made this trip stand out? Would you book again?"
            numberOfLines={6}
          />
        </View>

        <Button onPress={handlePostReview} className="mt-2">
          Post review
        </Button>
      </ScrollView>
      <Toast visible={toast.toast.visible} message={toast.toast.message} type={toast.toast.type} onHide={toast.hideToast} />
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
  content: {
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
  entityName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2C3E5B",
    marginBottom: 4,
  },
  entityMeta: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C3E5B",
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
    marginTop: 12,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
});
