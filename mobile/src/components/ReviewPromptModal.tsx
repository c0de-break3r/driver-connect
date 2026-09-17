import { useState, useRef, useEffect } from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const NAVY = "#2C3E5B";
const GOLD = "#F59E0B";

interface ReviewPromptModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  revieweeName: string;
}

export default function ReviewPromptModal({
  visible,
  onClose,
  onSubmit,
  revieweeName,
}: ReviewPromptModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setRating(0);
      setComment("");
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleStarPress = (star: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRating(star);
  };

  const handleSubmit = () => {
    if (rating === 0) return;
    onSubmit(rating, comment);
    setRating(0);
    setComment("");
  };

  const handleClose = () => {
    setRating(0);
    setComment("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          <Text className="text-xl font-extrabold text-[#2C3E5B] text-center">How was your experience?</Text>
          <Text className="text-sm font-medium text-[#6B7280] text-center">Rate your experience with {revieweeName}</Text>

          <View className="flex-row justify-center gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => handleStarPress(star)}
                activeOpacity={0.7}
              >
                <Text style={[styles.star, star <= rating && styles.starActive]}>
                  {star <= rating ? "★" : "☆"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            className="bg-[#F3F4F6] rounded-xl px-4 py-3.5 text-base font-medium text-[#2C3E5B] min-h-[100px] text-top"
            placeholder="Share your experience (optional)"
            placeholderTextColor="#9CA3AF"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            maxLength={500}
          />

          <View className="flex-row gap-3">
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Button onPress={handleSubmit} disabled={rating === 0} className="flex-1">
              Submit
            </Button>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 360,
    gap: 16,
  },
  star: {
    fontSize: 40,
    color: "#D1D5DB",
  },
  starActive: {
    color: GOLD,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
  },
});
