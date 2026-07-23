import "@/global.css";

import { ClerkProvider } from "@clerk/expo";
import { ConvexProvider } from "convex/react";
import { Stack } from "expo-router";

import { convex } from "@/lib/convex";
import { useConvexRoleSync } from "@/hooks/useConvexRoleSync";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env");
}

const clerkKey: string = publishableKey;

export default function RootLayout() {
  useConvexRoleSync();

  return (
    <ConvexProvider client={convex}>
      <ClerkProvider publishableKey={clerkKey}>
        <Stack screenOptions={{ headerShown: false }} />
      </ClerkProvider>
    </ConvexProvider>
  );
}

export const unstable_settings = {
  initialRouteName: "index",
};
