import { useState, useRef, useEffect } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthProvider";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convexApi";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";

const NAVY = "#2C3E5B";

export default function BookingChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ bookingId?: string }>();
  const { userId } = useAuth();
  const [message, setMessage] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  const bookingId = params.bookingId as string | undefined;

  const messages = useQuery(
    api.messages.getBookingMessages,
    bookingId ? { bookingId: bookingId as any } : "skip"
  );

  const sendMsg = useMutation(api.messages.sendMessage);
  const markAsRead = useMutation(api.messages.markMessagesAsRead);

  useEffect(() => {
    if (bookingId && userId) {
      markAsRead({ bookingId: bookingId as any, receiverId: userId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId, userId]);

  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !bookingId || !userId) return;

    const receiverId = messages?.find((m) => m.senderId !== userId)?.senderId || "";

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await sendMsg({
        bookingId: bookingId as any,
        senderId: userId,
        receiverId,
        content: message.trim(),
      });
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
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptySubtitle}>
              Start a conversation about this booking.
            </Text>
          </View>
        ) : (
          messages.map((msg) => {
            const isSelf = msg.senderId === userId;
            return (
              <View
                key={msg._id}
                style={[styles.messageBubble, isSelf ? styles.selfBubble : styles.otherBubble]}
              >
                <Text style={[styles.messageText, isSelf && styles.selfMessageText]}>
                  {msg.content}
                </Text>
                <Text style={[styles.messageTime, isSelf && styles.selfMessageTime]}>
                  {new Date(msg.createdAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#9CA3AF"
          value={message}
          onChangeText={setMessage}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!message.trim()}
        >
          <Ionicons name="send" size={20} color="#FFFFFF" />
        </TouchableOpacity>
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
  emptyWrap: { alignItems: "center", paddingVertical: 80 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: NAVY, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, fontWeight: "500", color: "#6B7280", textAlign: "center" },
  messageBubble: { maxWidth: "75%", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 8 },
  selfBubble: { alignSelf: "flex-end", backgroundColor: NAVY, borderBottomRightRadius: 4 },
  otherBubble: { alignSelf: "flex-start", backgroundColor: "#F3F4F6", borderBottomLeftRadius: 4 },
  messageText: { fontSize: 14, fontWeight: "500", color: NAVY, lineHeight: 20 },
  selfMessageText: { color: "#FFFFFF" },
  messageTime: { fontSize: 11, fontWeight: "500", color: "#9CA3AF", marginTop: 4, textAlign: "right" },
  selfMessageTime: { color: "rgba(255,255,255,0.7)" },
  inputBar: {
    flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#FFFFFF",
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#E5E7EB",
    paddingHorizontal: 16, paddingVertical: 12, paddingBottom: Platform.select({ ios: 24, android: 16 }),
  },
  input: {
    flex: 1, backgroundColor: "#F9FAFB", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 15, color: NAVY, borderWidth: 1, borderColor: "#E5E7EB",
  },
  sendButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: NAVY, alignItems: "center", justifyContent: "center" },
  sendButtonDisabled: { backgroundColor: "#9CA3AF" },
  errorText: { fontSize: 16, fontWeight: "600", color: "#6B7280", textAlign: "center", marginTop: 60 },
});
