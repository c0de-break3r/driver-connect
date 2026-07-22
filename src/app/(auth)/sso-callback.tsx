import { useAuth } from "@clerk/expo";
import { Redirect, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useRoleStore } from "@/store/useRoleStore";
import { getPostAuthRoute } from "@/lib/routing";

export default function SSOCallback() {
  const { isSignedIn, isLoaded } = useAuth();
  const role = useRoleStore((s) => s.role);
  const params = useLocalSearchParams<{
    created_session_id?: string;
    rotating_token_nonce?: string;
  }>();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      return;
    }

    if (params.rotating_token_nonce) {
      // SSO redirect landed; auth layout will redirect once
      // Clerk finishes processing the token in the background.
      return;
    }
  }, [isLoaded, isSignedIn, params.rotating_token_nonce, role]);

  if (!isLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2C3E5B" />
        <Text style={styles.text}>Completing sign-in...</Text>
      </View>
    );
  }

  if (isSignedIn) {
    return <Redirect href={getPostAuthRoute(role)} />;
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2C3E5B" />
      <Text style={styles.text}>Completing sign-in...</Text>
      <Text style={styles.hint}>
        If this takes too long, close the app and try again.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F3",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
    color: "#2C3E5B",
  },
  hint: {
    fontSize: 13,
    color: "#6E7E91",
    textAlign: "center",
  },
});
