import { useEffect } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const NAVY = "#2C3E5B";

type ToastType = "success" | "error" | "info" | "warning";

type ToastProps = {
  visible: boolean;
  message: string;
  type?: ToastType;
  onHide?: () => void;
  duration?: number;
};

const ICONS: Record<ToastType, { name: any; color: string }> = {
  success: { name: "checkmark-circle", color: "#10B981" },
  error: { name: "close-circle", color: "#EF4444" },
  info: { name: "help-circle", color: "#3B82F6" },
  warning: { name: "alert-circle", color: "#F59E0B" },
};

export default function Toast({ visible, message, type = "success", onHide, duration = 2500 }: ToastProps) {
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 180,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }).start(() => {
          onHide?.();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, message, duration, onHide, animatedValue]);

  if (!visible) return null;

  const icon = ICONS[type];

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-30, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View className="bg-white rounded-2xl px-4 py-3.5 flex-row items-center gap-3 shadow-lg border border-[#E5E7EB]">
        <View className="w-7 h-7 rounded-full bg-[#F3F4F6] items-center justify-center border border-[#E5E7EB]">
          <Ionicons name={icon.name} size={16} color={icon.color} />
        </View>
        <Text className="flex-1 text-sm font-bold text-[#2C3E5B]" numberOfLines={2}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
});
