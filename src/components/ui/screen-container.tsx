import { type ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenContainerProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Wraps a screen in a SafeAreaView with the app background color.
 * Uses inline styles per AGENTS.md style exception rules for SafeAreaView.
 */
export function ScreenContainer({ children, className }: ScreenContainerProps) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF8F3" }}>
      {children}
    </SafeAreaView>
  );
}
