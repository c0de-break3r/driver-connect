import { useState, useEffect } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import { useHomeStore } from "@/store/useHomeStore";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useToast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const NAVY = "#2C3E5B";
const GREEN = "#10B981";

export const options = { animation: "slide_from_left" };

export default function NameListScreen() {
  const params = useLocalSearchParams();
  const vehicleParam = params.vehicle as string | undefined;

  const createCollection = useFavoritesStore((state) => state.createCollection);
  const addVehicleToCollection = useFavoritesStore((state) => state.addVehicleToCollection);
  const setPendingVehicle = useFavoritesStore((state) => state.setPendingVehicle);
  const clearPendingVehicle = useFavoritesStore((state) => state.clearPendingVehicle);
  const setActiveTab = useHomeStore((state) => state.setActiveTab);

  const [listName, setListName] = useState("");
  const [vehicle, setVehicle] = useState<any>(null);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    if (vehicleParam) {
      try {
        const parsed = JSON.parse(vehicleParam);
        setVehicle(parsed);
        setPendingVehicle(parsed);
      } catch { /* ignore */ }
    }
  }, [vehicleParam, setPendingVehicle]);

  const handleCreate = () => {
    if (!listName.trim()) { showToast("Please enter a name for your list.", "warning"); return; }
    const collection = createCollection(listName.trim());
    if (vehicle) addVehicleToCollection(collection.id, vehicle);
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
        <Button variant="ghost" size="icon" onPress={() => { setActiveTab("favorites"); router.replace("/home"); }} className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200">
          <Ionicons name="arrow-back" size={22} color={NAVY} />
        </Button>
        <Text className="text-lg font-extrabold text-center flex-1" style={{ color: NAVY, letterSpacing: -0.3 }}>Name this list</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardDismissMode="on-drag">
        {vehicle && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: vehicle.image }} style={styles.previewImage} contentFit="cover" />
            <View style={styles.imageOverlay}>
              <Text style={styles.previewTitle} numberOfLines={1}>{vehicle.title}</Text>
              <Text style={styles.previewPrice}>{vehicle.price}</Text>
            </View>
          </View>
        )}

        <View style={styles.inputContainer}>
          <Text className="text-sm font-semibold mb-2" style={{ color: NAVY }}>List name</Text>
          <Input
            placeholder="Ex: Next road trip, Dream cars"
            placeholderTextColor="#9CA3AF"
            value={listName}
            onChangeText={setListName}
            autoFocus
            maxLength={50}
            className="bg-gray-50 border-gray-200 rounded-xl"
          />
          <View className="flex-row items-center justify-between mt-2">
            <Text className="text-xs font-medium text-gray-500">Give your list a memorable name</Text>
            <Text className="text-xs font-semibold text-gray-400">{listName.length}/50</Text>
          </View>
        </View>

        <Button onPress={handleCreate} disabled={!listName.trim()} className={`rounded-xl py-4 mt-6 ${!listName.trim() ? "bg-gray-200" : ""}`}>
          <Text className={`text-base font-bold ${listName.trim() ? "text-white" : "text-gray-400"}`}>Create list</Text>
        </Button>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 48, paddingBottom: 16 },
  headerRight: { width: 40 },
  content: { flex: 1, paddingHorizontal: 20 },
  imagePreview: { alignItems: "center", marginBottom: 24, marginTop: 8, borderRadius: 20, overflow: "hidden", height: 160, backgroundColor: "#F3F4F6" },
  previewImage: { width: "100%", height: "100%" },
  imageOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: "rgba(0,0,0,0.35)" },
  previewTitle: { fontSize: 18, fontWeight: "800", color: "#FFFFFF", marginBottom: 4 },
  previewPrice: { fontSize: 15, fontWeight: "700", color: GREEN },
  inputContainer: { marginBottom: 24 },
  bottomSpacer: { height: 40 },
});
