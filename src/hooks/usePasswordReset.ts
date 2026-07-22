import { useSignIn } from "@clerk/expo";
import * as Haptics from "expo-haptics";
import { useCallback, useState } from "react";

import { navigatePostAuth } from "@/lib/routing";

export type PasswordResetPhase = "email" | "code" | "password" | "success";

export function usePasswordReset() {
  const { signIn, fetchStatus } = useSignIn();

  const [phase, setPhase] = useState<PasswordResetPhase>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isFetching = fetchStatus === "fetching";

  const handleSendCode = useCallback(async () => {
    if (!email.trim() || !signIn) return;
    setError(null);

    try {
      const { error: createError } = await signIn.create({
        identifier: email.trim(),
      });

      if (createError) {
        setError(createError.longMessage ?? createError.message);
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Error
        );
        return;
      }

      const { error: sendError } =
        await signIn.resetPasswordEmailCode.sendCode();

      if (sendError) {
        setError(sendError.longMessage ?? sendError.message);
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Error
        );
        return;
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPhase("code");
    } catch {
      setError("Something went wrong.");
    }
  }, [signIn, email]);

  const handleVerifyCode = useCallback(async () => {
    if (!code.trim() || !signIn) return;
    setError(null);

    try {
      const { error: verifyError } =
        await signIn.resetPasswordEmailCode.verifyCode({
          code: code.trim(),
        });

      if (verifyError) {
        setError(verifyError.longMessage ?? verifyError.message);
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Error
        );
        return;
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPhase("password");
    } catch {
      setError("Invalid code.");
    }
  }, [signIn, code]);

  const handleResetPassword = useCallback(async () => {
    if (!password || !signIn) return;
    setError(null);

    try {
      const { error: resetError } =
        await signIn.resetPasswordEmailCode.submitPassword({
          password,
          signOutOfOtherSessions: true,
        });

      if (resetError) {
        setError(resetError.longMessage ?? resetError.message);
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Error
        );
        return;
      }

      if (signIn.status === "complete") {
        const { error: finalizeError } = await signIn.finalize({
          navigate: ({ session }) => {
            if (session?.currentTask) {
              return;
            }
            navigatePostAuth();
          },
        });

        if (finalizeError) {
          setError(finalizeError.longMessage ?? finalizeError.message);
          Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error
          );
          return;
        }
      }

      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );
      setPhase("success");
    } catch {
      setError("Something went wrong.");
    }
  }, [signIn, password]);

  const handleResendCode = handleSendCode;

  const getTitle = useCallback(() => {
    switch (phase) {
      case "email":
        return "Reset your password";
      case "code":
        return "Enter verification code";
      case "password":
        return "Create new password";
      case "success":
        return "Password updated";
    }
  }, [phase]);

  const getSubtitle = useCallback(() => {
    switch (phase) {
      case "email":
        return "Enter your email and we'll send you a reset code.";
      case "code":
        return `We sent a 6-digit code to ${email}.`;
      case "password":
        return "Choose a strong new password for your account.";
      case "success":
        return "Your password has been reset. Sign in to continue.";
    }
  }, [phase, email]);

  const getButtonLabel = useCallback(() => {
    switch (phase) {
      case "email":
        return "Send reset code";
      case "code":
        return "Verify code";
      case "password":
        return "Reset password";
      case "success":
        return "Sign in";
    }
  }, [phase]);

  const handleAction = useCallback(() => {
    switch (phase) {
      case "email":
        return handleSendCode();
      case "code":
        return handleVerifyCode();
      case "password":
        return handleResetPassword();
      case "success":
        return;
    }
  }, [phase, handleSendCode, handleVerifyCode, handleResetPassword]);

  const isActionDisabled =
    (phase === "email" && !email.trim()) ||
    (phase === "code" && !code.trim()) ||
    (phase === "password" && !password);

  return {
    phase,
    setPhase,
    email,
    setEmail,
    code,
    setCode,
    password,
    setPassword,
    error,
    isFetching,
    handleSendCode,
    handleVerifyCode,
    handleResetPassword,
    handleResendCode,
    handleAction,
    getTitle,
    getSubtitle,
    getButtonLabel,
    isActionDisabled,
  };
}
