import { useState, useEffect } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable, TextInput, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useFavoritesStore } from "@/store/useFavoritesStore";

const NAVY = "#2C3E5B";
const GREEN = "#10B981";

export default function NameListScreen() {
  const params = useLocalSearchParams();
  const vehicleParam = params.vehicle as string | undefined;

  const createCollection = useFavoritesStore((state) => state.createCollection);
  const addVehicleToCollection = useFavoritesStore((state) => state.addVehicleToCollection);
  const setPendingVehicle = useFavoritesStore((state) => state.setPendingVehicle);
  const clearPendingVehicle = useFavoritesStore((state) => state.clearPendingVehicle);

  const [listName, setListName] = useState("");
  const [vehicle, setVehicle] = useState<any>(null);

  useEffect(() => {
    if (vehicleParam) {
      try {
        const parsed = JSON.parse(vehicleParam);
        setVehicle(parsed);
        setPendingVehicle(parsed);
      } catch {
        // ignore
      }
    }
  }, [vehicleParam, setPendingVehicle]);

  const handleCreate = () => {
    if (!listName.trim()) {
      Alert.alert("List name required", "Please enter a name for your list.");
      return;
    }
    const collection = createCollection(listName.trim());
    if (vehicle) {
      addVehicleToCollection(collection.id, vehicle.id);
    }
    clearPendingVehicle();
    router.replace(`/favorites/collection/${collection.id}`);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={NAVY} />
        </Pressable>
        <Text style={styles.headerTitle}>Name this list</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardDismissMode="on-drag">
        {/* Image Preview */}
        {vehicle && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: vehicle.image }} style={styles.previewImage} contentFit="cover" />
            <View style={styles.imageOverlay}>
              <Text style={styles.previewTitle} numberOfLines={1}>
                {vehicle.title}
              </Text>
              <Text style={styles.previewPrice}>{vehicle.price}</Text>
            </View>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>List name</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Next road trip, Dream cars"
            placeholderTextColor="#9CA3AF"
            value={listName}
            onChangeText={setListName}
            autoFocus
            maxLength={50}
          />
          <View style={styles.inputFooter}>
            <Text style={styles.inputHint}>Give your list a memorable name</Text>
            <Text style={styles.charCount}>{listName.length}/50</Text>
          </View>
        </View>

        {/* Create Button */}
        <Pressable
          style={[styles.createButton, !listName.trim() && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={!listName.trim()}
        >
          <Text style={[styles.createButtonText, !listName.trim() && styles.createButtonTextDisabled]}>
            Create list
          </Text>
        </Pressable>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: NAVY,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  imagePreview: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8,
    borderRadius: 20,
    overflow: "hidden",
    height: 160,
    backgroundColor: "#F3F4F6",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  previewPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: GREEN,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: NAVY,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: NAVY,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  inputFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  inputHint: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  charCount: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  createButton: {
    backgroundColor: NAVY,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  createButtonDisabled: {
    backgroundColor: "#F3F4F6",
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  createButtonTextDisabled: {
    color: "#9CA3AF",
  },
  bottomSpacer: {
    height: 40,
  },
});
