import { type ReactNode } from "react";
import { View, type ViewStyle } from "react-native";

type CardProps = {
  children: ReactNode;
  className?: string;
  style?: ViewStyle;
};

/**
 * Surface card matching the reference:
 * bg-card (#FFF), border-border, rounded-2xl (16px), p-5.
 */
export function Card({ children, className = "", style }: CardProps) {
  return (
    <View
      className={`bg-card border border-border rounded-2xl p-5 ${className}`}
      style={style}
    >
      {children}
    </View>
  );
}
