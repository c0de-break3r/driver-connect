import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const NAVY = "#2C3E5B";

export default function CreateListingScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.iconWrap}>
          <Ionicons name="car-outline" size={64} color={NAVY} />
        </View>
        <Text style={styles.title}>Create a Listing</Text>
        <Text style={styles.subtitle}>
          This is where you&apos;ll add your vehicle details, pricing, and availability.
        </Text>
        <TouchableOpacity style={styles.ctaButton} onPress={() => router.back()}>
          <Text style={styles.ctaButtonText}>Go Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
  iconWrap: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: NAVY,
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  ctaButton: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  ctaButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
  },
});
