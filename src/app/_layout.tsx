import "@/global.css";

import { ClerkProvider } from "@clerk/expo";
import { Stack } from "expo-router";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env");
}

const clerkKey: string = publishableKey;

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={clerkKey}>
      <Stack screenOptions={{ headerShown: false }} />
    </ClerkProvider>
  );
}
