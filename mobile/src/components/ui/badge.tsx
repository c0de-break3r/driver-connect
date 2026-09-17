// @ts-nocheck
import React from "react";
import { View, Text } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("flex-row items-center rounded-xl px-3 py-1.5", {
  variants: {
    variant: {
      default: "bg-primary",
      primary: "bg-[#2563EB] rounded-xl",
      secondary: "bg-secondary",
      outline: "border border-border bg-transparent",
      destructive: "bg-destructive",
      success: "bg-emerald-500 border-emerald-600",
      warning: "bg-amber-500 border-amber-600",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const badgeTextVariants = cva("text-xs font-semibold", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      primary: "text-white",
      secondary: "text-secondary-foreground",
      outline: "text-foreground",
      destructive: "text-destructive-foreground",
      success: "text-white",
      warning: "text-white",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface BadgeProps
  extends React.ComponentPropsWithoutRef<typeof View>,
    VariantProps<typeof badgeVariants> {
  className?: string;
  textClassName?: string;
  children?: React.ReactNode;
}

export function Badge({ variant, className, textClassName, children, ...props }: BadgeProps) {
  return (
    <View className={cn(badgeVariants({ variant }), className)} {...props}>
      <Text className={cn(badgeTextVariants({ variant }), textClassName)}>{children}</Text>
    </View>
  );
}
