import { useCallback, useState } from "react";
import * as Haptics from "expo-haptics";
import { useSignIn, useSSO } from "@clerk/expo";

import { navigatePostAuth } from "@/lib/routing";

export type SignInFlowState = {
  email: string;
  password: string;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  loading: boolean;
  googleLoading: boolean;
  error: string | null;
  canSubmit: boolean;
  handleSubmit: () => Promise<void>;
  handleGoogleSignIn: () => Promise<void>;
};

export function useSignInFlow(): SignInFlowState {
  const { signIn } = useSignIn();
  const { startSSOFlow } = useSSO();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0;

  const handleSubmit = useCallback(async () => {
    if (!signIn || !canSubmit) return;
    setError(null);
    setLoading(true);
    try {
      const { error } = await signIn.password({
        identifier: email.trim(),
        password,
      });
      if (error) {
        setError(error.longMessage ?? error.message);
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Error
        );
      } else if (signIn.status === "complete") {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
        navigatePostAuth();
      } else {
        setError("Sign-in incomplete. Please try again.");
      }
    } catch {
      setError("Failed to sign in. Please try again.");
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error
      );
    } finally {
      setLoading(false);
    }
  }, [signIn, email, password, canSubmit]);

  const handleGoogleSignIn = useCallback(async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const result = await startSSOFlow({
        strategy: "oauth_google",
      });

      const createdSessionId = result?.createdSessionId;
      if (createdSessionId) {
        await result.setActive?.({ session: createdSessionId });
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
        navigatePostAuth();
      } else {
        setError(
          "Google sign-in did not complete. Please try again or use email."
        );
      }
    } catch {
      setError("Google sign-in failed. Please try again.");
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error
      );
    } finally {
      setGoogleLoading(false);
    }
  }, [startSSOFlow]);

  return {
    email,
    password,
    setEmail,
    setPassword,
    loading,
    googleLoading,
    error,
    canSubmit,
    handleSubmit,
    handleGoogleSignIn,
  };
}
