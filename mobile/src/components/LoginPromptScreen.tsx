import { StyleSheet, Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/button";

const NAVY = "#2C3E5B";

type LoginPromptScreenProps = {
  title: string;
  subtitle: string;
  buttonText?: string;
  showMenuItems?: boolean;
  onLoginPress?: () => void;
};

export function LoginPromptScreen({
  title,
  subtitle,
  buttonText = "Log in",
  showMenuItems = false,
  onLoginPress,
}: LoginPromptScreenProps) {
  return (
    <View className="flex-1 bg-white px-6 pt-16">
      <Text className="text-3xl font-extrabold text-[#2C3E5B] mb-3">{title}</Text>
      <Text className="text-base text-[#6B7280] leading-6 mb-6">{subtitle}</Text>
      <Button onPress={onLoginPress} className="self-start">
        {buttonText}
      </Button>

      {showMenuItems && (
        <View className="mt-8">
          <Pressable className="flex-row items-center py-4 gap-4">
            <View className="w-6 items-center">
              <Ionicons name="settings-outline" size={20} color={NAVY} />
            </View>
            <Text className="flex-1 text-base font-semibold text-[#2C3E5B]">Account settings</Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </Pressable>
          <Pressable className="flex-row items-center py-4 gap-4">
            <View className="w-6 items-center">
              <Ionicons name="help-circle-outline" size={20} color={NAVY} />
            </View>
            <Text className="flex-1 text-base font-semibold text-[#2C3E5B]">Get help</Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </Pressable>
          <View style={styles.menuDivider} />
          <Pressable className="flex-row items-center py-4 gap-4">
            <View className="w-6 items-center">
              <Ionicons name="document-text-outline" size={20} color={NAVY} />
            </View>
            <Text className="flex-1 text-base font-semibold text-[#2C3E5B]">Legal</Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
  },
});
