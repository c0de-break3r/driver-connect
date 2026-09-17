import { useState, useRef, useEffect } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthProvider";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convexApi";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatBubble } from "@/components/ui/chat-bubble";
import { EmptyState } from "@/components/ui/empty-state";

const NAVY = "#2C3E5B";

export default function BookingChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ bookingId?: string }>();
  const { userId } = useAuth();
  const [message, setMessage] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  const bookingId = params.bookingId as string | undefined;
  const messages = useQuery(api.messages.getBookingMessages, bookingId ? { bookingId: bookingId as any } : "skip");
  const sendMsg = useMutation(api.messages.sendMessage);
  const markAsRead = useMutation(api.messages.markMessagesAsRead);

  useEffect(() => {
    if (bookingId && userId) markAsRead({ bookingId: bookingId as any, receiverId: userId });
  }, [bookingId, userId]);

  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !bookingId || !userId) return;
    const receiverId = messages?.find((m) => m.senderId !== userId)?.senderId || "";
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await sendMsg({ bookingId: bookingId as any, senderId: userId, receiverId, content: message.trim() });
      setMessage("");
    } catch {
      Alert.alert("Error", "Unable to send message. Please try again.");
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
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!messages ? (
          <Text style={styles.loadingText}>Loading messages...</Text>
        ) : messages.length === 0 ? (
          <EmptyState
            icon="chatbubble-outline"
            title="No messages yet"
            description="Start a conversation about this booking."
            className="py-20"
          />
        ) : (
          messages.map((msg) => {
            const isSelf = msg.senderId === userId;
            return (
              <ChatBubble
                key={msg._id}
                variant={isSelf ? "sent" : "received"}
                timestamp={new Date(msg.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                className="mb-2"
              >
                <Text className={isSelf ? "text-white text-base font-medium" : "text-gray-800 text-base font-medium"}>{msg.content}</Text>
              </ChatBubble>
            );
          })
        )}
      </ScrollView>

      <View style={styles.inputBar}>
        <Input
          placeholder="Type a message..."
          placeholderTextColor="#9CA3AF"
          value={message}
          onChangeText={setMessage}
          onSubmitEditing={handleSend}
          className="flex-1 bg-gray-50 border-gray-200 rounded-full"
        />
        <Button
          onPress={handleSend}
          size="icon"
          disabled={!message.trim()}
          className="w-10 h-10 rounded-full bg-gray-800 disabled:bg-gray-400"
        >
          <Ionicons name="send" size={18} color="#FFFFFF" />
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContent: {
    paddingTop: Platform.select({ ios: 60, android: 40 }),
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  loadingText: { fontSize: 15, fontWeight: "600", color: "#6B7280", textAlign: "center", marginTop: 60 },
  inputBar: {
    flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#FFFFFF",
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#E5E7EB",
    paddingHorizontal: 16, paddingVertical: 12, paddingBottom: Platform.select({ ios: 24, android: 16 }),
  },
  errorText: { fontSize: 16, fontWeight: "600", color: "#6B7280", textAlign: "center", marginTop: 60 },
});
