import { useCallback, useState } from "react";
import { router, type Href } from "expo-router";
import * as Haptics from "expo-haptics";
import { useSignUp, useSSO } from "@clerk/expo";

export type SignUpFlowState = {
  email: string;
  password: string;
  aliasName: string;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setAliasName: (name: string) => void;
  loading: boolean;
  googleLoading: boolean;
  error: string | null;
  pendingVerification: boolean;
  code: string;
  setCode: (code: string) => void;
  canSubmit: boolean;
  canVerify: boolean;
  handleSubmit: () => Promise<void>;
  handleVerify: () => Promise<void>;
  handleResendCode: () => Promise<void>;
  setPendingVerification: (pending: boolean) => void;
  handleGoogleSignUp: () => Promise<void>;
};

export function useSignUpFlow(): SignUpFlowState {
  const { signUp } = useSignUp();
  const { startSSOFlow } = useSSO();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [aliasName, setAliasName] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length >= 8;
  const canVerify = code.trim().length >= 6;

  const handleSubmit = useCallback(async () => {
    if (!signUp || !canSubmit) return;
    setError(null);
    setLoading(true);
    try {
      const { error } = await signUp.password({
        emailAddress: email.trim(),
        password,
      });
      if (error) {
        setError(error.longMessage ?? error.message);
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Error
        );
      } else {
        const { error: sendError } =
          await signUp.verifications.sendEmailCode();
        if (sendError) {
          setError(sendError.longMessage ?? sendError.message);
        } else {
          setPendingVerification(true);
          Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
        }
      }
    } catch {
      setError("Failed to create account. Please try again.");
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error
      );
    } finally {
      setLoading(false);
    }
  }, [signUp, email, password, canSubmit]);

  const handleVerify = useCallback(async () => {
    if (!signUp || !canVerify) return;
    setError(null);
    setLoading(true);
    try {
      const { error } =
        await signUp.verifications.verifyEmailCode({ code: code.trim() });
      if (error) {
        setError(error.longMessage ?? error.message);
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Error
        );
        return;
      }

      try {
        const reloadResult = signUp as any;
        if (typeof reloadResult.reload === "function") {
          await reloadResult.reload();
        }
      } catch (reloadError) {
        console.warn("Failed to reload sign-up after verify:", reloadError);
      }

      if (signUp.status === "complete") {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
        router.replace("/(driver)/location-permission" as Href);
      } else {
        setError("Verification incomplete. Please try again.");
      }
    } catch {
      setError("Invalid code. Please try again.");
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error
      );
    } finally {
      setLoading(false);
    }
  }, [signUp, code, canVerify]);

  const handleResendCode = useCallback(async () => {
    if (!signUp) return;
    try {
      await signUp.verifications.sendEmailCode();
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );
    } catch {
      setError("Failed to resend code.");
    }
  }, [signUp]);

  const handleGoogleSignUp = useCallback(async () => {
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
        router.replace("/(driver)/location-permission" as Href);
      } else {
        setError(
          "Google sign-up did not complete. Please try again or use email."
        );
      }
    } catch {
      setError("Google sign-up failed. Please try again.");
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
    aliasName,
    setEmail,
    setPassword,
    setAliasName,
    loading,
    googleLoading,
    error,
    pendingVerification,
    code,
    setCode,
    canSubmit,
    canVerify,
    handleSubmit,
    handleVerify,
    handleResendCode,
    setPendingVerification,
    handleGoogleSignUp,
  };
}
