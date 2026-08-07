import { useRef, useState, useEffect } from "react";
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GooglePlacesAutocompleteModule from "react-native-google-places-autocomplete";
const GooglePlacesAutocompleteComponent = GooglePlacesAutocompleteModule.GooglePlacesAutocomplete;
import * as Haptics from "expo-haptics";

const NAVY = "#2C3E5B";

type Role = "driver" | "owner" | "client" | "corporate";

const ROLE_OPTIONS: { value: Role; label: string; description: string }[] = [
  { value: "driver", label: "Driver", description: "Offer driving services" },
  { value: "owner", label: "Vehicle Owner", description: "List vehicles for rent" },
  { value: "client", label: "Client", description: "Book vehicles or drivers" },
  { value: "corporate", label: "Corporate Client", description: "Fleet and corporate transport" },
];

type FieldType = "text" | "location";

type FieldConfig = {
  key: string;
  label: string;
  placeholder: string;
  type: FieldType;
};

const FIELDS_BY_ROLE: Record<Role, FieldConfig[]> = {
  driver: [
    { key: "fullName", label: "Full Name", placeholder: "Enter your full name", type: "text" },
    { key: "location", label: "Location", placeholder: "City or area", type: "location" },
  ],
  owner: [
    { key: "companyName", label: "Company or Individual Name", placeholder: "Business or personal name", type: "text" },
    { key: "location", label: "Location", placeholder: "City or area", type: "location" },
  ],
  client: [
    { key: "fullName", label: "Full Name", placeholder: "Enter your full name", type: "text" },
    { key: "location", label: "Location", placeholder: "City or area", type: "location" },
  ],
  corporate: [
    { key: "companyName", label: "Company Name", placeholder: "Organization name", type: "text" },
    { key: "location", label: "Office Location", placeholder: "City or area", type: "location" },
  ],
};

type SwitchRoleBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSelectRole: (role: Role, formData: Record<string, string>) => void;
  currentRole?: Role | null;
};

export default function SwitchRoleBottomSheet({ visible, onClose, onSelectRole, currentRole }: SwitchRoleBottomSheetProps) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const sheetAnim = useRef(new Animated.Value(0)).current;

  const reset = () => {
    setSelectedRole(null);
    setFormData({});
  };

  const openSheet = () => {
    reset();
    sheetAnim.setValue(0);
    Animated.timing(sheetAnim, {
      toValue: 1,
      duration: 420,
      useNativeDriver: true,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(sheetAnim, {
      toValue: 0,
      duration: 320,
      useNativeDriver: true,
    }).start(() => {
      reset();
      onClose();
    });
  };

  const handleRolePress = (role: Role) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedRole(role);
    setFormData({});
  };

  const handleFieldChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleContinue = () => {
    if (!selectedRole) return;
    onSelectRole(selectedRole, formData);
    closeSheet();
  };

  useEffect(() => {
    if (visible) {
      openSheet();
    }
  }, [visible]);

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={closeSheet}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeSheet}>
        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [
                {
                  translateY: sheetAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [600, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.headerRow}>
            <Text style={styles.title}>Switch Role</Text>
            <TouchableOpacity onPress={closeSheet} hitSlop={8}>
            <Ionicons name="close" size={22} color={NAVY} />
            </TouchableOpacity>
          </View>

          {!selectedRole ? (
            <ScrollView contentContainerStyle={styles.roleList} showsVerticalScrollIndicator={false}>
              {ROLE_OPTIONS.filter((option) => option.value !== currentRole).map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.roleItem}
                  activeOpacity={0.85}
                  onPress={() => handleRolePress(option.value)}
                >
                  <View>
                    <Text style={styles.roleItemLabel}>{option.label}</Text>
                    <Text style={styles.roleItemDescription}>{option.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
            >
              <ScrollView contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.formTitle}>Setup your {ROLE_OPTIONS.find((r) => r.value === selectedRole)?.label} profile</Text>
                {FIELDS_BY_ROLE[selectedRole].map((field) => (
                  <View key={field.key} style={styles.field}>
                    <Text style={styles.fieldLabel}>{field.label}</Text>
                     {field.type === "location" ? (
                       <GooglePlacesInput
                         placeholder={field.placeholder}
                         onChange={(value) => handleFieldChange(field.key, value)}
                       />
                     ) : (
                      <TextInput
                        value={formData[field.key] || ""}
                        onChangeText={(value) => handleFieldChange(field.key, value)}
                        placeholder={field.placeholder}
                        placeholderTextColor="#9CA3AF"
                        style={styles.input}
                      />
                    )}
                  </View>
                ))}
                <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.85}>
                  <Text style={styles.continueButtonText}>Continue</Text>
                </TouchableOpacity>
              </ScrollView>
            </KeyboardAvoidingView>
          )}
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

type GooglePlacesInputProps = {
  placeholder: string;
  onChange: (value: string) => void;
};

function GooglePlacesInput({ placeholder, onChange }: GooglePlacesInputProps) {
  return (
    <View style={styles.locationInput}>
      <Ionicons name="location-outline" size={18} color="#6B7280" />
      <GooglePlacesAutocompleteComponent
        placeholder={placeholder}
        fetchDetails={false}
        onPress={(data: any, details: any) => {
          if (details?.name) {
            onChange(details.name);
          } else if (data?.description) {
            onChange(data.description);
          }
        }}
        query={{
          key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "",
          language: "en",
          types: "geocode|establishment",
        }}
        styles={{
          container: styles.locationAutocompleteContainer,
          textInput: styles.locationTextInput,
          listView: styles.locationListView,
          row: styles.locationRow,
        }}
        enableHighAccuracyLocation
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: Platform.select({ ios: 32, android: 24 }),
    maxHeight: Dimensions.get("window").height * 0.85,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: NAVY,
  },
  roleList: {
    gap: 12,
    paddingBottom: 8,
  },
  roleItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  roleItemLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
  },
  roleItemDescription: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  formContent: {
    gap: 16,
    paddingBottom: 8,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: NAVY,
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: NAVY,
  },
  locationInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  locationAutocompleteContainer: {
    flex: 1,
  },
  locationTextInput: {
    flex: 1,
    fontSize: 15,
    color: NAVY,
    paddingVertical: 8,
    height: 36,
  },
  locationListView: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 4,
    maxHeight: 200,
  },
  locationRow: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  continueButton: {
    marginTop: 8,
    backgroundColor: "#111827",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
