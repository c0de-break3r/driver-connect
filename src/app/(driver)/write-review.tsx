import { useState } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import { DRIVERS } from "@/data/drivers";

const NAVY = "#2C3E5B";
const ORANGE = "#F97316";

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

         <View style={styles.entityCard}>
           <Text style={styles.entityName}>{entityName}</Text>
           <Text style={styles.entityMeta}>{entityMeta}</Text>
         </View>

         <View style={styles.section}>
           <Text style={styles.sectionLabel}>How was the experience?</Text>
           <View style={styles.starsRow}>
             {[1, 2, 3, 4, 5].map((star) => (
               <Pressable key={star} onPress={() => setRating(star)}>
                 <Ionicons
                   name={star <= rating ? "star" : "star-outline"}
                   size={48}
                   color={star <= rating ? ORANGE : "#D1D5DB"}
                 />
               </Pressable>
             ))}
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
                 <Pressable
                   key={tag}
                   style={[styles.tag, isSelected && styles.tagSelected]}
                   onPress={() => toggleTag(tag)}
                 >
                   <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>{tag}</Text>
                 </Pressable>
               );
             })}
           </View>
         </View>

         <View style={styles.section}>
           <Text style={styles.sectionLabel}>Headline</Text>
           <TextInput
             style={styles.input}
             placeholder="Punctual, professional, and great to ride with"
             placeholderTextColor="#9CA3AF"
             value={headline}
             onChangeText={setHeadline}
             maxLength={100}
           />
         </View>

         <View style={styles.section}>
           <Text style={styles.sectionLabel}>Tell us more</Text>
           <TextInput
             style={[styles.input, styles.textArea]}
             placeholder="What made this trip stand out? Would you book again?"
             placeholderTextColor="#9CA3AF"
             value={reviewText}
             onChangeText={setReviewText}
             multiline
             numberOfLines={6}
             textAlignVertical="top"
           />
         </View>

        <Pressable style={styles.postButton} onPress={handlePostReview}>
          <Text style={styles.postButtonText}>Post review</Text>
        </Pressable>
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
  entityCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  entityName: {
    fontSize: 20,
    fontWeight: "800",
    color: NAVY,
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
    color: NAVY,
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
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
  tag: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tagSelected: {
    backgroundColor: "#FEF3C7",
    borderColor: ORANGE,
  },
  tagText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  tagTextSelected: {
    color: ORANGE,
    fontWeight: "700",
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    fontWeight: "500",
    color: NAVY,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  textArea: {
    minHeight: 120,
  },
  postButton: {
    backgroundColor: NAVY,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
