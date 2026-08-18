import { useRef, useEffect } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

const NAVY = "#2C3E5B";

type PlateScanBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  onTakePhoto: () => void;
  onChoosePhoto: () => void;
};

export default function PlateScanBottomSheet({
  visible,
  onClose,
  onTakePhoto,
  onChoosePhoto,
}: PlateScanBottomSheetProps) {
  const sheetAnim = useRef(new Animated.Value(0)).current;

  const openSheet = () => {
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
      onClose();
    });
  };

  const handlePress = (action: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    action();
    closeSheet();
  };

  useEffect(() => {
    if (visible) {
      openSheet();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            <Text style={styles.title}>Scan License Plate</Text>
            <TouchableOpacity onPress={closeSheet} hitSlop={8}>
              <Ionicons name="close" size={22} color={NAVY} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.optionList} showsVerticalScrollIndicator={false}>
            <TouchableOpacity style={styles.optionItem} onPress={() => handlePress(onTakePhoto)}>
              <View style={styles.optionIconWrap}>
                <Ionicons name="camera" size={22} color={NAVY} />
              </View>
              <View style={styles.optionTextWrap}>
                <Text style={styles.optionLabel}>Take Photo</Text>
                <Text style={styles.optionSub}>Use your camera to capture the plate</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem} onPress={() => handlePress(onChoosePhoto)}>
              <View style={styles.optionIconWrap}>
                <Ionicons name="images" size={22} color={NAVY} />
              </View>
              <View style={styles.optionTextWrap}>
                <Text style={styles.optionLabel}>Choose Photo</Text>
                <Text style={styles.optionSub}>Pick an existing photo from your gallery</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
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
    paddingBottom: 32,
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
  optionList: {
    gap: 12,
    paddingBottom: 8,
  },
  optionItem: {
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
  optionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  optionTextWrap: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
  },
  optionSub: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
});
